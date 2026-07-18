# Hyeong-Gon Jo — research & software website

A static, bilingual personal research website designed for GitHub Pages. The site keeps publications, projects, software, research themes, awards, notes, and CV outputs in a small set of structured data files instead of duplicating the same content across HTML pages.

## Replace the current repository

1. Keep the existing `.git` directory in your local clone.
2. Delete the other files in the clone.
3. Copy the **contents** of this ZIP into the repository root.
4. Double-click `serve.bat` to preview the site locally.
5. Double-click `build.bat` after editing data.
6. Commit and push.

```bat
git add -A
git commit -m "Rebuild personal research website"
git push
```

GitHub Pages can serve the repository directly from the default branch. The `.nojekyll` file prevents Jekyll from changing the static-file layout.

## Main files

- `index.html` — long-form homepage; most content is visible or expandable in place.
- `cv.html` — database-generated CV viewer and browser-side exporter.
- `data/` — canonical content sources.
- `generated/` — static bibliography and CV exports produced by `tools/build.py`.
- `assets/js/` — CSV loading, bilingual rendering, filtering, cross-linking, and exports.
- `assets/css/styles.css` — all site and print styles.
- `tools/build.py` — standard-library-only validator and export generator.

## Editing workflow

The canonical data files are:

| File | Purpose |
|---|---|
| `data/profile.json` | Identity, introduction, contact, education, teaching, skills, certifications |
| `data/themes.csv` | Research-theme vocabulary shared by all sections |
| `data/projects.csv` | Collaborative research projects and roles |
| `data/software.csv` | Research software and independent development projects |
| `data/publications.csv` | Publications and presentation records |
| `data/awards.csv` | Awards linked to publication IDs |
| `data/notes.csv` | Short notes/photo-feed entries linked to projects and software |

Use UTF-8 CSV. Multiple IDs in one cell are separated with semicolons, for example:

```text
green-retrofit;building-energy-simulation
```

After an edit, run:

```bat
build.bat
```

This validates unique IDs and cross-references, then regenerates:

- `generated/publications.bib`
- `generated/publications.ris`
- `generated/publications.csl.json`
- English and Korean CV files in Markdown, LaTeX, HTML, and JSON
- `generated/build-report.json`

`validate.bat` checks the data without rewriting generated files.

## Publication fields

`data/publications.csv` is the source for the homepage publication view, citation exports, and CV publication sections.

Important columns:

- `id` — stable citation key and cross-link ID.
- `title`, `authors`, `year`, `venue` — bibliographic fields.
- `type` — `journal-article` or `conference-paper`.
- `category` — international/domestic journal or conference grouping.
- `author_role` — `first` or `coauthor`.
- `awarded` — `true` or `false`.
- `doi`, `url` — source links.
- `theme_ids` — semicolon-separated theme IDs.
- `primary_theme` — one theme also present in `theme_ids`.
- `project_ids`, `software_ids` — cross-links to related work.

Publication titles remain in their official published language. The EN/KR switch translates the interface and bilingual descriptive content; it does not invent translated paper titles.

## Bilingual content

For bilingual CSV text, use paired columns such as `title_en` / `title_ko` and `summary_en` / `summary_ko`. The language switch in the upper-right corner updates the page immediately and stores the choice in the URL and browser storage.

## Images and photos

The current package uses a neutral monogram at `assets/images/profile-mark.svg` because the portrait embedded in the previous Notion export was not available as a recoverable repository file.

To use a portrait:

1. Add a local image, for example `assets/images/profile.jpg`.
2. In `index.html`, replace `assets/images/profile-mark.svg` in the profile `<img>` element with the new path.
3. Update its `alt`, `width`, and `height` if needed.

Notes use local SVG illustrations so the site has no external image dependency. Add real photos under `assets/images/` and put their paths in the `image` column of `data/notes.csv`.

## Local preview

Double-click:

```text
serve.bat
```

It starts a local server at `http://localhost:8000/`. Opening the HTML file directly with `file://` will not load CSV files in most browsers, so use the local server.

## Privacy defaults

The public email, GitHub, ORCID, affiliation, and office location from the previous site are retained. The phone number from the old page is omitted from the new public profile by default.
