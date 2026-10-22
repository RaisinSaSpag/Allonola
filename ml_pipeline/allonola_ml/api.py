"""Tiny JSON API so the static website can call the trained models.

    python -m allonola_ml.api                 # local artifacts
    python -m allonola_ml.api --drive         # pull latest models from Google Drive

GET  /health
GET  /models                      -> list + headline test metrics
GET  /models/<name>               -> full metadata (split, CV, metrics, schema)
POST /predict/<name>              -> {"rows":[{...}]} or a single {...}
"""
from __future__ import annotations

import argparse
import os

from flask import Flask, jsonify, request

from .config import ARTIFACT_DIR, DRIVE_FOLDER_ID
from .registry import ModelRegistry

MAX_ROWS = 500


def create_app(registry: ModelRegistry) -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 1_000_000
    # Set ALLONOLA_CORS_ORIGIN to your site's origin in production (e.g. https://you.github.io)
    origin = os.getenv("ALLONOLA_CORS_ORIGIN", "*")

    @app.after_request
    def cors(resp):
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return resp

    @app.get("/health")
    def health():
        return {"status": "ok", "run_id": registry.run_dir.name, "models": registry.names()}

    @app.get("/models")
    def models():
        out = []
        for n in registry.names():
            m = registry.metadata(n)
            out.append({"name": n, "title": m["title"], "task": m["task"], "test": m["metrics"]["test"],
                        "trained_at": m["trained_at"], "split": m["split"]["sizes"]["fractions"]})
        return jsonify(out)

    @app.get("/models/<name>")
    def model_detail(name):
        try:
            return jsonify(registry.metadata(name))
        except KeyError:
            return jsonify(error=f"unknown model '{name}'"), 404

    @app.route("/predict/<name>", methods=["POST", "OPTIONS"])
    def predict(name):
        if request.method == "OPTIONS":
            return ("", 204)
        payload = request.get_json(silent=True)
        if payload is None:
            return jsonify(error="body must be JSON"), 400
        rows = payload.get("rows") if isinstance(payload, dict) and "rows" in payload else [payload]
        if not isinstance(rows, list) or not rows or not all(isinstance(r, dict) for r in rows):
            return jsonify(error="send an object or {\"rows\": [objects]}"), 400
        if len(rows) > MAX_ROWS:
            return jsonify(error=f"max {MAX_ROWS} rows per request"), 400
        try:
            return jsonify(model=name, results=registry.predict(name, rows))
        except KeyError:
            return jsonify(error=f"unknown model '{name}'"), 404
        except (ValueError, TypeError) as e:
            return jsonify(error=str(e)), 400

    return app


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--drive", action="store_true", help="load models from Google Drive")
    p.add_argument("--drive-auth", choices=["service_account", "oauth"], default="service_account")
    p.add_argument("--drive-folder", default=DRIVE_FOLDER_ID)
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=5000)
    a = p.parse_args()

    store = None
    if a.drive:
        from .drive_store import DriveStore, build_service

        store = DriveStore(build_service(a.drive_auth), a.drive_folder)
    create_app(ModelRegistry(ARTIFACT_DIR, store)).run(host=a.host, port=a.port)


if __name__ == "__main__":
    main()
