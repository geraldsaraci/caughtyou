# 🛡️ CAUGHTYOU SOC - Defensive Security Intelligence Platform

A full-stack DevOps project featuring an **IP threat intelligence scanner** built with **Docker**, **GitHub Actions CI/CD**, **Nginx reverse proxy**, and **VirusTotal API integration**.

Live Demo: `http://23.88.107.201:8082` | GitHub: `geraldsaraci/caughtyou`

---

## 📊 Project Overview

CAUGHTYOU SOC is a **Security Operations Center** web application that allows security teams to scan IP addresses and analyze threat intelligence data with a cybersecurity-themed neon interface.

### Key Features
✅ **Real-time IP threat scanning** via VirusTotal API  
✅ **Neon cybersecurity UI** with pulsing animations  
✅ **Color-coded threat levels** (CRITICAL/HIGH/MEDIUM/LOW)  
✅ **Malicious/Suspicious report counts**  
✅ **VPN, Proxy, Tor, and Data Center detection**  
✅ **Automated Docker deployment** via GitHub Actions  
✅ **Nginx reverse proxy** for public access  
✅ **Private container** binding (localhost only)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Repository (geraldsaraci/caughtyou)             │
│  ├── Dockerfile (multi-stage build)                     │
│  ├── server.js (Express backend)                        │
│  ├── client/public/index.html (vanilla JS frontend)     │
│  └── .github/workflows/deploy.yml (CI/CD)               │
└─────────────────────────────────────────────────────────┘
                          ↓
              (Git push triggers CI/CD)
                          ↓
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions                                          │
│  ├── Build Docker image                                 │
│  ├── Push to GHCR (ghcr.io/geraldsaraci/caughtyou)     │
│  └── SSH deploy to Ubuntu server                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Ubuntu Server (23.88.107.201)                          │
│  ├── Nginx (port 80/443) → Reverse proxy               │
│  │   └── caughtyou.opsverge.com                         │
│  └── Docker Container (127.0.0.1:8082)                 │
│      ├── Express.js backend (port 3000)                │
│      ├── Static HTML/CSS/JS frontend                   │
│      └── VirusTotal API integration                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Ubuntu 20.04+ server
- Docker & Docker Compose
- Nginx
- VirusTotal API key (free tier)
- GitHub repository with GitHub Actions enabled

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/geraldsaraci/caughtyou.git
cd caughtyou
```

2. **Create .env file:**
```bash
cp .env.example .env
# Edit .env with your VirusTotal API key
```

3. **Build and run locally:**
```bash
docker build -t caughtyou:latest .
docker run -d -p 8082:3000 caughtyou:latest
```

4. **Access the app:**
```
http://localhost:8082
```

---

## 📁 Project Structure

```
caughtyou/
├── Dockerfile                          # Single-stage Docker build
├── server.js                           # Express.js backend (50 lines)
├── package.json                        # Node.js dependencies
├── .env                                # Environment variables (API keys)
├── .github/
│   └── workflows/
│       └── deploy.yml                  # GitHub Actions CI/CD pipeline
├── client/
│   └── public/
│       └── index.html                  # Vanilla JS frontend + neon CSS
└── compose.yml                         # Docker Compose configuration
```

---

## 🔌 API Endpoints

### POST `/api/scan/ip`
Scan an IP address against VirusTotal threat database.

**Request:**
```bash
curl -X POST http://127.0.0.1:8082/api/scan/ip \
  -H "Content-Type: application/json" \
  -d '{"ip":"8.8.8.8"}'
```

**Response:**
```json
{
  "ip": "8.8.8.8",
  "country": "US",
  "asn": 15169,
  "organization": "GOOGLE",
  "is_vpn": false,
  "is_proxy": false,
  "is_tor": false,
  "is_datacenter": false,
  "malicious_count": 0,
  "suspicious_count": 0,
  "undetected_count": 32,
  "harmless_count": 60,
  "last_analysis_date": 1769095360,
  "threat_level": "LOW"
}
```

### GET `/api/health`
Health check endpoint.

```bash
curl http://127.0.0.1:8082/api/health
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

**Trigger:** Push to `main` branch

**Jobs:**
1. **Build**
   - Checks out code
   - Logs into GHCR (GitHub Container Registry)
   - Builds Docker image
   - Pushes to `ghcr.io/geraldsaraci/caughtyou:latest`

2. **Deploy** (depends on Build)
   - SSH connects to server as `deploy` user
   - Pulls latest Docker image
   - Runs `docker compose up -d`
   - Prunes old images

**Required Secrets:**
- `SSH_HOST`: Server IP/hostname
- `SSH_USER`: SSH username (deploy)
- `SSH_KEY`: Private SSH key (PEM format)
- `GITHUB_TOKEN`: Auto-provided by GitHub

---

## 🐳 Docker & Compose

