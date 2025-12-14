#!/usr/bin/env python3
"""Affiche PRESENT/ABSENT en se basant sur Render API (jamais les valeurs)."""

from __future__ import annotations

import json
import os
import sys
import urllib.request


RENDER_API = "https://api.render.com/v1/services"
TARGET_BACKEND_HOST = "igv-cms-backend.onrender.com"
OPTIONAL_PHASE2 = {
    "CMS_ADMIN_EMAIL",
    "CMS_ADMIN_PASSWORD",
    "CMS_JWT_SECRET",
    "UPLOAD_PROVIDER",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_REGION",
    "S3_BUCKET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CRM_ADMIN_EMAIL",
    "CRM_ADMIN_PASSWORD",
    "CRM_ADMIN_NAME",
    "BOOTSTRAP_TOKEN",
    "RBAC_ENABLED",
    "MONETICO_MODE",
    "MONETICO_TPE",
    "MONETICO_SOCIETE",
    "MONETICO_KEY",
    "MONETICO_URL_PAIEMENT",
    "MONETICO_URL_RETOUR_OK",
    "MONETICO_URL_RETOUR_KO",
}

ALIASES = {
    "MONGODB_URI": ["MONGODB_URI", "MONGO_URL"],
    "CORS_ALLOWED_ORIGINS": ["CORS_ALLOWED_ORIGINS", "CORS_ORIGINS"],
}


def api_get(url: str, api_key: str):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {api_key}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def get_services(api_key: str):
    data = api_get(RENDER_API, api_key)
    return data


def _extract_urls(svc: dict) -> set[str]:
    urls: set[str] = set()
    service = svc.get("service") if isinstance(svc, dict) else svc
    service = service or {}
    details = service.get("serviceDetails", {}) or {}

    def add(val):
        if isinstance(val, str):
            urls.add(val)

    for key in ("url", "uri", "dashboardUrl", "defaultDomain", "customDomain"):
        add(service.get(key))
        add(details.get(key))

    for list_key in ("domains", "customDomains"):
        for entry in details.get(list_key, []) or []:
            if isinstance(entry, str):
                add(entry)
            elif isinstance(entry, dict):
                add(entry.get("name") or entry.get("domainName"))

    return urls


def find_service_ids(api_key: str):
    services = get_services(api_key)
    front_id = None
    back_id = None
    back_id_url = None
    for svc in services:
        name = svc.get("service").get("name") if isinstance(svc, dict) else svc.get("name")
        svc_id = svc.get("service").get("id") if isinstance(svc, dict) else svc.get("id")
        urls = _extract_urls(svc)
        if name == "igv-site-web":
            front_id = svc_id
        if TARGET_BACKEND_HOST in urls:
            back_id_url = svc_id
        if name == "igv-cms-backend":
            back_id = svc_id
        if name == "igv-backend" and back_id is None:
            back_id = svc_id
    if back_id_url:
        back_id = back_id_url
    return front_id, back_id


def get_env_map(api_key: str, service_id: str):
    if not service_id:
        return {}
    envs = api_get(f"{RENDER_API}/{service_id}/env-vars", api_key)
    result = {}
    for item in envs:
        env = item.get("envVar") or {}
        key = env.get("key")
        if key:
            result[key] = True
    return result


def main():
    api_key = os.environ.get("RENDER_API_KEY")
    if not api_key:
        print("RENDER_API_KEY=ABSENT")
        print("STATUS=BLOQUE (RENDER_API_KEY manquant)")
        sys.exit(1)

    services = get_services(api_key)
    front_id, back_id = find_service_ids(api_key)
    print(f"RENDER_FRONTEND_SERVICE_ID={'PRESENT' if front_id else 'ABSENT'}")
    print(f"RENDER_BACKEND_SERVICE_ID={'PRESENT' if back_id else 'ABSENT'}")

    front_env = get_env_map(api_key, front_id)
    back_env = get_env_map(api_key, back_id)

    blocked = []

    render_key_state = "PRESENT" if os.environ.get("RENDER_API_KEY") else "ABSENT"
    print(f"RENDER_API_KEY={render_key_state}")
    if render_key_state == "ABSENT":
        blocked.append("RENDER_API_KEY")

    def present(key: str) -> bool:
        keys = ALIASES.get(key, [key])
        return any(back_env.get(k) or front_env.get(k) for k in keys)

    db_present = present("MONGODB_URI")
    print(f"MONGODB_URI={'PRESENT' if db_present else 'ABSENT'}")
    if not db_present:
        blocked.append("MONGODB_URI")

    cors_present = present("CORS_ALLOWED_ORIGINS")
    print(f"CORS_ALLOWED_ORIGINS={'PRESENT' if cors_present else 'ABSENT'}")

    for key in sorted(OPTIONAL_PHASE2):
        state = "PRESENT" if present(key) else "OPTIONNEL (phase 2/3)"
        print(f"{key}={state}")

    if blocked:
        print("STATUS=BLOQUE")
        sys.exit(1)

    print("STATUS=OK")


if __name__ == "__main__":
    main()
