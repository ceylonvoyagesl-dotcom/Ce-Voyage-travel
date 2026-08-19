# Ce Voyage — GitHub Pages Deploy

Local git repo is ready on branch `main`.

## 1. Create repository on GitHub

1. Open https://github.com/new
2. Repository name: `ce-voyage-website` (or any name)
3. Public
4. **Do not** add README / .gitignore / license (repo already has files)
5. Create repository

## 2. Push from this folder

Replace `YOUR_USERNAME` with your GitHub username.

```bash
cd CeVoyage_Website

git remote add origin https://github.com/YOUR_USERNAME/ce-voyage-website.git
git push -u origin main
```

Login when GitHub asks (browser or personal access token).

### If you use SSH

```bash
git remote add origin git@github.com:YOUR_USERNAME/ce-voyage-website.git
git push -u origin main
```

## 3. Enable GitHub Pages

1. Repo → **Settings** → **Pages** (left menu)
2. **Source**: Deploy from a branch
3. **Branch**: `main` → folder `/ (root)`
4. Save

Wait 1–2 minutes. Site URL:

`https://YOUR_USERNAME.github.io/ce-voyage-website/`

## 4. Optional custom domain

Settings → Pages → Custom domain → `www.ce-voyage.com`  
(Add DNS records as GitHub shows.)

## Update later

After you change files:

```bash
cd CeVoyage_Website
git add .
git commit -m "Update site"
git push
```

Pages will redeploy automatically.
