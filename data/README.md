# Data model

This directory is the website's source of truth. Edit these files, run `..\build.bat`, and commit both `data/` and the regenerated `generated/` outputs.

## Relationship rules

Every row has a stable `id`. Relationship fields contain semicolon-separated IDs:

- `theme_ids` → `themes.csv`
- `project_ids` → `projects.csv`
- `software_ids` → `software.csv`
- `publication_ids` → `publications.csv`

The build script rejects missing IDs, duplicate IDs, and broken references.

## CSV conventions

- Encoding: UTF-8, preferably UTF-8 with BOM when editing in Excel.
- Separator: comma.
- Multi-value separator inside a cell: semicolon.
- Boolean values: `true` or `false`.
- Keep IDs lowercase and URL-safe; do not change an ID after other files link to it.
- Quote cells automatically when they contain commas. Excel and Python's `csv` module handle this correctly.

## Adding a publication

1. Add one row to `publications.csv`.
2. Choose an existing `primary_theme` and include it in `theme_ids`.
3. Add related `project_ids` / `software_ids` when applicable.
4. Use `first` or `coauthor` for `author_role`.
5. Run `..\build.bat`.
6. Open the homepage through `..\serve.bat` and test the filters and citation export.

## Adding a theme

Add the theme to `themes.csv` before referencing its ID elsewhere. A theme chip filters projects, software, publications, and notes together.

## Adding a project or software record

Use the bilingual columns for visitor-facing descriptions. Keep implementation-heavy details in `details_*` / `features_*`, while `summary_*` should explain the problem and value in one or two sentences.

## Adding a note or photo

Add the local image under `assets/images/`, then create a row in `notes.csv`. Notes can link to the same themes, projects, and software as the rest of the site.
