# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Raycast extension for local image background removal using `rembg`.

## Development

```bash
npm run dev        # Development mode
npm run build      # Build extension
npm run lint       # Lint code
npm run fix-lint   # Auto-fix lint issues
```

## Prerequisites

Install rembg CLI:
```bash
pipx install rembg[cli]
```

## Configuration

Copy `.env.example` to `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `REMBG_PATH` | Path to rembg executable | `~/.local/bin/rembg` |
| `IMAGES_DIR` | Source folder for images | `~/Downloads` |
| `OUTPUT_DIR` | Base output directory | `~/Downloads` |

Output subfolder is configurable via Raycast preferences.

## Architecture

Single-file extension (`src/remove-background.tsx`):
- Loads `.env` from extension root
- Checks Finder selection first, falls back to scanning `IMAGES_DIR`
- Executes `rembg i [input] [output]` with 120s timeout
- Outputs PNG to `{OUTPUT_DIR}/{outputFolder}/[name]-no-bg-[timestamp].png`
