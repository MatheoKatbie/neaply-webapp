# Batch Scripts

Ce dossier contient les scripts batch pour la maintenance de la base de données.

## Scripts disponibles

### `purge-notifications.ts`

Supprime les notifications anciennes de la base de données.

#### Usage

```bash
# Supprimer les notifications de plus de 9 mois (par défaut)
npx ts-node batch/purge-notifications.ts

# Supprimer les notifications de plus de 6 mois
npx ts-node batch/purge-notifications.ts --months=6

# Mode dry-run (prévisualisation sans suppression)
npx ts-node batch/purge-notifications.ts --dry-run

# Avec détails (breakdown par type et statut)
npx ts-node batch/purge-notifications.ts --verbose

# Combinaison d'options
npx ts-node batch/purge-notifications.ts --months=12 --dry-run --verbose
```

#### Options

| Option | Description | Défaut |
|--------|-------------|--------|
| `--months=N` | Supprimer les notifications de plus de N mois | 9 |
| `--dry-run` | Prévisualiser sans supprimer | false |
| `--verbose` | Afficher les détails par type et statut | false |

## Planification (Cron)

Pour exécuter automatiquement le script de purge chaque mois :

```bash
# Ajouter au crontab (exécution le 1er de chaque mois à 3h du matin)
0 3 1 * * cd /path/to/neaply-webapp && npx ts-node batch/purge-notifications.ts >> /var/log/purge-notifications.log 2>&1
```

## Avec Vercel Cron (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/purge-notifications",
      "schedule": "0 3 1 * *"
    }
  ]
}
```

Note: Pour utiliser avec Vercel Cron, créer un endpoint API correspondant.
