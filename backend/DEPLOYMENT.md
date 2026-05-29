# Sanadak Portfolio - Backend Deployment Guide

This guide details step-by-step procedures for building and deploying the Express backend application of the Sanadak Portfolio project to production.

---

## 🛠️ Phase 1: Building the Backend Locally

Before deploying, ensure that the application compiles without errors. The build transpiles TypeScript (`src/**/*.ts`) into JavaScript (`dist/**/*.js`).

### Build Steps:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the compiler:
   ```bash
   npm run build
   ```
4. Verify the output:
   - A `dist/` directory is created.
   - Test running the production build locally:
     ```bash
     npm run start:prod
     ```

---

## 🔐 Phase 2: Environment Variables Configuration

Production deployment requires setting up specific environment variables. **Never commit raw production values to version control.**

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | The port the backend listens on | `3000` (or injected by hosting platform) |
| `MONGODB_URI` | MongoDB Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for signing JWT tokens | *A long, randomly generated secure string* |
| `FRONTEND_URLS` | Allowed CORS origins (comma-separated) | `https://sanadak.com,https://admin.sanadak.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary storage account name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary access key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary access secret | `your_api_secret` |

---

## 🚀 Phase 3: Deployment Options

Choose the deployment method that best fits your hosting strategy.

### Option A: Railway (Highly Recommended)
Railway is the fastest cloud platform for Node.js backends.

1. **Push your code to GitHub**: Create a repository containing your codebase.
2. **Create a Railway Account**: Log in to [Railway.app](https://railway.app/).
3. **Deploy from GitHub**:
   - Click **New Project** -> **Deploy from GitHub repo**.
   - Select your repository.
   - Click **Deploy Now**.
4. **Configure Root Directory**:
   - Since this is a monorepo setup, go to **Settings** of the backend service.
   - Set **Root Directory** to `backend`.
5. **Add Environment Variables**:
   - Go to the **Variables** tab.
   - Add all environment variables listed in Phase 2.
6. **Generate Domain**:
   - Go to **Settings** -> **Networking** -> **Generate Domain** (or bind your custom domain).
   - Copy this URL—it will be your frontend's `environment.prod.ts` backend API URL (e.g. `https://your-backend.up.railway.app`).

---

### Option B: Render
Render is a fully managed cloud platform with excellent support for web services.

1. **Create a Render Account**: Sign up at [Render.com](https://render.com/).
2. **Create a Web Service**:
   - Click **New** -> **Web Service**.
   - Connect your GitHub repository.
3. **Configure Settings**:
   - **Name**: `sanadak-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main`
4. **Environment Variables**:
   - Scroll down to **Environment Variables** and input the required environment keys.
5. **Deploy**:
   - Click **Create Web Service**. Render will pull the code, build it, and launch your API service.

---

### Option C: Docker (Containerized Cloud Providers)
We have included a highly optimized, multi-stage `Dockerfile` and a `.dockerignore` file in the backend root directory. This enables deployment on modern container platforms (e.g., AWS ECS, Google Cloud Run, fly.io, DigitalOcean App Platform).

1. **Build the Docker Image**:
   ```bash
   docker build -t sanadak-backend ./backend
   ```
2. **Run Locally or Test**:
   ```bash
   docker run -p 3000:3000 --env-file ./backend/.env sanadak-backend
   ```
3. **Deploy**:
   - Most container cloud providers only require you to point to the repository, and they will automatically build and deploy using the `Dockerfile`.

---

### Option D: Ubuntu VPS (Virtual Private Server)
For full control, deploy on an Ubuntu Linux VPS (e.g. Hostinger, DigitalOcean, Hetzner, AWS EC2).

#### 1. Server Setup
Connect via SSH and install required runtimes:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v22 LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager) globally
sudo npm install -g pm2
```

#### 2. Get the Code & Install
```bash
# Clone repository
git clone <your-repository-url> /var/www/sanadak-portfolio
cd /var/www/sanadak-portfolio/backend

# Create production .env file
nano .env  # Add environment variables here

# Install production dependencies and build
npm install
npm run build
```

#### 3. Run the Application with PM2
PM2 keeps your server running in the background and restarts it automatically if it crashes or the server reboots.
```bash
# Start backend
pm2 start dist/main.js --name "sanadak-backend"

# Ensure PM2 restarts on system reboot
pm2 startup
# (Run the sudo env command generated by the output of the line above)
pm2 save
```

#### 4. Configure Reverse Proxy (Nginx) & SSL
Nginx acts as a high-performance entry point, forwarding public traffic on port 80/443 to port 3000.

```bash
# Install Nginx
sudo apt install nginx -y

# Configure block
sudo nano /etc/nginx/sites-available/sanadak-backend
```

Paste the configuration below (replace `api.yourdomain.com` with your subdomain):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/sanadak-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Obtain a free SSL Certificate using Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

---

## ⚡ Post-Deployment Checklist
1. **Database IP Whitelisting**: If using MongoDB Atlas, ensure you whitelist the production server's IP address (or set it to `0.0.0.0/0` temporarily to allow access from dynamic hosting platforms like Railway/Render).
2. **CORS Validation**: Confirm that `FRONTEND_URLS` matches your deployed user and admin websites exactly.
3. **Frontend API URL**: Update the api endpoints in your Angular applications to point to your new backend address (e.g. `https://api.yourdomain.com/api`).
