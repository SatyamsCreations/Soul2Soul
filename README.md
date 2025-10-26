# Soul2Soul (Astro + Tailwind)

Modern, fast, minimal blog built with Astro, Tailwind CSS, and MDX. Ships with posts, tags, dark mode, sitemap, search (Pagefind), and GitHub Pages deploy.

Demo locally: http://localhost:4321

## Tech stack

- Astro 5 (static-first, content collections)
- Tailwind CSS 4 (utility-first styling)
- MDX for posts
- Shiki highlighting
- Pagefind (static search, postbuild)
- Sitemap
- Dark mode toggle

## Repo layout

- src/pages
  - index.astro (home)
  - posts/[slug].astro (post page)
  - tags/index.astro, tags/[tag].astro (tag pages)
  - about.astro
  - 404.astro
  - search.astro (Pagefind UI after build)
- src/content
  - config.ts (content schema)
  - posts/ (your .md/.mdx posts)
- src/components (Header, Footer, ThemeToggle)
- src/layouts (BaseLayout)
- src/lib (posts utils)

## Getting started

1) Install
- Ensure Node 18/20+
- From project root (this folder):
  npm install

2) Run dev
- Starts Astro dev server:
  npm run dev
- Open http://localhost:4321

3) Build + preview
- Production build + search index:
  npm run build
  npm run preview
- Search UI enabled after build at /search.

## Writing posts

- Create files in src/content/posts with .md or .mdx:
  ---
  title: "My Post"
  description: "Short description"
  date: "2025-10-26"
  draft: false
  tags: ["tag1", "tag2"]
  author: "Admin"
  ---

  # Heading
  Content here…

- Drafts (draft: true) are excluded from production.

## Tags

- Add tags in frontmatter (tags array).
- Tag listing at /tags and /tags/[tag].

## Theming and styling

- Tailwind 4 is enabled. Global styles in src/styles/global.css.
- Dark mode toggle in header, persisted via localStorage.
- Update site name in src/components/Header.astro and Footer.astro text.

## SEO

- Sitemap: /sitemap-index.xml (via @astrojs/sitemap)
- Update site metadata in site.config.ts and Astro config (via env, see below).

## GitHub Pages deploy

This project is configured to deploy via GitHub Actions to GitHub Pages.

Important:
- The workflow file is at .github/workflows/deploy.yml (repo root).
- The Astro config reads site/base from env:
  - SITE (full URL), BASE_URL (path prefix, e.g. /repo/)
- The workflow step sets these based on the repository.

Steps:
1) Create a new GitHub repo and push this project (this folder must be repository root so that .github/workflows is at the top level).
2) Enable Pages:
   - Settings → Pages → Source: GitHub Actions
3) Push to main. Workflow will:
   - Install deps
   - Build
   - Generate Pagefind index and UI
   - Deploy to GitHub Pages

If using a user org site vs project site:
- Project site (recommended):
  SITE=https://<owner>.github.io/<repo>/
  BASE_URL=/<repo>/
- User/Org site:
  SITE=https://<owner>.github.io/
  BASE_URL=/

The included workflow auto-derives these for a project site. If you need a user/org site, change the “Configure Astro base/site” step or set env manually.

## Custom domain (CNAME)

If you have a custom domain, add a CNAME file at the repo root with your domain, and update SITE accordingly in CI or astro.config.mjs.

## Search (Pagefind)

- The search index is generated at postbuild and served from /pagefind.
- During dev, the search UI will show a note until you run a production build.

## Accessibility and performance

- Accessible focus states, dark mode, zero-JS pages where possible.
- Lighthouse targets 95+ across categories with typical content.

## Roadmap (optional enhancements)

- Comments (Giscus)
- Analytics (Plausible/Umami)
- Dynamic OG images (Satori/Resvg)
- Related posts
- More MDX shortcodes

## License

MIT (you can change this to your preference)
