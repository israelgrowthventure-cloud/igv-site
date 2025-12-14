#!/usr/bin/env python3
"""Orchestrateur autonome: env check → git commit/push → Render deploy → tests prod.

Sort avec code 0 si tout est PASS, sinon 1.
"""

from __future__ import annotations

import json
import os
import secrets
import string
import subprocess
import sys
import time
import urllib.request
from typing import Dict, Optional, Tuple

RENDER_API = "https://api.render.com/v1/services"
TARGET_BACKEND_HOST = "igv-cms-backend.onrender.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def run(cmd, cwd=None, check=True, capture_output=False) -> subprocess.CompletedProcess:
    print(f"[run] {' '.join(cmd)}")
    return subprocess.run(cmd, cwd=cwd, check=check, text=True, capture_output=capture_output)


def api_get(url: str, api_key: str):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {api_key}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def api_post(url: str, api_key: str, payload: Dict):
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        data=json.dumps(payload).encode(),
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


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


def find_service_ids(api_key: str) -> Tuple[Optional[str], Optional[str]]:
    services = api_get(RENDER_API, api_key)
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


def get_env_map(api_key: str, service_id: str) -> Dict[str, str]:
    if not service_id:
        return {}
    envs = api_get(f"{RENDER_API}/{service_id}/env-vars", api_key)
    result: Dict[str, str] = {}
    for item in envs:
        env = item.get("envVar") or {}
        key = env.get("key")
        val = env.get("value")
        if key:
            result[key] = val
    return result


def set_env_var(api_key: str, service_id: str, key: str, value: str):
    payload = {"envVars": [{"key": key, "value": value}]}
    req = urllib.request.Request(
        f"{RENDER_API}/{service_id}/env-vars",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        data=json.dumps(payload).encode(),
        method="PUT",
    )
    with urllib.request.urlopen(req) as resp:
        json.loads(resp.read().decode())
    print(f"[env] set {key}=*** on {service_id}")


ALIASES = {
    "MONGODB_URI": ["MONGODB_URI", "MONGO_URL"],
    "CORS_ALLOWED_ORIGINS": ["CORS_ALLOWED_ORIGINS", "CORS_ORIGINS"],
}


def has_env(env_map_front: Dict[str, str], env_map_back: Dict[str, str], key: str) -> bool:
    keys = ALIASES.get(key, [key])
    return any(env_map_back.get(k) or env_map_front.get(k) for k in keys)


OPTIONAL_PHASE2 = {
    "CMS_ADMIN_EMAIL",
    "CMS_ADMIN_PASSWORD",
    "CMS_JWT_SECRET",
    "UPLOAD_PROVIDER",
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


def ensure_envs(api_key: str, front_id: str, back_id: str) -> Optional[str]:
    if not back_id:
        return "Missing env var: RENDER_BACKEND_SERVICE_ID"

    front_env = get_env_map(api_key, front_id)
    back_env = get_env_map(api_key, back_id)

    def ensure(key: str) -> bool:
        return has_env(front_env, back_env, key)

    if not ensure("MONGODB_URI"):
        return "Missing env var: MONGODB_URI"

    if not ensure("JWT_SECRET"):
        print("[warn] JWT_SECRET missing (using existing runtime defaults if any)")

    if not ensure("CORS_ALLOWED_ORIGINS"):
        print("[warn] CORS_ALLOWED_ORIGINS missing (backend will fallback to '*')")

    for key in sorted(OPTIONAL_PHASE2):
        if not ensure(key):
            print(f"[warn] {key} missing (OPTIONNEL phase 2/3)")

    return None


def git_commit_push():
    try:
        status = run(["git", "status", "--porcelain"], cwd=ROOT, check=False, capture_output=True)
        if status.stdout and status.stdout.strip():
            run(["git", "add", "-A"], cwd=ROOT)
            run(["git", "commit", "-m", "chore: auto deploy"], cwd=ROOT)
        run(["git", "push"], cwd=ROOT)
    except subprocess.CalledProcessError as exc:
        print(f"[git] warning: {exc}")


def trigger_deploy(api_key: str, service_id: str) -> Optional[str]:
    if not service_id:
        return None
    data = api_post(
        f"{RENDER_API}/{service_id}/deploys",
        api_key,
        payload={},
    )
    deploy_id = data.get("id")
    print(f"[render] triggered {service_id} deploy {deploy_id}")
    return deploy_id


def poll_deploy(api_key: str, service_id: str, deploy_id: str) -> bool:
    url = f"{RENDER_API}/{service_id}/deploys/{deploy_id}"
    for _ in range(60):
        data = api_get(url, api_key)
        status = data.get("status")
        print(f"[render] {service_id} deploy {deploy_id} status={status}")
        if status in {"live", "succeeded", "deployed"}:
            return True
        if status in {"failed", "canceled", "deactivated"}:
            return False
        time.sleep(10)
    return False


def run_tests() -> bool:
    http = run([sys.executable, "scripts/test_production_http.py"], cwd=ROOT, check=False)
    http_ok = http.returncode == 0
    browser = run(["node", "scripts/test_production_browser_playwright.mjs"], cwd=ROOT, check=False)
    return http_ok and browser.returncode == 0


def main():
    api_key = os.environ.get("RENDER_API_KEY")
    if not api_key:
        print("Missing env var: RENDER_API_KEY")
        sys.exit(1)

    front_id = os.environ.get("RENDER_FRONTEND_SERVICE_ID")
    back_id = os.environ.get("RENDER_BACKEND_SERVICE_ID")
    auto_front, auto_back = find_service_ids(api_key)
    if not front_id:
        front_id = auto_front
    if not back_id:
        back_id = auto_back

    if not front_id or not back_id:
        print("Missing env var: service id (igv-site-web/igv-cms-backend)")
        sys.exit(1)

    env_issue = ensure_envs(api_key, front_id, back_id)
    if env_issue:
        print(env_issue)
        sys.exit(1)

    git_commit_push()

    front_deploy = trigger_deploy(api_key, front_id)
    back_deploy = trigger_deploy(api_key, back_id)

    success = True
    if front_deploy:
        success &= poll_deploy(api_key, front_id, front_deploy)
    if back_deploy:
        success &= poll_deploy(api_key, back_id, back_deploy)

    if not success:
        print("Deploy failed")
        sys.exit(1)

    tests_ok = run_tests()
    if not tests_ok:
        print("Tests failed")
        sys.exit(1)

    print("ALL PASS")


if __name__ == "__main__":
    main()
