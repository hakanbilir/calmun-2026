#!/usr/bin/env python3
"""
CALMUN 2026 - High-Performance Web Server & Form Processing API
Merkez Çanakkale Anadolu Lisesi Model United Nations
Handles static asset serving, CORS, security headers, and POST submissions for:
  - Delegate Applications (/api/apply)
  - Contact Messages (/api/contact)
  - Universal Form Endpoint (/api/submit)
Stores submissions in structured JSON and Excel-compatible UTF-8 BOM CSV files in ./data/
"""

import sys
import os
import json
import csv
import random
import datetime
import functools
import socket
import contextlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer, _get_best_family
from urllib.parse import parse_qs, urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

APPS_JSON_PATH = os.path.join(DATA_DIR, 'applications.json')
APPS_CSV_PATH = os.path.join(DATA_DIR, 'applications.csv')
MSGS_JSON_PATH = os.path.join(DATA_DIR, 'messages.json')
MSGS_CSV_PATH = os.path.join(DATA_DIR, 'messages.csv')

def save_application(record):
    """Saves application to JSON and CSV with UTF-8 BOM"""
    # 1. JSON
    existing = []
    if os.path.exists(APPS_JSON_PATH):
        try:
            with open(APPS_JSON_PATH, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except Exception:
            existing = []
    existing.append(record)
    with open(APPS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    # 2. CSV
    file_exists = os.path.exists(APPS_CSV_PATH)
    with open(APPS_CSV_PATH, 'a', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow([
                'Referans ID', 'Tarih', 'Kategori', 'Delege Ad Soyad',
                'E-posta', 'Telefon (WhatsApp)', 'Okul / Kurum',
                'Tercih Edilen Komite', 'KVKK Onayı', 'Açık Rıza Onayı'
            ])
        writer.writerow([
            record.get('refId', ''),
            record.get('submittedAt', ''),
            record.get('data', {}).get('Application_Category', ''),
            record.get('data', {}).get('Delegate_Name', ''),
            record.get('data', {}).get('Email', ''),
            record.get('data', {}).get('Phone_Number', ''),
            record.get('data', {}).get('School_Organization', ''),
            record.get('data', {}).get('Preferred_Committee', ''),
            record.get('data', {}).get('Consent_KVKK_Clarification', 'Evet'),
            record.get('data', {}).get('Consent_Explicit_Approval', 'Evet')
        ])

def save_message(record):
    """Saves contact message to JSON and CSV with UTF-8 BOM"""
    # 1. JSON
    existing = []
    if os.path.exists(MSGS_JSON_PATH):
        try:
            with open(MSGS_JSON_PATH, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except Exception:
            existing = []
    existing.append(record)
    with open(MSGS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    # 2. CSV
    file_exists = os.path.exists(MSGS_CSV_PATH)
    with open(MSGS_CSV_PATH, 'a', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow([
                'Referans ID', 'Tarih', 'Ad Soyad', 'E-posta', 'Konu', 'Mesaj', 'KVKK Onayı'
            ])
        writer.writerow([
            record.get('refId', ''),
            record.get('submittedAt', ''),
            record.get('data', {}).get('Full_Name', ''),
            record.get('data', {}).get('Email', ''),
            record.get('data', {}).get('Subject', ''),
            record.get('data', {}).get('Message', ''),
            record.get('data', {}).get('Consent_KVKK_GDPR', 'Evet')
        ])

class DualStackServer(ThreadingHTTPServer):
    def server_bind(self):
        with contextlib.suppress(Exception):
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        return super().server_bind()

class CalmunRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Requested-With')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            resp = {
                "status": "healthy",
                "service": "CALMUN 2026 Submission API",
                "organization": "Merkez Çanakkale Anadolu Lisesi",
                "targetEmail": "calmunofficial@gmail.com",
                "timestamp": datetime.datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))
            return

        if path == '/api/submissions':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            apps, msgs = [], []
            if os.path.exists(APPS_JSON_PATH):
                try:
                    with open(APPS_JSON_PATH, 'r', encoding='utf-8') as f:
                        apps = json.load(f)
                except Exception:
                    pass
            if os.path.exists(MSGS_JSON_PATH):
                try:
                    with open(MSGS_JSON_PATH, 'r', encoding='utf-8') as f:
                        msgs = json.load(f)
                except Exception:
                    pass
            resp = {"applications": apps, "messages": msgs, "total_applications": len(apps), "total_messages": len(msgs)}
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))
            return

        # Serve static assets normally
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ['/api/submit', '/api/apply', '/api/contact']:
            content_length = int(self.headers.get('Content-Length', 0))
            post_bytes = self.rfile.read(content_length)
            
            payload = {}
            content_type = self.headers.get('Content-Type', '')

            if 'application/json' in content_type:
                try:
                    payload = json.loads(post_bytes.decode('utf-8'))
                except Exception:
                    payload = {}
            else:
                try:
                    parsed_body = parse_qs(post_bytes.decode('utf-8', errors='replace'))
                    for k, v in parsed_body.items():
                        payload[k] = v[0] if len(v) == 1 else v
                except Exception:
                    payload = {}

            # Detect form type
            is_application = (
                path == '/api/apply' or
                'Delegate_Name' in payload or
                'Application_Category' in payload or
                'Preferred_Committee' in payload
            )

            timestamp_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ref_id = payload.get('Reference_ID')

            if is_application:
                if not ref_id:
                    ref_id = f"CALMUN-APP-{random.randint(1000, 9999)}"
                record = {
                    "refId": ref_id,
                    "type": "application",
                    "submittedAt": timestamp_str,
                    "data": payload
                }
                save_application(record)
                print(f"[CALMUN 2026] ✅ Yeni Delege Başvurusu: {ref_id} | {payload.get('Delegate_Name', 'İsimsiz')} | {payload.get('Preferred_Committee', '')}")
                resp = {
                    "success": True,
                    "status": "success",
                    "refId": ref_id,
                    "type": "application",
                    "message": "Delege başvurunuz başarıyla alındı ve CALMUN Sekreteryasına kaydedildi.",
                    "targetEmail": "calmunofficial@gmail.com",
                    "timestamp": timestamp_str
                }
            else:
                if not ref_id:
                    ref_id = f"CALMUN-MSG-{random.randint(1000, 9999)}"
                record = {
                    "refId": ref_id,
                    "type": "message",
                    "submittedAt": timestamp_str,
                    "data": payload
                }
                save_message(record)
                print(f"[CALMUN 2026] 📨 Yeni İletişim Mesajı: {ref_id} | {payload.get('Full_Name', 'İsimsiz')} ({payload.get('Subject', '')})")
                resp = {
                    "success": True,
                    "status": "success",
                    "refId": ref_id,
                    "type": "message",
                    "message": "Mesajınız başarıyla alındı ve CALMUN Sekreteryasına kaydedildi.",
                    "targetEmail": "calmunofficial@gmail.com",
                    "timestamp": timestamp_str
                }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))
            return

        # 404 for unknown POST endpoints
        self.send_response(404)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

if __name__ == '__main__':
    DualStackServer.address_family, addr = _get_best_family(None, PORT)
    handler = functools.partial(CalmunRequestHandler, directory=BASE_DIR)
    httpd = DualStackServer(addr, handler)
    print(f"🚀 CALMUN 2026 DualStack Server running on port {PORT}...")
    print(f"📁 Serving static files from: {BASE_DIR}")
    print(f"💾 Submissions stored in: {DATA_DIR}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping CALMUN server.")
        httpd.server_close()
