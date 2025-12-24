#!/usr/bin/env python3
"""Tests HTTP de production (frontend + backend).

Utilisation:
  python scripts/test_production_http.py

Variables d'environnement acceptées:
  FRONT_URL (defaut: https://israelgrowthventure.com)
  BACKEND_URL (defaut: https://igv-cms-backend.onrender.com)
  FRONT_EXPECTED_TITLE (defaut: "Emergent | Fullstack App")
  HTTP_TIMEOUT (defaut: 10 secondes)
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any, Dict, Tuple

DEFAULT_FRONT = "https://israelgrowthventure.com"
DEFAULT_BACKEND = "https://igv-cms-backend.onrender.com"
DEFAULT_TITLE = "Israel Growth Venture"
DEFAULT_TIMEOUT = float(os.environ.get("HTTP_TIMEOUT", "10"))


@dataclass
class CheckResult:
    name: str
    ok: bool
    status: int | None
    detail: str
    elapsed_ms: int

    def as_dict(self) -> Dict[str, Any]:
        return {
            "check": self.name,
            "ok": self.ok,
            "status": self.status,
            "detail": self.detail,
            "elapsed_ms": self.elapsed_ms,
        }


def fetch(url: str) -> Tuple[int, bytes, float]:
    req = urllib.request.Request(url, headers={"User-Agent": "IGV-ProdCheck/1.0"})
    start = time.time()
    with urllib.request.urlopen(req, timeout=DEFAULT_TIMEOUT) as resp:
        body = resp.read()
        elapsed = time.time() - start
        return resp.getcode(), body, elapsed


def check_frontend() -> CheckResult:
    target = os.environ.get("FRONT_URL", DEFAULT_FRONT)
    expected_title = os.environ.get("FRONT_EXPECTED_TITLE", DEFAULT_TITLE)

    try:
        status, body, elapsed = fetch(target)
        html = body.decode("utf-8", errors="replace")
        match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        title = match.group(1).strip() if match else ""

        if status != 200:
            return CheckResult("frontend_http", False, status, "Status code différent de 200", int(elapsed * 1000))

        if not title:
            return CheckResult("frontend_http", False, status, "Balise <title> absente", int(elapsed * 1000))

        if expected_title.lower() not in title.lower():
            return CheckResult(
                "frontend_http",
                False,
                status,
                f"Titre inattendu (obtenu: '{title}')",
                int(elapsed * 1000),
            )

        if len(html.strip()) < 1000:
            return CheckResult("frontend_http", False, status, "HTML trop court (page possiblement blanche)", int(elapsed * 1000))

        return CheckResult("frontend_http", True, status, f"Titre: {title}", int(elapsed * 1000))
    except urllib.error.HTTPError as exc:  # pragma: no cover - dépend du réseau
        return CheckResult("frontend_http", False, exc.code, f"HTTPError: {exc}", 0)
    except Exception as exc:  # pragma: no cover - dépend du réseau
        return CheckResult("frontend_http", False, None, f"Exception: {exc}", 0)


def check_backend() -> CheckResult:
    target = os.environ.get("BACKEND_URL", DEFAULT_BACKEND).rstrip("/") + "/api/health"

    try:
        status, body, elapsed = fetch(target)
        if status != 200:
            return CheckResult("backend_health", False, status, "Status code différent de 200", int(elapsed * 1000))

        try:
            payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            return CheckResult("backend_health", False, status, "Réponse non JSON", int(elapsed * 1000))

        if payload.get("status") != "ok":
            return CheckResult("backend_health", False, status, f"Payload inattendu: {payload}", int(elapsed * 1000))

        return CheckResult("backend_health", True, status, "Health OK", int(elapsed * 1000))
    except urllib.error.HTTPError as exc:  # pragma: no cover
        return CheckResult("backend_health", False, exc.code, f"HTTPError: {exc}", 0)
    except Exception as exc:  # pragma: no cover
        return CheckResult("backend_health", False, None, f"Exception: {exc}", 0)


def main() -> int:
    # Force UTF-8 encoding for console output
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    
    checks = [check_frontend(), check_backend()]
    summary = {"results": [c.as_dict() for c in checks], "all_passed": all(c.ok for c in checks)}

    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 0 if summary["all_passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
