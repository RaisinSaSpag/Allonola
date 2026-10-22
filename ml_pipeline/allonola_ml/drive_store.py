"""Google Drive storage for trained models and data.

Layout inside your Drive folder
    <root folder>/
        latest.json                  <- pointer {"run_id": "..."}
        runs/<run_id>/manifest.json
        runs/<run_id>/<model>/model.joblib, metadata.json, data/train.csv ...

Two ways to authenticate (pick one):
  service_account : create a service account, download its JSON key to
                    service_account.json, then SHARE the Drive folder with the
                    service account's e-mail address as *Editor*.
                    (Best for servers / scheduled training.)
  oauth           : create an OAuth "Desktop app" client, download credentials.json;
                    the first run opens a browser to sign in and saves token.json.
                    (Best on your own laptop; uses your own Drive quota.)
"""
from __future__ import annotations

import io
import json
from pathlib import Path

from .config import OAUTH_CLIENT_FILE, OAUTH_TOKEN_FILE, SERVICE_ACCOUNT_FILE

SCOPES = ["https://www.googleapis.com/auth/drive"]
FOLDER_MIME = "application/vnd.google-apps.folder"
_MIME = {".json": "application/json", ".csv": "text/csv", ".txt": "text/plain"}


def build_service(mode: str = "service_account"):
    """Return an authenticated Drive v3 client."""
    try:
        from googleapiclient.discovery import build
    except ImportError as e:  # pragma: no cover
        raise RuntimeError("Install Drive support: pip install -r requirements.txt") from e

    if mode == "service_account":
        from google.oauth2.service_account import Credentials

        if not Path(SERVICE_ACCOUNT_FILE).exists():
            raise FileNotFoundError(f"Service account key not found: {SERVICE_ACCOUNT_FILE}")
        creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    elif mode == "oauth":
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow

        creds = None
        if Path(OAUTH_TOKEN_FILE).exists():
            creds = Credentials.from_authorized_user_file(OAUTH_TOKEN_FILE, SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not Path(OAUTH_CLIENT_FILE).exists():
                    raise FileNotFoundError(f"OAuth client file not found: {OAUTH_CLIENT_FILE}")
                creds = InstalledAppFlow.from_client_secrets_file(OAUTH_CLIENT_FILE, SCOPES).run_local_server(port=0)
            Path(OAUTH_TOKEN_FILE).write_text(creds.to_json())
    else:
        raise ValueError(f"Unknown auth mode: {mode}")
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def _q(value: str) -> str:
    """Escape a value for a Drive query string."""
    return value.replace("\\", "\\\\").replace("'", "\\'")


class DriveStore:
    def __init__(self, service, root_folder_id: str):
        self.svc = service
        self.root = root_folder_id

    # -- lookup / folders ---------------------------------------------------------
    def find(self, name: str, parent: str, folder: bool = False) -> str | None:
        q = f"name = '{_q(name)}' and '{parent}' in parents and trashed = false"
        q += f" and mimeType {'=' if folder else '!='} '{FOLDER_MIME}'"
        res = self.svc.files().list(
            q=q, fields="files(id, name)", pageSize=1, supportsAllDrives=True, includeItemsFromAllDrives=True
        ).execute()
        files = res.get("files", [])
        return files[0]["id"] if files else None

    def ensure_folder(self, name: str, parent: str) -> str:
        existing = self.find(name, parent, folder=True)
        if existing:
            return existing
        meta = {"name": name, "mimeType": FOLDER_MIME, "parents": [parent]}
        return self.svc.files().create(body=meta, fields="id", supportsAllDrives=True).execute()["id"]

    def ensure_path(self, parts: list[str], parent: str | None = None) -> str:
        cur = parent or self.root
        for p in parts:
            cur = self.ensure_folder(p, cur)
        return cur

    # -- upload / download -------------------------------------------------------
    def upload_file(self, path: Path, parent: str, name: str | None = None) -> str:
        """Create the file, or update it in place if one with that name exists."""
        from googleapiclient.http import MediaFileUpload

        name = name or path.name
        media = MediaFileUpload(str(path), mimetype=_MIME.get(path.suffix, "application/octet-stream"), resumable=True)
        existing = self.find(name, parent)
        if existing:
            return self.svc.files().update(fileId=existing, media_body=media, fields="id", supportsAllDrives=True).execute()["id"]
        meta = {"name": name, "parents": [parent]}
        return self.svc.files().create(body=meta, media_body=media, fields="id", supportsAllDrives=True).execute()["id"]

    def upload_tree(self, local_dir: Path, parent: str) -> int:
        """Mirror a local directory under `parent`. Returns the number of files uploaded."""
        count = 0
        for item in sorted(local_dir.iterdir()):
            if item.is_dir():
                count += self.upload_tree(item, self.ensure_folder(item.name, parent))
            else:
                self.upload_file(item, parent)
                count += 1
        return count

    def download_file(self, file_id: str, dest: Path) -> Path:
        from googleapiclient.http import MediaIoBaseDownload

        dest.parent.mkdir(parents=True, exist_ok=True)
        req = self.svc.files().get_media(fileId=file_id, supportsAllDrives=True)
        buf = io.BytesIO()
        dl = MediaIoBaseDownload(buf, req)
        done = False
        while not done:
            _, done = dl.next_chunk()
        dest.write_bytes(buf.getvalue())
        return dest

    def list_children(self, parent: str) -> list[dict]:
        out, token = [], None
        while True:
            res = self.svc.files().list(
                q=f"'{parent}' in parents and trashed = false",
                fields="nextPageToken, files(id, name, mimeType)",
                pageToken=token, supportsAllDrives=True, includeItemsFromAllDrives=True,
            ).execute()
            out += res.get("files", [])
            token = res.get("nextPageToken")
            if not token:
                return out

    def download_tree(self, folder_id: str, dest: Path) -> int:
        count = 0
        for f in self.list_children(folder_id):
            if f["mimeType"] == FOLDER_MIME:
                count += self.download_tree(f["id"], dest / f["name"])
            else:
                self.download_file(f["id"], dest / f["name"])
                count += 1
        return count


def publish_run(store: DriveStore, run_dir: Path) -> dict:
    """Upload a finished run and point latest.json at it."""
    manifest = json.loads((run_dir / "manifest.json").read_text())
    run_id = manifest["run_id"]
    runs = store.ensure_folder("runs", store.root)
    run_folder = store.ensure_folder(run_id, runs)
    n = store.upload_tree(run_dir, run_folder)

    pointer = run_dir / "latest.json"
    pointer.write_text(json.dumps({"run_id": run_id}))
    store.upload_file(pointer, store.root)
    pointer.unlink()
    return {"run_id": run_id, "files": n}


def fetch_run(store: DriveStore, dest_root: Path, run_id: str | None = None) -> Path:
    """Download a run (default: the one latest.json points at) and return its local folder."""
    if run_id is None:
        pid = store.find("latest.json", store.root)
        if not pid:
            raise FileNotFoundError("No latest.json in the Drive folder - nothing has been published yet")
        tmp = store.download_file(pid, dest_root / "_latest.json")
        run_id = json.loads(tmp.read_text())["run_id"]
        tmp.unlink()
    local = dest_root / run_id
    if (local / "manifest.json").exists():
        return local
    runs = store.find("runs", store.root, folder=True)
    folder = store.find(run_id, runs, folder=True) if runs else None
    if not folder:
        raise FileNotFoundError(f"Run {run_id} not found on Drive")
    store.download_tree(folder, local)
    return local
