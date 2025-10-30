import http.server
import socketserver
import os
from http import HTTPStatus

PORT = 5000
HOST = "0.0.0.0"

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        print(f"[Server] {self.address_string()} - {format % args}")

def main():
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
