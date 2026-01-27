# nobg

Extension Raycast pour supprimer l'arrière-plan des images localement avec rembg.

## Fonctionnalités

- Traitement 100% local (pas d'API externe)
- Sélection depuis le Finder
- Scan des images récentes dans un dossier configurable
- Formats supportés : PNG, JPG, JPEG, WebP
- Sortie en PNG avec transparence

## Prérequis

### rembg

```bash
pipx install rembg[cli]
```

Ou avec pip :

```bash
pip install rembg[cli]
```

## Installation

```bash
npm install
```

Dans Raycast : **Extensions** → **+** → **Import Extension** → Sélectionnez ce dossier

## Configuration

Copiez `.env.example` vers `.env` :

```bash
cp .env.example .env
```

| Variable | Description | Défaut |
|----------|-------------|--------|
| `REMBG_PATH` | Chemin vers rembg | `~/.local/bin/rembg` |
| `IMAGES_DIR` | Dossier source des images | `~/Downloads` |
| `OUTPUT_DIR` | Dossier de sortie | `~/Downloads` |

Le sous-dossier de sortie (`bg-removed` par défaut) est configurable dans les préférences Raycast.

## Utilisation

1. **Via le Finder** : Sélectionnez une image → Lancez la commande Raycast
2. **Via la liste** : Lancez la commande → Choisissez parmi les 50 images récentes

L'image traitée est sauvegardée avec le suffixe `-no-bg-[timestamp].png`.

## Dépannage

### rembg introuvable

Vérifiez le chemin dans `.env` :

```bash
which rembg
```

### Timeout lors du traitement

Le premier traitement télécharge les modèles (~200MB). Les suivants sont plus rapides.

## Licence

MIT
