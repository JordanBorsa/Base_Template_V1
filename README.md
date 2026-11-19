# Base_Template_V1

Template de projet préconfiguré pour Claude Code avec quatre outils exposés comme serveurs MCP (`.mcp.json`) et SDK Node (`package.json`), plus quatre outils vidéo/audio en ligne de commande que Claude utilise directement.

| Outil | Rôle | Serveur MCP | SDK / paquet | Clé requise |
|---|---|---|---|---|
| **Perplexity** | Recherche web avec réponses sourcées | `@perplexity-ai/mcp-server` (stdio) | — | `PERPLEXITY_API_KEY` |
| **Firecrawl** | Scraping, crawl, extraction en markdown | `firecrawl-mcp` (stdio) | `@mendable/firecrawl-js` | `FIRECRAWL_API_KEY` |
| **Playwright** | Pilotage d'un navigateur (headless) | `@playwright/mcp` (stdio) | `playwright` | aucune |
| **Composio** | Accès à des centaines d'apps (Gmail, Slack, GitHub…) | `https://connect.composio.dev/mcp` (HTTP) | `@composio/core` | `COMPOSIO_API_KEY` |

### Outils vidéo / audio (CLI)

| Outil | Rôle | Paquet | Commande |
|---|---|---|---|
| **HyperFrames** | Vidéo en HTML → MP4 (compositions, titres, sous-titres), + skills Claude Code | `hyperframes` (npm) | `npx hyperframes …` |
| **FFmpeg** | Conversion, découpe, encodage audio/vidéo | paquet système | `ffmpeg …` |
| **Whisper** | Transcription (via `faster-whisper`, CPU) | `faster-whisper` (pip) | `python3 scripts/transcribe.py fichier.mp4 --language fr --srt out.srt` |
| **yt-dlp** | Téléchargement vidéo/audio (YouTube, etc.) | `yt-dlp` (pip) | `yt-dlp -x --audio-format mp3 <url>` |

Ce ne sont pas des serveurs MCP : ce sont des CLI, et HyperFrames fournit ses propres *skills* Claude Code (`hyperframes`, `hyperframes-cli`, `media-use`…).

Les versions sont épinglées pour des installations reproductibles.

## Installation

```bash
npm install
npx playwright install chromium   # télécharge le navigateur (une seule fois)
cp .env.example .env              # puis renseigner les clés
pip install -r requirements.txt   # yt-dlp + Whisper
sudo apt-get install -y ffmpeg    # ou : brew install ffmpeg
npx hyperframes skills            # installe les skills HyperFrames dans ~/.claude/skills
```

## Utilisation avec Claude Code

`.mcp.json` lit les clés depuis les variables d'environnement (`${VAR}`). Exportez-les avant de lancer Claude Code :

```bash
set -a; source .env; set +a
claude
```

Au premier lancement, Claude Code demande d'approuver les serveurs du projet. Vérifiez ensuite avec `/mcp` (ou `claude mcp list`).

**Claude Code sur le web (cloud)** : n'utilisez pas `.env`. Ajoutez les clés comme secrets de l'environnement et autorisez les hôtes `api.perplexity.ai`, `api.firecrawl.dev` et `connect.composio.dev` dans les réglages réseau de l'environnement.
Pour Whisper (modèles) : `huggingface.co` et ses CDN (`cdn-lfs.huggingface.co`, `cdn-lfs.hf.co`, `cas-bridge.xethub.hf.co`, `transfer.xethub.hf.co`).
Pour yt-dlp sur YouTube : `www.youtube.com` **et** `*.googlevideo.com` (joker, à ajouter dans les réglages) ou un accès réseau complet.

## Vérification

```bash
set -a; source .env; set +a
npm run check:tools
```

Le script lance Chromium, appelle l'API Perplexity, fait un scrape Firecrawl de `example.com`, liste les toolkits Composio et vérifie FFmpeg, yt-dlp, Whisper et HyperFrames.

## Notes

- Composio : la clé se crée dans le dashboard Composio, section *AI Clients*. Les comptes d'apps (Gmail, Slack…) se connectent depuis ce même dashboard ou à la demande via l'outil MCP.
- Playwright MCP tourne en `--headless`. Retirez ce flag dans `.mcp.json` pour voir le navigateur en local.
- Ne commitez jamais `.env` (il est dans `.gitignore`).
