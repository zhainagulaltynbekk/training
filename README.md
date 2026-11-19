# Comeback Training (PWA)

Phone app for the Comeback Fitness & Recomposition Plan (Tue A / Thu B / Sat C, walks Mon/Wed).
Plain HTML/CSS/JS, no build step. Data is stored only on the phone (localStorage); use More → Export backup.

- Run locally: `python -m http.server 8765` in this folder, open http://127.0.0.1:8765
- Host: any static host (GitHub Pages, Netlify, Cloudflare Pages). HTTPS is required for install/offline.
- After changing files, bump `VERSION` in `sw.js` so phones pick up the update.
- Exercise photos + instructions: free-exercise-db (public domain, Unlicense).
