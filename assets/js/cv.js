
(function () {
  "use strict";

  const D = window.SiteData;
  const state = {
    lang: "en",
    scope: "concise",
    data: null
  };

  const I18N = {
    en: {
      back: "Back to website",
      generated: "Database-generated CV",
      profileLabel: "CV profile",
      scopeConcise: "Concise",
      scopeAcademic: "Academic",
      scopeComplete: "Complete archive",
      printPdf: "Print / PDF",
      summary: "Profile",
      education: "Education",
      projects: "Research projects",
      publications: "Publications",
      software: "Research software",
      awards: "Awards",
      teaching: "Teaching",
      certifications: "Certifications",
      skills: "Methods & tools",
      firstAuthor: "First author",
      coauthor: "Co-author",
      exported: "CV export created.",
      loadError: "The local data files could not be loaded. Run serve.bat instead of opening cv.html directly.",
      selectedPublications: "Publication selection for this CV profile",
      repository: "Repository",
      updated: "Data updated"
    },
    ko: {
      back: "홈페이지로 돌아가기",
      generated: "데이터베이스 기반 CV",
      profileLabel: "CV 구성",
      scopeConcise: "간결형",
      scopeAcademic: "학술형",
      scopeComplete: "전체 아카이브",
      printPdf: "인쇄 / PDF",
      summary: "소개",
      education: "학력",
      projects: "연구 프로젝트",
      publications: "논문",
      software: "연구 소프트웨어",
      awards: "수상",
      teaching: "교육",
      certifications: "자격",
      skills: "방법과 도구",
      firstAuthor: "주저자",
      coauthor: "공저자",
      exported: "CV 내보내기 파일을 생성했습니다.",
      loadError: "로컬 데이터 파일을 불러오지 못했습니다. cv.html을 직접 열지 말고 serve.bat을 실행하십시오.",
      selectedPublications: "현재 CV 구성에 포함된 논문",
      repository: "저장소",
      updated: "데이터 갱신"
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const t = (key) => I18N[state.lang]?.[key] || I18N.en[key] || key;
  const p = (record, key) => D.pick(record, key, state.lang);

  function initialLanguage() {
    const query = new URLSearchParams(window.location.search).get("lang");
    if (query === "en" || query === "ko") return query;
    const saved = window.localStorage.getItem("siteLanguage");
    if (saved === "en" || saved === "ko") return saved;
    return navigator.language?.toLowerCase().startsWith("ko") ? "ko" : "en";
  }

  function setLanguage(language, options = {}) {
    state.lang = language === "ko" ? "ko" : "en";
    document.documentElement.lang = state.lang;
    document.documentElement.dataset.lang = state.lang;
    window.localStorage.setItem("siteLanguage", state.lang);

    if (!options.skipURL) {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", state.lang);
      window.history.replaceState({}, "", url);
    }

    $$("[data-lang-switch]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.langSwitch === state.lang));
    });
    $$("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });

    const homeLink = $(".brand");
    homeLink.href = `index.html?lang=${state.lang}`;
    document.title = state.lang === "ko" ? "조형곤 · CV" : "Hyeong-Gon Jo · CV";
    if (state.data) render();
  }

  function selectedProjects() {
    const items = [...state.data.projects].sort((a, b) => Number(a.order) - Number(b.order));
    return state.scope === "concise" ? items.filter((item) => D.truthy(item.featured)) : items;
  }

  function selectedSoftware() {
    const items = [...state.data.software].sort((a, b) => Number(a.order) - Number(b.order));
    if (state.scope === "concise") return items.filter((item) => D.truthy(item.featured));
    if (state.scope === "academic") return items.filter((item) => item.category !== "experimental-systems");
    return items;
  }

  function selectedAwards() {
    const items = [...state.data.awards].sort((a, b) => b.date.localeCompare(a.date));
    return state.scope === "concise" ? items.filter((item) => D.truthy(item.featured)) : items;
  }

  function selectedPublications() {
    const items = [...state.data.publications].sort(
      (a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title)
    );
    if (state.scope === "complete" || state.scope === "academic") return items;
    return items.filter((item) => item.type === "journal-article" || item.author_role === "first");
  }

  function section(title, content, className = "") {
    return `
      <section class="cv-section ${className}">
        <h2>${D.escapeHTML(title)}</h2>
        <div class="cv-section-content">${content}</div>
      </section>
    `;
  }

  function renderEducation() {
    return state.data.profile.education.map((item) => `
      <article class="cv-entry">
        <div class="cv-entry-top">
          <h3>${D.escapeHTML(item[`degree_${state.lang}`] || item.degree_en)} · ${D.escapeHTML(item[`institution_${state.lang}`] || item.institution_en)}</h3>
          <span class="cv-entry-time">${D.escapeHTML(item.period)}</span>
        </div>
        ${item[`advisor_${state.lang}`] || item.advisor_en ? `<p>${D.escapeHTML(item[`advisor_${state.lang}`] || item.advisor_en)}</p>` : ""}
        ${item[`thesis_${state.lang}`] || item.thesis_en ? `<p><em>${D.escapeHTML(item[`thesis_${state.lang}`] || item.thesis_en)}</em></p>` : ""}
      </article>
    `).join("");
  }

  function renderProjects() {
    return selectedProjects().map((item) => `
      <article class="cv-entry">
        <div class="cv-entry-top">
          <h3>${D.escapeHTML(p(item, "title"))}</h3>
          <span class="cv-entry-time">${D.escapeHTML(item.period)}</span>
        </div>
        <p>${D.escapeHTML(p(item, "funder"))} · ${D.escapeHTML(p(item, "role"))}</p>
        <p>${D.escapeHTML(p(item, "summary"))}</p>
      </article>
    `).join("");
  }

  function renderPublications() {
    const items = selectedPublications();
    return `
      <p class="cv-summary-note">${D.escapeHTML(t("selectedPublications"))}: ${items.length}</p>
      <div class="cv-publications">
        ${items.map((item) => `
          <article class="cv-publication">
            ${D.displayAuthors(item.authors, "Jo")} (${D.escapeHTML(item.year)}).
            “${D.escapeHTML(item.title)}.”
            <em>${D.escapeHTML(item.venue)}</em>
            ${item.doi ? ` <a href="https://doi.org/${D.escapeHTML(item.doi)}">doi:${D.escapeHTML(item.doi)}</a>` : ""}
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderSoftware() {
    return selectedSoftware().map((item) => `
      <article class="cv-entry">
        <div class="cv-entry-top">
          <h3>${D.escapeHTML(item.name)}</h3>
          <span class="cv-entry-time">${D.escapeHTML(D.statusLabel(item.status, state.lang))}</span>
        </div>
        <p>${D.escapeHTML(p(item, "summary"))}</p>
        <p><a href="${D.escapeHTML(item.repo_url)}">${D.escapeHTML(t("repository"))}: ${D.escapeHTML(item.repo_url)}</a></p>
      </article>
    `).join("");
  }

  function renderAwards() {
    return selectedAwards().map((item) => `
      <article class="cv-entry">
        <div class="cv-entry-top">
          <h3>${D.escapeHTML(p(item, "title"))}</h3>
          <span class="cv-entry-time">${D.escapeHTML(item.date)}</span>
        </div>
        <p>${D.escapeHTML(p(item, "organization"))}</p>
        <p><em>${D.escapeHTML(p(item, "work"))}</em></p>
      </article>
    `).join("");
  }

  function renderTeaching() {
    return state.data.profile.teaching.map((item) => `
      <article class="cv-entry">
        <div class="cv-entry-top">
          <h3>${D.escapeHTML(item[`title_${state.lang}`] || item.title_en)}</h3>
          <span class="cv-entry-time">${D.escapeHTML(item.period)}</span>
        </div>
        <p>${D.escapeHTML(item[`detail_${state.lang}`] || item.detail_en)}</p>
      </article>
    `).join("");
  }

  function renderCertifications() {
    return state.data.profile.certifications.map((item) => `
      <article class="cv-entry">
        <div class="cv-entry-top">
          <h3>${D.escapeHTML(item[`name_${state.lang}`] || item.name_en)}</h3>
          <span class="cv-entry-time">${D.escapeHTML(item.date)}</span>
        </div>
        <p>${D.escapeHTML(item[`issuer_${state.lang}`] || item.issuer_en)}</p>
      </article>
    `).join("");
  }

  function renderSkills() {
    return state.data.profile.skills.map((item) => `
      <article class="cv-entry">
        <h3>${D.escapeHTML(item.name)}</h3>
        <p>${D.escapeHTML(item[`detail_${state.lang}`] || item.detail_en)}</p>
      </article>
    `).join("");
  }

  function render() {
    const profile = state.data.profile;
    const identity = profile.identity;
    const contact = profile.contact;
    const name = identity[`name_${state.lang}`] || identity.name_en;
    const role = identity[`role_${state.lang}`] || identity.role_en;
    const affiliation = identity[`affiliation_${state.lang}`] || identity.affiliation_en;
    const intro = profile.intro[`short_${state.lang}`] || profile.intro.short_en;

    const sections = [
      section(t("summary"), `<p>${D.escapeHTML(intro)}</p>`),
      section(t("education"), renderEducation()),
      section(t("projects"), renderProjects()),
      section(t("publications"), renderPublications()),
      section(t("software"), renderSoftware()),
      section(t("awards"), renderAwards())
    ];

    if (state.scope !== "concise") {
      sections.push(section(t("teaching"), renderTeaching()));
    }
    if (state.scope === "complete") {
      sections.push(section(t("certifications"), renderCertifications()));
      sections.push(section(t("skills"), renderSkills()));
    }

    $("#cv-paper").innerHTML = `
      <header class="cv-paper-header">
        <div>
          <h1>${D.escapeHTML(name)}</h1>
          <p class="cv-subtitle">${D.escapeHTML(role)}</p>
          <p class="cv-subtitle">${D.escapeHTML(affiliation)}</p>
        </div>
        <div class="cv-contact">
          <a href="mailto:${D.escapeHTML(contact.email)}">${D.escapeHTML(contact.email)}</a>
          <a href="${D.escapeHTML(contact.github)}">${D.escapeHTML(contact.github.replace(/^https?:\/\//, ""))}</a>
          <a href="${D.escapeHTML(contact.orcid)}">${D.escapeHTML(contact.orcid.replace(/^https?:\/\//, ""))}</a>
          <span>${D.escapeHTML(t("updated"))}: ${D.escapeHTML(profile.last_updated)}</span>
        </div>
      </header>
      ${sections.join("")}
    `;
  }

  function markdownEscape(value) {
    return String(value || "").replaceAll("\n", " ").trim();
  }

  function toMarkdown() {
    const profile = state.data.profile;
    const identity = profile.identity;
    const contact = profile.contact;
    const name = identity[`name_${state.lang}`] || identity.name_en;
    const role = identity[`role_${state.lang}`] || identity.role_en;
    const affiliation = identity[`affiliation_${state.lang}`] || identity.affiliation_en;
    const intro = profile.intro[`short_${state.lang}`] || profile.intro.short_en;
    const lines = [
      `# ${name}`,
      "",
      `**${role}**  `,
      `${affiliation}  `,
      `${contact.email} · ${contact.github} · ${contact.orcid}`,
      "",
      `## ${t("summary")}`,
      "",
      intro,
      "",
      `## ${t("education")}`,
      ""
    ];

    profile.education.forEach((item) => {
      lines.push(`### ${item[`degree_${state.lang}`] || item.degree_en} — ${item[`institution_${state.lang}`] || item.institution_en}`);
      lines.push(`*${item.period}*`);
      const thesis = item[`thesis_${state.lang}`] || item.thesis_en;
      if (thesis) lines.push(thesis);
      lines.push("");
    });

    lines.push(`## ${t("projects")}`, "");
    selectedProjects().forEach((item) => {
      lines.push(`### ${p(item, "title")}`);
      lines.push(`*${item.period} · ${p(item, "funder")}*`);
      lines.push(p(item, "role"));
      lines.push("");
      lines.push(p(item, "summary"));
      lines.push("");
    });

    lines.push(`## ${t("publications")}`, "");
    selectedPublications().forEach((item) => {
      lines.push(`- ${markdownEscape(D.publicationCitation(item))}`);
    });
    lines.push("");

    lines.push(`## ${t("software")}`, "");
    selectedSoftware().forEach((item) => {
      lines.push(`- **${item.name}** — ${markdownEscape(p(item, "summary"))} (${item.repo_url})`);
    });
    lines.push("");

    lines.push(`## ${t("awards")}`, "");
    selectedAwards().forEach((item) => {
      lines.push(`- **${item.date} — ${p(item, "title")}**. ${p(item, "organization")}. ${p(item, "work")}`);
    });

    if (state.scope !== "concise") {
      lines.push("", `## ${t("teaching")}`, "");
      profile.teaching.forEach((item) => {
        lines.push(`- **${item[`title_${state.lang}`] || item.title_en}** (${item.period}) — ${item[`detail_${state.lang}`] || item.detail_en}`);
      });
    }

    if (state.scope === "complete") {
      lines.push("", `## ${t("certifications")}`, "");
      profile.certifications.forEach((item) => {
        lines.push(`- ${item.date} — ${item[`name_${state.lang}`] || item.name_en}, ${item[`issuer_${state.lang}`] || item.issuer_en}`);
      });
      lines.push("", `## ${t("skills")}`, "");
      profile.skills.forEach((item) => {
        lines.push(`- **${item.name}** — ${item[`detail_${state.lang}`] || item.detail_en}`);
      });
    }
    return lines.join("\n").trim() + "\n";
  }

  function texEscape(value) {
    return String(value || "")
      .replaceAll("\\", "\\textbackslash{}")
      .replaceAll("&", "\\&")
      .replaceAll("%", "\\%")
      .replaceAll("$", "\\$")
      .replaceAll("#", "\\#")
      .replaceAll("_", "\\_")
      .replaceAll("{", "\\{")
      .replaceAll("}", "\\}")
      .replaceAll("~", "\\textasciitilde{}")
      .replaceAll("^", "\\textasciicircum{}");
  }

  function toLatex() {
    const profile = state.data.profile;
    const identity = profile.identity;
    const contact = profile.contact;
    const name = identity[`name_${state.lang}`] || identity.name_en;
    const role = identity[`role_${state.lang}`] || identity.role_en;
    const affiliation = identity[`affiliation_${state.lang}`] || identity.affiliation_en;
    const intro = profile.intro[`short_${state.lang}`] || profile.intro.short_en;
    const lines = [
      "\\documentclass[10pt,a4paper]{article}",
      "\\usepackage[margin=18mm]{geometry}",
      "\\usepackage{enumitem}",
      "\\usepackage[hidelinks]{hyperref}",
      ...(state.lang === "ko" ? ["\\usepackage{kotex}"] : []),
      "\\setlength{\\parindent}{0pt}",
      "\\begin{document}",
      `{\\LARGE ${texEscape(name)}}\\\\[3pt]`,
      `${texEscape(role)}\\\\`,
      `${texEscape(affiliation)}\\\\`,
      `\\href{mailto:${texEscape(contact.email)}}{${texEscape(contact.email)}} \\quad ${texEscape(contact.github)} \\quad ${texEscape(contact.orcid)}`,
      "",
      `\\section*{${texEscape(t("summary"))}}`,
      texEscape(intro),
      "",
      `\\section*{${texEscape(t("education"))}}`,
      "\\begin{itemize}[leftmargin=*,nosep]"
    ];
    profile.education.forEach((item) => {
      const degree = item[`degree_${state.lang}`] || item.degree_en;
      const institution = item[`institution_${state.lang}`] || item.institution_en;
      const thesis = item[`thesis_${state.lang}`] || item.thesis_en;
      lines.push(`\\item \\textbf{${texEscape(degree)}}, ${texEscape(institution)} \\hfill ${texEscape(item.period)}${thesis ? `\\\\\\emph{${texEscape(thesis)}}` : ""}`);
    });
    lines.push("\\end{itemize}", "", `\\section*{${texEscape(t("projects"))}}`, "\\begin{itemize}[leftmargin=*]");
    selectedProjects().forEach((item) => {
      lines.push(`\\item \\textbf{${texEscape(p(item, "title"))}} \\hfill ${texEscape(item.period)}\\\\${texEscape(p(item, "funder"))}; ${texEscape(p(item, "role"))}. ${texEscape(p(item, "summary"))}`);
    });
    lines.push("\\end{itemize}", "", `\\section*{${texEscape(t("publications"))}}`, "\\begin{enumerate}[leftmargin=*]");
    selectedPublications().forEach((item) => {
      lines.push(`\\item ${texEscape(D.publicationCitation(item))}`);
    });
    lines.push("\\end{enumerate}", "", `\\section*{${texEscape(t("software"))}}`, "\\begin{itemize}[leftmargin=*]");
    selectedSoftware().forEach((item) => {
      lines.push(`\\item \\textbf{${texEscape(item.name)}} --- ${texEscape(p(item, "summary"))}\\\\\\url{${item.repo_url}}`);
    });
    lines.push("\\end{itemize}", "", `\\section*{${texEscape(t("awards"))}}`, "\\begin{itemize}[leftmargin=*]");
    selectedAwards().forEach((item) => {
      lines.push(`\\item ${texEscape(item.date)} --- \\textbf{${texEscape(p(item, "title"))}}, ${texEscape(p(item, "organization"))}. ${texEscape(p(item, "work"))}`);
    });
    lines.push("\\end{itemize}");

    if (state.scope !== "concise") {
      lines.push("", `\\section*{${texEscape(t("teaching"))}}`, "\\begin{itemize}[leftmargin=*]");
      profile.teaching.forEach((item) => {
        lines.push(`\\item \\textbf{${texEscape(item[`title_${state.lang}`] || item.title_en)}} (${texEscape(item.period)}): ${texEscape(item[`detail_${state.lang}`] || item.detail_en)}`);
      });
      lines.push("\\end{itemize}");
    }

    if (state.scope === "complete") {
      lines.push("", `\\section*{${texEscape(t("certifications"))}}`, "\\begin{itemize}[leftmargin=*]");
      profile.certifications.forEach((item) => {
        lines.push(`\\item ${texEscape(item.date)} --- ${texEscape(item[`name_${state.lang}`] || item.name_en)}, ${texEscape(item[`issuer_${state.lang}`] || item.issuer_en)}`);
      });
      lines.push("\\end{itemize}");
    }

    lines.push("\\end{document}", "");
    return lines.join("\n");
  }

  function toStandaloneHTML() {
    const title = state.lang === "ko" ? "조형곤 CV" : "Hyeong-Gon Jo CV";
    return `<!doctype html>
<html lang="${state.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${D.escapeHTML(title)}</title>
<style>
body{max-width:900px;margin:40px auto;padding:0 24px;color:#16231d;font:15px/1.6 "Segoe UI","Malgun Gothic",sans-serif}
h1{font:500 44px/1.1 Georgia,serif;margin:0}h2{margin-top:32px;padding-top:16px;border-top:1px solid #cbd5cd;color:#305744;font-size:13px;text-transform:uppercase;letter-spacing:.08em}
h3{font-size:15px;margin:16px 0 0}p{margin:4px 0;color:#52675c}.cv-paper-header{display:grid;grid-template-columns:1fr auto;gap:30px;border-bottom:2px solid #16231d;padding-bottom:24px}
.cv-contact{text-align:right;font-size:12px}.cv-section{display:grid;grid-template-columns:150px 1fr;gap:24px}.cv-section>h2{border:0}.cv-entry-top{display:flex;justify-content:space-between;gap:20px}.cv-entry-time{white-space:nowrap;color:#74837b}.cv-publication{margin:0 0 9px}
@media(max-width:650px){.cv-paper-header,.cv-section{grid-template-columns:1fr}.cv-contact{text-align:left}}
</style>
</head>
<body>${$("#cv-paper").innerHTML}</body>
</html>`;
  }

  function toJSON() {
    return JSON.stringify({
      schema_version: 1,
      generated_at: new Date().toISOString(),
      language: state.lang,
      scope: state.scope,
      profile: state.data.profile,
      projects: selectedProjects(),
      publications: selectedPublications(),
      software: selectedSoftware(),
      awards: selectedAwards(),
      teaching: state.scope === "concise" ? [] : state.data.profile.teaching,
      certifications: state.scope === "complete" ? state.data.profile.certifications : []
    }, null, 2) + "\n";
  }

  function exportCV(format) {
    const base = `hyeong-gon-jo-cv-${state.lang}-${state.scope}`;
    if (format === "md") D.download(`${base}.md`, toMarkdown(), "text/markdown;charset=utf-8");
    if (format === "html") D.download(`${base}.html`, toStandaloneHTML(), "text/html;charset=utf-8");
    if (format === "tex") D.download(`${base}.tex`, toLatex(), "application/x-tex;charset=utf-8");
    if (format === "json") D.download(`${base}.json`, toJSON(), "application/json;charset=utf-8");
    showToast(t("exported"));
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  function bindEvents() {
    $$("[data-lang-switch]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.langSwitch));
    });
    $("#cv-scope").addEventListener("change", (event) => {
      state.scope = event.target.value;
      render();
    });
    $("#print-cv").addEventListener("click", () => window.print());
    $$("[data-cv-export]").forEach((button) => {
      button.addEventListener("click", () => exportCV(button.dataset.cvExport));
    });
  }

  async function init() {
    state.lang = initialLanguage();
    setLanguage(state.lang, { skipURL: true });
    bindEvents();
    try {
      state.data = await D.loadAll();
      render();
    } catch (error) {
      console.error(error);
      $("#cv-paper").innerHTML = `<p class="empty-state">${D.escapeHTML(t("loadError"))}</p>`;
    }
  }

  init();
}());
