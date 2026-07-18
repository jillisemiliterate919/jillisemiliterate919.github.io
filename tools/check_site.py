#!/usr/bin/env python3
"""Check local static references and basic HTML integrity.

Uses only the Python standard library and is safe to run on Windows.
"""

from __future__ import annotations

import csv
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = [ROOT / "index.html", ROOT / "cv.html"]


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.references: list[tuple[str, str, int]] = []
        self.ids: list[tuple[str, int]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append((str(values["id"]), self.getpos()[0]))
        for attribute in ("src", "href", "poster"):
            value = values.get(attribute)
            if value:
                self.references.append((attribute, value, self.getpos()[0]))


def local_target(source: Path, value: str) -> Path | None:
    stripped = value.strip()
    if not stripped or stripped.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    split = urlsplit(stripped)
    if split.scheme or split.netloc:
        return None
    path = unquote(split.path)
    if not path:
        return None
    if path.startswith("/"):
        return ROOT / path.lstrip("/")
    return source.parent / path


def check_html(path: Path, errors: list[str]) -> None:
    parser = ReferenceParser()
    parser.feed(path.read_text(encoding="utf-8"))

    seen: dict[str, int] = {}
    for identifier, line in parser.ids:
        if identifier in seen:
            errors.append(
                f"{path.name}:{line}: duplicate id '{identifier}' "
                f"(first seen at line {seen[identifier]})."
            )
        else:
            seen[identifier] = line

    for attribute, value, line in parser.references:
        target = local_target(path, value)
        if target is not None and not target.exists():
            errors.append(f"{path.name}:{line}: missing {attribute} target '{value}'.")


def check_css(path: Path, errors: list[str]) -> None:
    content = path.read_text(encoding="utf-8")
    for match in re.finditer(r"url\((['\"]?)(.*?)\1\)", content):
        value = match.group(2).strip()
        target = local_target(path, value)
        if target is not None and not target.exists():
            line = content.count("\n", 0, match.start()) + 1
            errors.append(f"{path.relative_to(ROOT)}:{line}: missing CSS asset '{value}'.")


def check_note_images(errors: list[str]) -> None:
    path = ROOT / "data" / "notes.csv"
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        for line, row in enumerate(csv.DictReader(file), start=2):
            image = (row.get("image") or "").strip()
            if image and not (ROOT / image).exists():
                errors.append(f"data/notes.csv:{line}: missing image '{image}'.")


def main() -> int:
    errors: list[str] = []
    for path in HTML_FILES:
        if not path.exists():
            errors.append(f"Missing required HTML file: {path.name}.")
        else:
            check_html(path, errors)

    css_path = ROOT / "assets" / "css" / "styles.css"
    if not css_path.exists():
        errors.append("Missing required stylesheet: assets/css/styles.css.")
    else:
        check_css(css_path, errors)

    check_note_images(errors)

    if errors:
        print("Static site check failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("Static site references and HTML IDs are valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
