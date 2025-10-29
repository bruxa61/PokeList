#!/usr/bin/env python3
"""
Simple HTTP server for serving the Pokémon TCG Checklist application.
Serves static files with proper cache control headers.
"""
import http.server
import socketserver
import os
from http import HTTPStatus

PORT = 5000
HOST = "0.0.0.0"

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with no-cache headers to prevent caching issues."""
    
    def end_headers(self):
        """Add cache control headers before ending headers."""
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Custom log format."""
        print(f"[Server] {self.address_string()} - {format % args}")

def main():
    """Start the HTTP server."""
    # Change to the directory containing the files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer((HOST, PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"[Server] Starting HTTP server on {HOST}:{PORT}")
        print(f"[Server] Serving files from: {os.getcwd()}")
        print(f"[Server] Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[Server] Shutting down...")
            httpd.shutdown()

if __name__ == "__main__":
    main()
