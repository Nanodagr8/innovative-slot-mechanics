"""
Hexakeno Local API Server
-------------------------
A simple HTTP server to expose the HexakenoEngine to the frontend.
Run with: python server.py
"""

import http.server
import socketserver
import json

from dataclasses import asdict
from keno_engine import HexakenoEngine

PORT = 8000

class HexakenoHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/play':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data)
                picks = data.get('picks', [])
                bet = float(data.get('bet', 1.0))
                risk = data.get('risk', 'classic')
                use_superball = bool(data.get('use_superball', False))
                client_seed = data.get('client_seed', None)  # For replay
                
                # Initialize Engine
                engine = HexakenoEngine()
                
                # Set seed for deterministic replay (or generate new)
                import random
                import time
                if client_seed is not None:
                    engine.set_seed(int(client_seed))
                    used_seed = int(client_seed)
                else:
                    used_seed = int(time.time() * 1000) % (2**31)
                    engine.set_seed(used_seed)
                
                result = engine.play_round(picks, bet, risk=risk, use_superball=use_superball)
                
                # Convert dataclass to dict and add seed for replay
                response_data = asdict(result)
                response_data['client_seed'] = used_seed
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    import os
    # Change to the frontend directory so that http://localhost:8000/ serves the game
    script_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(script_dir, "stake-release", "frontend")
    os.chdir(frontend_dir)
    print(f"Serving from: {frontend_dir}")
    print(f"Hexakeno API Server running on http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), HexakenoHandler) as httpd:
        httpd.serve_forever()
