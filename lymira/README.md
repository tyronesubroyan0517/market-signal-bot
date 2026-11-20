# Lymira Creations website

Mobile-first static site for lymiracollective.com. It lives in this folder and is
independent of the Pulsewatch app in the repository root.

## Build

```bash
cd lymira
npm run build      # writes dist/
```

No dependencies. `build.mjs` turns the content in `src/content.mjs` into plain HTML pages.

## Editing

| To change | Edit |
|---|---|
| Products, prices, Payhip links, reviews, contact links | `src/content.mjs` |
| Page copy and layout | `build.mjs` |
| Colours, fonts, spacing | `src/styles.css` |

A product with `price: null` shows "See price in store". A product with `url: null`
sends the buy button to the main Payhip store page.

## Adding artwork

Every image area is a labelled placeholder until its file exists. Drop a file with the
right name into `assets/` (webp, jpg, png or svg) and rebuild. See `assets/README.md`
for the file names.

## Deploying to lymiracollective.com

1. In Vercel, create a new project from this repository and set **Root Directory** to `lymira`.
   `vercel.json` already sets the build command and output folder.
2. In the project's Domains settings, add `lymiracollective.com` and `www.lymiracollective.com`.
3. At the domain registrar, set the DNS records Vercel shows.
