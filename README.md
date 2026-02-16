# Personal Blog Starter (Astro)

This repository is a personal blog starter built with [Astro](https://astro.build), ready for static hosting.

## Purpose

This project is configured as a clean, personal blog template: write posts in Markdown/MDX, keep content under version control, and publish with a static build.

## Project Structure

```text
├── public/               # Static assets (images, fonts, favicon)
│   ├── assets/          # Images for blog posts
│   └── fonts/           # Web fonts
├── src/
│   ├── assets/          # Icons and images used in components
│   ├── components/      # Reusable UI components
│   │   └── ui/          # React components
│   ├── content/         # Content collections
│   │   └── blog/        # Blog posts in Markdown format (organized by year)
│   ├── layouts/         # Page layouts and templates
│   ├── pages/           # Routes and pages
│   ├── styles/          # Global styles and CSS
│   └── utils/           # Utility functions
├── astro.config.mjs     # Astro configuration
├── package.json         # Project dependencies and scripts
├── tailwind.config.mjs  # Tailwind CSS configuration
└── LICENSE              # Dual license (CC BY 4.0 + MIT)
```

## Commands

| Command                | Action                                      |
| :--------------------- | :------------------------------------------ |
| `npm install`          | Installs dependencies                       |
| `npm run dev`          | Starts local dev server at `localhost:4321` |
| `npm run build`        | Build the production site to `./dist/`      |
| `npm run preview`      | Preview the build locally, before deploying |
| `npm run new:post`     | Interactive blog post creator CLI           |

## Deployment

Deploy the generated `dist` folder to any static host.

## Create a New Blog Post (CLI)

Use the interactive post generator:

```bash
npm run new:post
```

The CLI now has a guided flow:

- asks for common fields first (`title`, `description`, `tags`, `draft`)
- asks file options (`year`, `slug`, `md`/`mdx`)
- asks whether you want **detailed configuration** for less-used fields

`pubDatetime` is generated automatically and is not prompted for.  
Press Enter on optional prompts to skip.

It creates a file in:

```text
src/content/blog/<year>/<slug>.md
```

Defaults:

- `pubDatetime`: current local ISO datetime
- `year`: current year
- `slug`: generated from title (or `new-post` if title is empty)
- `extension`: `md` (can be changed to `mdx`)

## License

This repository uses dual licensing:

- **Documentation & Blog Posts**: Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
- **Code & Code Snippets**: Licensed under the [MIT License](LICENSE)

See the [LICENSE](LICENSE) file for full details.

## Project Guide

For a complete walkthrough (architecture, customization points, and workflow), see `docs/PROJECT_GUIDE.md`.
