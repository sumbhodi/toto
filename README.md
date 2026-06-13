# toto

A chatbot you own. Bring your own key — nobody's tokens but yours.

toto is a thin, honest AI harness: a persona, your context, your key, five skins. It runs entirely in your browser. The key you paste never leaves your device — toto has no server to send it to.

## Run

It's a static site. Serve the folder:

    python3 -m http.server 8000

Then open `http://localhost:8000`. Host it anywhere static — GitHub Pages, ozhunga.

## First run — the key gate

Settings opens and stays open until you add a key. No key, no chat. Two ways across:

- **A free key** — Groq · Gemini · Mistral · Cerebras · SambaNova · OpenRouter · GitHub Models. All free, no credit card. Sign-up links are in Settings → Free API Keys.
- **Local** — point toto at Ollama / LM Studio / MLX on your own machine. No key at all.

Your key is saved only in your browser (localStorage). Switch Auth or clear the field to wipe it.

## The harness

- **Persona** — who the bot is
- **You** — name, how you think, how you want to be treated
- **Project** — the mission, plus files injected into every turn
- **Skins** — beach · neo · analog · historian · phone

## Providers

Called straight from your browser, with your key:

Anthropic (Claude) · OpenAI · GitHub Models · and the OpenAI-compatible free tier (Groq, Gemini, Mistral, Cerebras, SambaNova, OpenRouter). Local via any OpenAI-compatible server.

## Why it's built this way

Glass boxes and seams.

The key is yours. The data is yours. The model is yours to pick.

toto is the harness, not the landlord.

## License

BSL 1.1 — use it, build with it, learn from it. Make money from it, pay me. Four years after release it turns Apache 2.0. See [LICENSE](LICENSE).

gowf —
Sum Bhodi
