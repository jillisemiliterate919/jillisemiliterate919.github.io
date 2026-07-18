#!/usr/bin/env python3
"""Validate the website data and generate CV / bibliography exports.

This script uses only the Python standard library so it can run on a normal
Windows Python installation without pip packages.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import re
import shutil
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
GENERATED_DIR = ROOT / "generated"


def read_csv(name: str) -> list[dict[str, str]]:
    path = DATA_DIR / name
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def read_json(name: str) -> dict[str, Any]:
    path = DATA_DIR / name
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def split_list(value: str | None) -> list[str]:
    return [part.strip() for part in (value or "").split(";") if part.strip()]


def truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"true", "1", "yes", "y"}


def pick(record: dict[str, Any], key: str, language: str) -> str:
    return str(
        record.get(f"{key}_{language}")
        or record.get(key)
        or record.get(f"{key}_en")
        or record.get(f"{key}_ko")
        or ""
    )


def unique_ids(rows: list[dict[str, str]], label: str, errors: list[str]) -> set[str]:
    ids = [row.get("id", "").strip() for row in rows]
    missing = [index + 2 for index, value in enumerate(ids) if not value]
    if missing:
        errors.append(f"{label}: missing id at CSV line(s) {missing}.")
    duplicates = [item for item, count in Counter(ids).items() if item and count > 1]
    if duplicates:
        errors.append(f"{label}: duplicate id(s): {', '.join(sorted(duplicates))}.")
    return {value for value in ids if value}


def validate_references(
    rows: list[dict[str, str]],
    field: str,
    valid_ids: set[str],
    label: str,
    errors: list[str],
) -> None:
    for row in rows:
        item_id = row.get("id", "<missing>")
        for reference in split_list(row.get(field)):
            if reference not in valid_ids:
                errors.append(f"{label} '{item_id}': unknown {field} reference '{reference}'.")


def validate(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    themes = data["themes"]
    projects = data["projects"]
    software = data["software"]
    publications = data["publications"]
    awards = data["awards"]
    notes = data["notes"]

    theme_ids = unique_ids(themes, "themes.csv", errors)
    project_ids = unique_ids(projects, "projects.csv", errors)
    software_ids = unique_ids(software, "software.csv", errors)
    publication_ids = unique_ids(publications, "publications.csv", errors)
    unique_ids(awards, "awards.csv", errors)
    unique_ids(notes, "notes.csv", errors)

    for rows, label in [
        (projects, "projects.csv"),
        (software, "software.csv"),
        (publications, "publications.csv"),
        (notes, "notes.csv"),
    ]:
        validate_references(rows, "theme_ids", theme_ids, label, errors)

    validate_references(projects, "software_ids", software_ids, "projects.csv", errors)
    validate_references(software, "project_ids", project_ids, "software.csv", errors)
    validate_references(publications, "project_ids", project_ids, "publications.csv", errors)
    validate_references(publications, "software_ids", software_ids, "publications.csv", errors)
    validate_references(notes, "project_ids", project_ids, "notes.csv", errors)
    validate_references(notes, "software_ids", software_ids, "notes.csv", errors)
    validate_references(awards, "publication_ids", publication_ids, "awards.csv", errors)

    for publication in publications:
        item_id = publication.get("id", "<missing>")
        year = publication.get("year", "")
        if not re.fullmatch(r"\d{4}", year):
            errors.append(f"publications.csv '{item_id}': year must be four digits.")
        if publication.get("type") not in {"journal-article", "conference-paper"}:
            errors.append(f"publications.csv '{item_id}': unsupported type '{publication.get('type')}'.")
        if publication.get("author_role") not in {"first", "coauthor"}:
            errors.append(
                f"publications.csv '{item_id}': author_role must be 'first' or 'coauthor'."
            )
        primary = publication.get("primary_theme", "")
        if primary and primary not in split_list(publication.get("theme_ids")):
            errors.append(
                f"publications.csv '{item_id}': primary_theme must also appear in theme_ids."
            )

    profile = data["profile"]
    for key in ("schema_version", "last_updated", "identity", "intro", "contact", "education"):
        if key not in profile:
            errors.append(f"profile.json: missing top-level key '{key}'.")

    return errors


def load_all() -> dict[str, Any]:
    return {
        "profile": read_json("profile.json"),
        "themes": read_csv("themes.csv"),
        "projects": read_csv("projects.csv"),
        "software": read_csv("software.csv"),
        "publications": read_csv("publications.csv"),
        "awards": read_csv("awards.csv"),
        "notes": read_csv("notes.csv"),
    }


def latex_escape(value: str) -> str:
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    return "".join(replacements.get(char, char) for char in str(value))


def bibtex_escape(value: str) -> str:
    return latex_escape(value)


def publication_citation(publication: dict[str, str]) -> str:
    authors = ", ".join(split_list(publication.get("authors")))
    doi = f" https://doi.org/{publication['doi']}" if publication.get("doi") else ""
    citation = (
        f"{authors} ({publication.get('year', '')}). "
        f"{publication.get('title', '')}. {publication.get('venue', '')}{doi}"
    )
    return re.sub(r"\s+", " ", citation).strip()


def bibtex_entry(publication: dict[str, str]) -> str:
    entry_type = "article" if publication.get("type") == "journal-article" else "inproceedings"
    container_field = "journal" if entry_type == "article" else "booktitle"
    fields = [
        f"  title = {{{bibtex_escape(publication.get('title', ''))}}}",
        "  author = {"
        + " and ".join(bibtex_escape(author) for author in split_list(publication.get("authors")))
        + "}",
        f"  year = {{{publication.get('year', '')}}}",
        f"  {container_field} = {{{bibtex_escape(publication.get('venue', ''))}}}",
    ]
    if publication.get("doi"):
        fields.append(f"  doi = {{{publication['doi']}}}")
    if publication.get("url"):
        fields.append(f"  url = {{{publication['url']}}}")
    return f"@{entry_type}{{{publication['id']},\n" + ",\n".join(fields) + "\n}"


def publications_bibtex(publications: Iterable[dict[str, str]]) -> str:
    return "\n\n".join(bibtex_entry(item) for item in publications) + "\n"


def publications_ris(publications: Iterable[dict[str, str]]) -> str:
    blocks: list[str] = []
    for item in publications:
        lines = [
            f"TY  - {'JOUR' if item.get('type') == 'journal-article' else 'CPAPER'}",
            f"ID  - {item['id']}",
            f"TI  - {item.get('title', '')}",
        ]
        lines.extend(f"AU  - {author}" for author in split_list(item.get("authors")))
        lines.extend(
            [
                f"PY  - {item.get('year', '')}",
                f"{'JO' if item.get('type') == 'journal-article' else 'T2'}  - {item.get('venue', '')}",
            ]
        )
        if item.get("doi"):
            lines.append(f"DO  - {item['doi']}")
        if item.get("url"):
            lines.append(f"UR  - {item['url']}")
        lines.append("ER  - ")
        blocks.append("\n".join(lines))
    return "\n\n".join(blocks) + "\n"


def parse_csl_author(author: str) -> dict[str, str]:
    if "," in author:
        family, given = author.split(",", 1)
        return {"family": family.strip(), "given": given.strip()}
    return {"literal": author.strip()}


def publications_csl(publications: Iterable[dict[str, str]]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    for item in publications:
        entry: dict[str, Any] = {
            "id": item["id"],
            "type": "article-journal"
            if item.get("type") == "journal-article"
            else "paper-conference",
            "title": item.get("title", ""),
            "author": [parse_csl_author(author) for author in split_list(item.get("authors"))],
            "issued": {"date-parts": [[int(item.get("year", "0") or 0)]]},
            "container-title": item.get("venue", ""),
            "keyword": ", ".join(split_list(item.get("theme_ids"))),
        }
        if item.get("doi"):
            entry["DOI"] = item["doi"]
        if item.get("url"):
            entry["URL"] = item["url"]
        output.append(entry)
    return output


def concise_publications(publications: list[dict[str, str]]) -> list[dict[str, str]]:
    return [
        item
        for item in publications
        if item.get("type") == "journal-article" or item.get("author_role") == "first"
    ]


def sort_publications(publications: list[dict[str, str]]) -> list[dict[str, str]]:
    return sorted(publications, key=lambda item: (-int(item["year"]), item["title"].lower()))


def markdown_cv(data: dict[str, Any], language: str) -> str:
    profile = data["profile"]
    identity = profile["identity"]
    contact = profile["contact"]
    name = identity.get(f"name_{language}", identity["name_en"])
    role = identity.get(f"role_{language}", identity["role_en"])
    affiliation = identity.get(f"affiliation_{language}", identity["affiliation_en"])
    intro = profile["intro"].get(f"short_{language}", profile["intro"]["short_en"])
    projects = sorted(
        [item for item in data["projects"] if truthy(item.get("featured"))],
        key=lambda item: int(item.get("order", "999")),
    )
    software = sorted(
        [item for item in data["software"] if truthy(item.get("featured"))],
        key=lambda item: int(item.get("order", "999")),
    )
    awards = sorted(
        [item for item in data["awards"] if truthy(item.get("featured"))],
        key=lambda item: item.get("date", ""),
        reverse=True,
    )
    publications = concise_publications(sort_publications(data["publications"]))

    labels = {
        "en": {
            "profile": "Profile",
            "education": "Education",
            "projects": "Selected research projects",
            "publications": "Selected publications",
            "software": "Research software",
            "awards": "Selected awards",
        },
        "ko": {
            "profile": "소개",
            "education": "학력",
            "projects": "주요 연구 프로젝트",
            "publications": "주요 논문",
            "software": "연구 소프트웨어",
            "awards": "주요 수상",
        },
    }[language]

    lines = [
        f"# {name}",
        "",
        f"**{role}**  ",
        f"{affiliation}  ",
        f"{contact['email']} · {contact['github']} · {contact['orcid']}",
        "",
        f"## {labels['profile']}",
        "",
        intro,
        "",
        f"## {labels['education']}",
        "",
    ]

    for item in profile["education"]:
        degree = item.get(f"degree_{language}", item["degree_en"])
        institution = item.get(f"institution_{language}", item["institution_en"])
        thesis = item.get(f"thesis_{language}", item.get("thesis_en", ""))
        lines.extend([f"### {degree} — {institution}", f"*{item['period']}*"])
        if thesis:
            lines.append(thesis)
        lines.append("")

    lines.extend([f"## {labels['projects']}", ""])
    for item in projects:
        lines.extend(
            [
                f"### {pick(item, 'title', language)}",
                f"*{item['period']} · {pick(item, 'funder', language)}*",
                pick(item, "role", language),
                "",
                pick(item, "summary", language),
                "",
            ]
        )

    lines.extend([f"## {labels['publications']}", ""])
    lines.extend(f"- {publication_citation(item)}" for item in publications)
    lines.extend(["", f"## {labels['software']}", ""])
    for item in software:
        lines.append(
            f"- **{item['name']}** — {pick(item, 'summary', language)} ({item['repo_url']})"
        )

    lines.extend(["", f"## {labels['awards']}", ""])
    for item in awards:
        lines.append(
            f"- **{item['date']} — {pick(item, 'title', language)}**. "
            f"{pick(item, 'organization', language)}. {pick(item, 'work', language)}"
        )

    return "\n".join(lines).strip() + "\n"


def latex_cv(data: dict[str, Any], language: str) -> str:
    profile = data["profile"]
    identity = profile["identity"]
    contact = profile["contact"]
    name = identity.get(f"name_{language}", identity["name_en"])
    role = identity.get(f"role_{language}", identity["role_en"])
    affiliation = identity.get(f"affiliation_{language}", identity["affiliation_en"])
    intro = profile["intro"].get(f"short_{language}", profile["intro"]["short_en"])
    projects = sorted(
        [item for item in data["projects"] if truthy(item.get("featured"))],
        key=lambda item: int(item.get("order", "999")),
    )
    software = sorted(
        [item for item in data["software"] if truthy(item.get("featured"))],
        key=lambda item: int(item.get("order", "999")),
    )
    awards = sorted(
        [item for item in data["awards"] if truthy(item.get("featured"))],
        key=lambda item: item.get("date", ""),
        reverse=True,
    )
    publications = concise_publications(sort_publications(data["publications"]))

    labels = {
        "en": {
            "profile": "Profile",
            "education": "Education",
            "projects": "Selected Research Projects",
            "publications": "Selected Publications",
            "software": "Research Software",
            "awards": "Selected Awards",
        },
        "ko": {
            "profile": "소개",
            "education": "학력",
            "projects": "주요 연구 프로젝트",
            "publications": "주요 논문",
            "software": "연구 소프트웨어",
            "awards": "주요 수상",
        },
    }[language]

    lines = [
        r"\documentclass[10pt,a4paper]{article}",
        r"\usepackage[margin=18mm]{geometry}",
        r"\usepackage{enumitem}",
        r"\usepackage[hidelinks]{hyperref}",
    ]
    if language == "ko":
        lines.append(r"\usepackage{kotex}")
    lines.extend(
        [
            r"\setlength{\parindent}{0pt}",
            r"\begin{document}",
            rf"{{\LARGE {latex_escape(name)}}}\\[3pt]",
            rf"{latex_escape(role)}\\",
            rf"{latex_escape(affiliation)}\\",
            rf"\href{{mailto:{latex_escape(contact['email'])}}}{{{latex_escape(contact['email'])}}} "
            rf"\quad \url{{{contact['github']}}} \quad \url{{{contact['orcid']}}}",
            "",
            rf"\section*{{{latex_escape(labels['profile'])}}}",
            latex_escape(intro),
            "",
            rf"\section*{{{latex_escape(labels['education'])}}}",
            r"\begin{itemize}[leftmargin=*,nosep]",
        ]
    )
    for item in profile["education"]:
        degree = item.get(f"degree_{language}", item["degree_en"])
        institution = item.get(f"institution_{language}", item["institution_en"])
        thesis = item.get(f"thesis_{language}", item.get("thesis_en", ""))
        suffix = rf"\\\emph{{{latex_escape(thesis)}}}" if thesis else ""
        lines.append(
            rf"\item \textbf{{{latex_escape(degree)}}}, {latex_escape(institution)} "
            rf"\hfill {latex_escape(item['period'])}{suffix}"
        )
    lines.extend(
        [
            r"\end{itemize}",
            "",
            rf"\section*{{{latex_escape(labels['projects'])}}}",
            r"\begin{itemize}[leftmargin=*]",
        ]
    )
    for item in projects:
        lines.append(
            rf"\item \textbf{{{latex_escape(pick(item, 'title', language))}}} "
            rf"\hfill {latex_escape(item['period'])}\\"
            rf"{latex_escape(pick(item, 'funder', language))}; "
            rf"{latex_escape(pick(item, 'role', language))}. "
            rf"{latex_escape(pick(item, 'summary', language))}"
        )
    lines.extend(
        [
            r"\end{itemize}",
            "",
            rf"\section*{{{latex_escape(labels['publications'])}}}",
            r"\begin{enumerate}[leftmargin=*]",
        ]
    )
    lines.extend(rf"\item {latex_escape(publication_citation(item))}" for item in publications)
    lines.extend(
        [
            r"\end{enumerate}",
            "",
            rf"\section*{{{latex_escape(labels['software'])}}}",
            r"\begin{itemize}[leftmargin=*]",
        ]
    )
    for item in software:
        lines.append(
            rf"\item \textbf{{{latex_escape(item['name'])}}} --- "
            rf"{latex_escape(pick(item, 'summary', language))}\\"
            rf"\url{{{item['repo_url']}}}"
        )
    lines.extend(
        [
            r"\end{itemize}",
            "",
            rf"\section*{{{latex_escape(labels['awards'])}}}",
            r"\begin{itemize}[leftmargin=*]",
        ]
    )
    for item in awards:
        lines.append(
            rf"\item {latex_escape(item['date'])} --- "
            rf"\textbf{{{latex_escape(pick(item, 'title', language))}}}, "
            rf"{latex_escape(pick(item, 'organization', language))}. "
            rf"{latex_escape(pick(item, 'work', language))}"
        )
    lines.extend([r"\end{itemize}", r"\end{document}", ""])
    return "\n".join(lines)


def standalone_cv_html(markdown_text: str, language: str) -> str:
    # A deliberately simple export that remains editable and printable.
    lines = markdown_text.splitlines()
    output: list[str] = []
    in_list = False
    for line in lines:
        if line.startswith("- "):
            if not in_list:
                output.append("<ul>")
                in_list = True
            output.append(f"<li>{html.escape(line[2:])}</li>")
            continue
        if in_list:
            output.append("</ul>")
            in_list = False
        if line.startswith("# "):
            output.append(f"<h1>{html.escape(line[2:])}</h1>")
        elif line.startswith("## "):
            output.append(f"<h2>{html.escape(line[3:])}</h2>")
        elif line.startswith("### "):
            output.append(f"<h3>{html.escape(line[4:])}</h3>")
        elif line:
            output.append(f"<p>{html.escape(line)}</p>")
    if in_list:
        output.append("</ul>")

    title = "조형곤 CV" if language == "ko" else "Hyeong-Gon Jo CV"
    return f"""<!doctype html>