### Dockerfile
Single-stage Alpine-based Node.js image (~150MB)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js .env ./
COPY client/public/ ./client/build/
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose (`compose.yml`)
```yaml
services:
  caughtyou:
    image: ghcr.io/geraldsaraci/caughtyou:latest
    container_name: caughtyou
    restart: unless-stopped
    ports:
      - "127.0.0.1:8082:3000"
```

**Run:**
```bash
docker compose -f compose.yml pull
docker compose -f compose.yml up -d
```

---

## 🔒 Nginx Reverse Proxy

### Configuration (`/etc/nginx/sites-enabled/caughtyou.conf`)
```nginx
server {
  listen 80;
  server_name caughtyou.opsverge.com;

  location / {
    proxy_pass http://127.0.0.1:8082;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

**Why this design:**
- ✅ Container runs on localhost only (secure)
- ✅ Nginx is the public entry point
- ✅ Easy SSL/TLS termination
- ✅ Isolates app from direct internet access

---

## 🎨 Frontend Features

### Technology Stack
- **HTML5** - Semantic markup
- **CSS3** - Cybersecurity neon theme
  - Dark background (#0a0e27)
  - Neon green (#00ff88)
  - Cyan accents (#00ccff)
  - Magenta borders (#ff00ff)
- **Vanilla JavaScript** - No frameworks (100% client-side)

### UI Components
- **Neon Buttons** - Pulsing glow animation
- **Threat Level Badges** - Color-coded (Red/Orange/Yellow/Green)
- **Results Table** - Dynamic IP scan results
- **Error Messages** - Real-time validation feedback

---

## 📈 Deployment Checklist

- [x] Docker image builds successfully
- [x] GitHub Actions workflow configured
- [x] SSH deployment credentials set
- [x] Nginx reverse proxy configured
- [x] VirusTotal API key added to `.env`
- [x] Container running and healthy
- [x] Frontend accessible via browser
- [x] IP scanning API functional

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 20 (Alpine) |
| **Backend** | Express.js | 4.18.2 |
| **Frontend** | Vanilla JS + HTML5 + CSS3 | - |
| **Containerization** | Docker | Latest |
| **Orchestration** | Docker Compose | 3.x |
| **Reverse Proxy** | Nginx | 1.18+ |
| **CI/CD** | GitHub Actions | - |
| **API Integration** | VirusTotal REST | v3 |
| **Server** | Ubuntu | 20.04+ |

---

## 📝 Configuration

### Environment Variables (`.env`)
```env
VT_API_KEY=your_virustotal_api_key_here
PORT=3000
NODE_ENV=production
```

### Security Notes
- ✅ API key stored in `.env` (added to `.gitignore`)
- ✅ Container runs non-root user via Node.js
- ✅ CORS enabled for flexibility
- ✅ IP validation on backend
- ✅ No sensitive data in frontend

---

## 🧪 Testing

### Test IP Endpoints
```bash
# Google DNS (LOW threat)
curl -X POST http://127.0.0.1:8082/api/scan/ip \
  -d '{"ip":"8.8.8.8"}' -H "Content-Type: application/json"

# Cloudflare DNS (LOW threat)
curl -X POST http://127.0.0.1:8082/api/scan/ip \
  -d '{"ip":"1.1.1.1"}' -H "Content-Type: application/json"

# Health check
curl http://127.0.0.1:8082/api/health
```

### Manual Deployment Test
```bash
# SSH to server
ssh deploy@23.88.107.201

# Check container status
docker ps | grep caughtyou

# View logs
docker logs caughtyou

# Test locally
curl http://127.0.0.1:8082/api/health
```

---

## 📊 Performance

- **Container image size:** ~150MB
- **Startup time:** <5 seconds
- **API response:** <2 seconds (depends on VirusTotal)
- **Frontend load:** <1 second

---

## 🔐 Security Features

- Container runs with minimal privileges
- Localhost-only binding (no public exposure without Nginx)
- API key externalized via environment variables
- Input validation on IP addresses
- CORS properly configured
- No hardcoded credentials in code

---

## 🚨 Troubleshooting

### Container won't start
```bash
docker logs caughtyou
docker inspect caughtyou
```

### Port 8082 already in use
```bash
sudo lsof -i :8082
sudo kill -9 <PID>
```

### Nginx not proxying
```bash
sudo nginx -t
sudo systemctl reload nginx
curl -v http://127.0.0.1:8082
```

### VirusTotal API failing
- Check `.env` file exists in container
- Verify API key is valid
- Check rate limits (free tier: 4 requests/minute)

---

## 📞 Support

**Repository:** https://github.com/geraldsaraci/caughtyou  
**Live App:** http://23.88.107.201:8082  
**Issues:** Open an issue on GitHub

---

## 📄 License

MIT License - Feel free to fork and modify!

---

**Built with ❤️ by Gerald Saraci**  
*A complete DevOps infrastructure from code to production deployment*
