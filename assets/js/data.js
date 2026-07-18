
(function () {
  "use strict";

  const FILES = {
    profile: "data/profile.json",
    themes: "data/themes.csv",
    projects: "data/projects.csv",
    software: "data/software.csv",
    publications: "data/publications.csv",
    awards: "data/awards.csv",
    notes: "data/notes.csv"
  };

  function parseCSV(text) {
    const source = String(text || "").replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      if (quoted) {
        if (char === '"') {
          if (source[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            quoted = false;
          }
        } else {
          field += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field.replace(/\r$/, ""));
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    if (field.length || row.length) {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
    }

    if (!rows.length) return [];
    const headers = rows.shift().map((header) => header.trim());
    return rows
      .filter((values) => values.some((value) => value !== ""))
      .map((values) => {
        const item = {};
        headers.forEach((header, index) => {
          item[header] = values[index] ?? "";
        });
        return item;
      });
  }

  async function fetchText(url) {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return response.text();
  }

  async function fetchJSON(url) {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return response.json();
  }

  async function loadAll() {
    const [profile, themes, projects, software, publications, awards, notes] = await Promise.all([
      fetchJSON(FILES.profile),
      fetchText(FILES.themes).then(parseCSV),
      fetchText(FILES.projects).then(parseCSV),
      fetchText(FILES.software).then(parseCSV),
      fetchText(FILES.publications).then(parseCSV),
      fetchText(FILES.awards).then(parseCSV),
      fetchText(FILES.notes).then(parseCSV)
    ]);

    return { profile, themes, projects, software, publications, awards, notes };
  }

  function splitList(value) {
    return String(value || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function truthy(value) {
    return ["true", "1", "yes", "y"].includes(String(value || "").toLowerCase());
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function pick(record, key, language) {
    if (!record) return "";
    const localized = record[`${key}_${language}`];
    return localized || record[key] || record[`${key}_en`] || record[`${key}_ko`] || "";
  }

  function parseAuthors(value) {
    return splitList(value).map((name) => {
      const match = name.match(/^([^,]+),\s*(.+)$/);
      if (!match) return { literal: name };
      return { family: match[1].trim(), given: match[2].trim() };
    });
  }

  function displayAuthors(value, emphasizedFamily) {
    const names = splitList(value);
    return names.map((name) => {
      const escaped = escapeHTML(name);
      if (emphasizedFamily && name.toLowerCase().startsWith(`${emphasizedFamily.toLowerCase()},`)) {
        return `<strong>${escaped}</strong>`;
      }
      return escaped;
    }).join("; ");
  }

  function publicationTypeLabel(item, language) {
    const map = {
      en: {
        "international-journal": "International journal",
        "domestic-journal": "Domestic journal",
        "international-conference": "International conference",
        "domestic-conference": "Domestic conference",
        "journal-article": "Journal article",
        "conference-paper": "Conference paper"
      },
      ko: {
        "international-journal": "국제학술지",
        "domestic-journal": "국내학술지",
        "international-conference": "국제학술대회",
        "domestic-conference": "국내학술대회",
        "journal-article": "학술지 논문",
        "conference-paper": "학술대회 논문"
      }
    };
    return map[language]?.[item.category] || map[language]?.[item.type] || item.category || item.type;
  }

  function softwareCategoryLabel(category, language) {
    const map = {
      en: {
        all: "All",
        "research-software": "Research software",
        "research-infrastructure": "Research infrastructure",
        "experimental-systems": "Experimental systems"
      },
      ko: {
        all: "전체",
        "research-software": "연구 소프트웨어",
        "research-infrastructure": "연구 인프라",
        "experimental-systems": "실험적 시스템"
      }
    };
    return map[language]?.[category] || category;
  }

  function statusLabel(status, language) {
    const map = {
      en: { active: "Active", experimental: "Experimental", reference: "Reference", completed: "Completed" },
      ko: { active: "활성", experimental: "실험", reference: "참고", completed: "완료" }
    };
    return map[language]?.[status] || status;
  }

  function authorRoleLabel(role, language) {
    const map = {
      en: { first: "First author", coauthor: "Co-author" },
      ko: { first: "주저자", coauthor: "공저자" }
    };
    return map[language]?.[role] || role;
  }

  function normalizeText(value) {
    return String(value || "").toLocaleLowerCase().normalize("NFKD");
  }

  function publicationCitation(item) {
    const authorText = splitList(item.authors).join(", ");
    const doiText = item.doi ? ` https://doi.org/${item.doi}` : "";
    return `${authorText} (${item.year}). ${item.title}. ${item.venue}${doiText}`.replace(/\s+/g, " ").trim();
  }

  function bibtexEscape(value) {
    return String(value || "")
      .replaceAll("\\", "\\textbackslash{}")
      .replaceAll("&", "\\&")
      .replaceAll("%", "\\%")
      .replaceAll("#", "\\#")
      .replaceAll("_", "\\_")
      .replaceAll("{", "\\{")
      .replaceAll("}", "\\}");
  }

  function bibtexEntry(item) {
    const entryType = item.type === "journal-article" ? "article" : "inproceedings";
    const fields = [
      `  title = {${bibtexEscape(item.title)}}`,
      `  author = {${splitList(item.authors).map(bibtexEscape).join(" and ")}}`,
      `  year = {${item.year}}`
    ];
    if (entryType === "article") {
      fields.push(`  journal = {${bibtexEscape(item.venue)}}`);
    } else {
      fields.push(`  booktitle = {${bibtexEscape(item.venue)}}`);
    }
    if (item.doi) fields.push(`  doi = {${item.doi}}`);
    if (item.url) fields.push(`  url = {${item.url}}`);
    return `@${entryType}{${item.id},\n${fields.join(",\n")}\n}`;
  }

  function publicationsToBibtex(items) {
    return items.map(bibtexEntry).join("\n\n") + "\n";
  }

  function publicationsToRIS(items) {
    const blocks = items.map((item) => {
      const lines = [
        `TY  - ${item.type === "journal-article" ? "JOUR" : "CPAPER"}`,
        `ID  - ${item.id}`,
        `TI  - ${item.title}`
      ];
      splitList(item.authors).forEach((author) => lines.push(`AU  - ${author}`));
      lines.push(`PY  - ${item.year}`);
      lines.push(`${item.type === "journal-article" ? "JO" : "T2"}  - ${item.venue}`);
      if (item.doi) lines.push(`DO  - ${item.doi}`);
      if (item.url) lines.push(`UR  - ${item.url}`);
      lines.push("ER  - ");
      return lines.join("\n");
    });
    return blocks.join("\n\n") + "\n";
  }

  function publicationToCSL(item) {
    return {
      id: item.id,
      type: item.type === "journal-article" ? "article-journal" : "paper-conference",
      title: item.title,
      author: parseAuthors(item.authors),
      issued: { "date-parts": [[Number(item.year)]] },
      "container-title": item.venue,
      DOI: item.doi || undefined,
      URL: item.url || undefined,
      keyword: splitList(item.theme_ids).join(", ")
    };
  }

  function publicationsToCSL(items) {
    return JSON.stringify(items.map(publicationToCSL), null, 2) + "\n";
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function publicationsToCSV(items) {
    const fields = [
      "id", "title", "authors", "year", "venue", "type", "category",
      "author_role", "awarded", "doi", "url", "theme_ids",
      "primary_theme", "project_ids", "software_ids", "note"
    ];
    const lines = [fields.join(",")];
    items.forEach((item) => {
      lines.push(fields.map((field) => csvEscape(item[field] || "")).join(","));
    });
    return "\uFEFF" + lines.join("\r\n") + "\r\n";
  }

  function download(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadPublications(items, format) {
    const suffix = items.length === 1 ? items[0].id : `publications-${items.length}`;
    if (format === "bib") {
      download(`${suffix}.bib`, publicationsToBibtex(items), "application/x-bibtex;charset=utf-8");
    } else if (format === "ris") {
      download(`${suffix}.ris`, publicationsToRIS(items), "application/x-research-info-systems;charset=utf-8");
    } else if (format === "json") {
      download(`${suffix}.json`, publicationsToCSL(items), "application/json;charset=utf-8");
    } else if (format === "csv") {
      download(`${suffix}.csv`, publicationsToCSV(items), "text/csv;charset=utf-8");
    }
  }

  function safeExternalURL(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  window.SiteData = Object.freeze({
    FILES,
    parseCSV,
    loadAll,
    splitList,
    truthy,
    escapeHTML,
    pick,
    parseAuthors,
    displayAuthors,
    publicationTypeLabel,
    softwareCategoryLabel,
    statusLabel,
    authorRoleLabel,
    normalizeText,
    publicationCitation,
    bibtexEntry,
    publicationsToBibtex,
    publicationsToRIS,
    publicationsToCSL,
    publicationsToCSV,
    download,
    downloadPublications,
    safeExternalURL
  });
}());