<html lang="{language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<style>
body{{max-width:860px;margin:42px auto;padding:0 24px;color:#16231d;font:15px/1.62 "Segoe UI","Malgun Gothic",sans-serif}}
h1{{font:500 46px/1.05 Georgia,serif;border-bottom:2px solid #16231d;padding-bottom:18px}}
h2{{margin-top:34px;padding-top:15px;border-top:1px solid #cbd5cd;color:#305744;font-size:14px;letter-spacing:.06em;text-transform:uppercase}}
h3{{font-size:16px;margin-bottom:4px}}p{{margin:5px 0;color:#52675c}}li{{margin:7px 0}}a{{color:#305744}}
</style>
</head>
<body>
{''.join(output)}
</body>
</html>
"""


def generate(data: dict[str, Any]) -> None:
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    publications = sort_publications(data["publications"])

    (GENERATED_DIR / "publications.bib").write_text(
        publications_bibtex(publications), encoding="utf-8"
    )
    (GENERATED_DIR / "publications.ris").write_text(
        publications_ris(publications), encoding="utf-8"
    )
    (GENERATED_DIR / "publications.csl.json").write_text(
        json.dumps(publications_csl(publications), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    for language in ("en", "ko"):
        markdown = markdown_cv(data, language)
        (GENERATED_DIR / f"cv-{language}.md").write_text(markdown, encoding="utf-8")
        (GENERATED_DIR / f"cv-{language}.tex").write_text(
            latex_cv(data, language), encoding="utf-8"
        )
        (GENERATED_DIR / f"cv-{language}.html").write_text(
            standalone_cv_html(markdown, language), encoding="utf-8"
        )
        payload = {
            "schema_version": 1,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "language": language,
            "profile": data["profile"],
            "projects": [
                item for item in data["projects"] if truthy(item.get("featured"))
            ],
            "publications": concise_publications(publications),
            "software": [
                item for item in data["software"] if truthy(item.get("featured"))
            ],
            "awards": [item for item in data["awards"] if truthy(item.get("featured"))],
        }
        (GENERATED_DIR / f"cv-{language}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    report = {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "counts": {
            "themes": len(data["themes"]),
            "projects": len(data["projects"]),
            "software": len(data["software"]),
            "publications": len(data["publications"]),
            "awards": len(data["awards"]),
            "notes": len(data["notes"]),
        },
        "publication_categories": dict(
            sorted(Counter(item["category"] for item in data["publications"]).items())
        ),
    }
    (GENERATED_DIR / "build-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Validate data without regenerating exported files.",
    )
    args = parser.parse_args()

    try:
        data = load_all()
    except (FileNotFoundError, json.JSONDecodeError, csv.Error) as error:
        print(f"ERROR: could not read data: {error}", file=sys.stderr)
        return 1

    errors = validate(data)
    if errors:
        print("Validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    if not args.validate_only:
        generate(data)
        print(f"Generated exports in: {GENERATED_DIR}")
    print(
        "Validated "
        f"{len(data['publications'])} publications, "
        f"{len(data['projects'])} projects, "
        f"{len(data['software'])} software records, and "
        f"{len(data['themes'])} themes."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
