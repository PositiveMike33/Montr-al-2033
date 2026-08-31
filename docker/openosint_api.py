# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests",
# ]
# ///

"""
=============================================================================
DEUS EX SOPHIA — OPENOSINT DOCKER MICROSERVICE API (Port 8080)
Lightweight HTTP Daemon exposing multi-vector OSINT reconnaissance to
Sophia and Montréal-2033 ARPG with micro-caching (TTL 1hr).
=============================================================================
"""

import os
import sys
import json
import socket
import urllib.parse
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timezone
import time

PORT = int(os.environ.get("PORT", "8080"))
HOST = os.environ.get("HOST", "0.0.0.0")

# Memory Cache (1 Hour TTL) for zero duplicate resource usage
CACHE = {}
CACHE_TTL = 3600

def generate_dorks(target: str) -> list:
    clean = target.strip()
    return [
        f'site:{clean} filetype:pdf "confidentiel" OR "interne"',
        f'site:{clean} filetype:env OR filetype:yaml OR filetype:sql "password"',
        f'site:{clean} inurl:admin OR inurl:login OR inurl:dashboard',
        f'site:{clean} inurl:api OR inurl:swagger OR inurl:v1/users',
        f'site:pastebin.com "{clean}"',
        f'site:github.com "{clean}" "API_KEY" OR "token"'
    ]

def scan_ip(target: str) -> dict:
    url = f"https://ipwhois.app/json/{urllib.parse.quote(target)}"
    req = urllib.request.Request(url, headers={"User-Agent": "Sophia-OpenOSINT-Docker/2.0"})
    with urllib.request.urlopen(req, timeout=4) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return {
            "ip": data.get("ip", target),
            "isp": data.get("isp") or data.get("org"),
            "asn": data.get("asn"),
            "city": data.get("city"),
            "country": f"{data.get('country')} ({data.get('country_code')})",
            "type": data.get("type", "IPv4"),
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude")
        }

def scan_domain(target: str) -> dict:
    results = {"target": target, "ips": []}
    try:
        addrinfo = socket.getaddrinfo(target, None, socket.AF_INET)
        results["ips"] = list(set([item[4][0] for item in addrinfo]))
    except Exception as e:
        results["error"] = str(e)
    return results

def scan_username(username: str) -> list:
    return [
        {"name": "GitHub", "url": f"https://github.com/{username}"},
        {"name": "GitLab", "url": f"https://gitlab.com/{username}"},
        {"name": "Reddit", "url": f"https://reddit.com/user/{username}"},
        {"name": "Telegram", "url": f"https://t.me/{username}"},
        {"name": "X/Twitter", "url": f"https://x.com/{username}"},
        {"name": "Keybase", "url": f"https://keybase.io/{username}"},
        {"name": "HackerNews", "url": f"https://news.ycombinator.com/user?id={username}"}
    ]

def run_osint_recon(target: str, target_type: str = "domain") -> dict:
    now = time.time()
    cache_key = f"{target_type}:{target.lower().strip()}"

    if cache_key in CACHE and (now - CACHE[cache_key]["time"]) < CACHE_TTL:
        res = CACHE[cache_key]["data"]
        res["cached"] = True
        return res

    start = time.time()
    findings = []
    footprint = {}
    dorks = generate_dorks(target)
    social = []

    if target_type == "ip":
        try:
            ip_data = scan_ip(target)
            footprint = ip_data
            findings.append({"label": "Localisation IP", "value": f"{ip_data.get('city')}, {ip_data.get('country')}"})
            findings.append({"label": "Fournisseur / ASN", "value": f"{ip_data.get('isp')} [{ip_data.get('asn')}]"})
        except Exception as e:
            findings.append({"label": "Statut IP", "value": f"Erreur ou IP privée: {e}"})

    elif target_type == "domain":
        try:
            dom_data = scan_domain(target)
            footprint = dom_data
            if dom_data.get("ips"):
                findings.append({"label": "Adresses Résolues (A)", "value": ", ".join(dom_data["ips"])})
        except Exception as e:
            findings.append({"label": "Résolution DNS", "value": f"Erreur: {e}"})

    elif target_type == "username":
        social = scan_username(target)
        findings.append({"label": "SOCMINT Matrix", "value": f"{len(social)} plateformes vérifiées."})

    duration_ms = int((time.time() - start) * 1000)

    result = {
        "target": target,
        "type": target_type,
        "timestamp": int(now * 1000),
        "cached": False,
        "durationMs": duration_ms,
        "summary": f"Reconnaissance OpenOSINT exécutée sur [{target_type.upper()}] '{target}' ({len(findings)} résultats, {duration_ms}ms).",
        "findings": findings,
        "technicalFootprint": footprint,
        "socialProfiles": social,
        "dorks": dorks,
        "dockerEngine": "montreal-2033-openosint:latest"
    }

    CACHE[cache_key] = {"time": now, "data": result}
    return result

class OpenOSINTRequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, data: dict, status_code: int = 200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/health" or path == "/api/health":
            self._send_json({
                "status": "online",
                "service": "sophia-openosint-microservice",
                "version": "2.23.1-quantum",
                "squad": "Deus Ex Sophia Core",
                "total_tools": 19,
                "cached_entries": len(CACHE)
            })
        elif path == "/recon" or path == "/api/sophia/osint/recon":
            qs = urllib.parse.parse_qs(parsed.query)
            target = qs.get("target", [""])[0]
            ttype = qs.get("type", ["domain"])[0]
            if not target:
                self._send_json({"error": "Missing 'target' parameter"}, 400)
                return
            result = run_osint_recon(target, ttype)
            self._send_json(result)
        elif path == "/dorks":
            qs = urllib.parse.parse_qs(parsed.query)
            target = qs.get("target", [""])[0]
            self._send_json({"target": target, "dorks": generate_dorks(target or "target.com")})
        else:
            self._send_json({"error": "Not Found", "endpoints": ["/health", "/recon", "/dorks"]}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["/recon", "/api/sophia/osint/recon", "/api/recon"]:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            try:
                payload = json.loads(body)
            except Exception:
                payload = {}

            target = payload.get("target", "").strip()
            ttype = payload.get("type", "domain")

            if not target:
                self._send_json({"error": "Missing 'target' field in JSON body"}, 400)
                return

            result = run_osint_recon(target, ttype)
            self._send_json(result)
        else:
            self._send_json({"error": "Not Found"}, 404)

def run():
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, OpenOSINTRequestHandler)
    print(f"[*] Sophia OpenOSINT Microservice active on http://{HOST}:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == "__main__":
    run()
