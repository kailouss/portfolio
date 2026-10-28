# Connected portfolio

The default website is the latest interactive globe portfolio, including draggable globe navigation, connected neural lines, project carousels, theme switching, and spring-spaced section labels.

## Run locally

Requires Node.js. No package installation is needed.

```sh
node server.cjs
```

Open http://127.0.0.1:4173/ to see the latest globe website.

- `index.html`: latest globe website (default entry point).
- `globe-prototype.html`: alternate entry point for the same globe website.
- `scrolling-portfolio.html`: earlier scrolling design, retained for comparison.

The globe JavaScript and styles live in the `globe-*.js` files and `globe-prototype.css`. Project information is in `projects.js`, and technology logos are in `assets/logos/`.

Some identity, biography, and contact text remains sample content. See `project-sources.md` for project references.
