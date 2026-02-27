# CI/CD (Auto-deploy on push to main)

This repo includes a GitHub Actions workflow at:
- `.github/workflows/deploy-vps.yml`

It SSHes into your VPS and runs `docker compose up -d --build` in `deploy/`.

## 1) VPS prerequisites

On the VPS (host OS, not inside OpenClaw container):
- Docker Engine installed
- Docker Compose plugin available (`docker compose version`)
- Ports 80/443 open (or adjust reverse proxy)

## 2) Put the repo on the VPS

Pick a folder, for example:
- `/opt/website-rag-SaaS`

Create `deploy/.env` on the VPS:

```bash
cd /opt/website-rag-SaaS/deploy
cp .env.example .env
nano .env
```

Update `deploy/Caddyfile` with your domain and email.

## 3) GitHub access from the VPS (required)

The workflow uses `git clone git@github.com:arakhajay/website-rag-SaaS.git`.
That means the VPS must be able to `git pull` via SSH.

Recommended: **Deploy key**
1. On the VPS:
   ```bash
   ssh-keygen -t ed25519 -C "vps-deploy-key" -f ~/.ssh/website_rag_saas_deploy_key
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/website_rag_saas_deploy_key
   cat ~/.ssh/website_rag_saas_deploy_key.pub
   ```
2. GitHub repo → Settings → Deploy keys → Add key
   - paste the `.pub`
   - allow read-only (or write if you really need it)
3. On the VPS, add an SSH config entry:
   `~/.ssh/config`
   ```ssh-config
   Host github.com
     IdentityFile ~/.ssh/website_rag_saas_deploy_key
     IdentitiesOnly yes
   ```

Test on VPS:
```bash
git clone git@github.com:arakhajay/website-rag-SaaS.git /opt/website-rag-SaaS
```

## 4) GitHub Actions secrets

Add these repository secrets:
- `VPS_HOST` (e.g. `187.77.188.105`)
- `VPS_USER` (e.g. `root`)
- `VPS_PORT` (optional, default 22)
- `VPS_APP_DIR` (e.g. `/opt/website-rag-SaaS`)
- `VPS_SSH_KEY` (private key that can SSH into the VPS)

Note: `VPS_SSH_KEY` is **NOT** the GitHub deploy key above.
- Deploy key: VPS → GitHub (pull code)
- Actions SSH key: GitHub Actions → VPS (run deploy commands)

## 5) First deploy

Once secrets are set and the repo exists on VPS, push to `main`.
GitHub Actions will auto-deploy.

## Rollback

On VPS:
```bash
cd /opt/website-rag-SaaS
git log --oneline -n 20
# pick a commit
git reset --hard <sha>
cd deploy
docker compose up -d --build
```
