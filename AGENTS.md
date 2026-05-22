# Inomedia – Agent Instructions

## Video Management

### Adding competition videos

Videos live in `scripts/seed-2026.prod.ts` in the `COMPETITION_VIDEOS` array.
The array is ordered **oldest-first** (matches reverse channel upload order).

When adding new videos, preserve that order by fetching the channel's video list first.

### Fetching channel video order

YouTube channel pages render via JS, so `WebFetch` only returns footer HTML.
Instead, run `scripts/fetch-channel-videos.sh` — it fetches the raw HTML and parses `ytInitialData`:

```bash
bash scripts/fetch-channel-videos.sh
```

@scripts/fetch-channel-videos.sh

Output is **newest-first**. Reverse it to get the seed insertion order.

### Video schema

| Field | Notes |
|---|---|
| `title` | Official title as given by contest organizers |
| `schools` | Array — a video may have multiple schools |
| `locality` | City/town |
| `county` | Romanian county (județ) |
| `category` | e.g. `Reportaj`, `Documentar`, `Regie, Montaj` |
| `youtubeUrl` | Full `https://www.youtube.com/watch?v=…` URL |
| `thumbnailUrl` | Auto-generated from `youtubeUrl` by `thumbnailFromYoutubeUrl()` |

### Sebeș → Alba county

All Sebeș entries use `county: 'Alba'`. Infer this when organizers omit the county.
