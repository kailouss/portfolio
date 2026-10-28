# Connected portfolio

The latest globe portfolio, built with Vite and vanilla JavaScript.

## Run locally

Use Node.js 22.12+ or 24+.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173/. For a production build, run `npm run build`, then `npm run preview`.

## Structure

- `src/main.js`: Vite entry point.
- `src/app.js`: globe scene and section navigation.
- `src/globe/`: camera math, effects, and label layout.
- `src/components/`: project carousels.
- `src/data/`: project information and 28 technologies.
- `src/styles/`: site styles.
- `public/logos/`: technology logos.
- `docs/`: reference notes and preview images.
- `archive/scrolling/`: earlier comparison files; excluded from the production build.

Only the latest globe website is built for production. Some biography and contact text remains sample content. Project references are in `docs/project-sources.md`.
