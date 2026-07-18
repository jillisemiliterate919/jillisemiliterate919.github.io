
(function () {
  "use strict";

  const D = window.SiteData;
  const state = {
    lang: "en",
    data: null,
    theme: "all",
    softwareCategory: "all",
    publication: {
      query: "",
      year: "all",
      type: "all",
      role: "all",
      group: "year",
      sort: "newest",
      density: "compact"
    }
  };

  const I18N = {
    en: {
      skip: "Skip to content",
      brandRole: "Research · simulation · software",
      navResearch: "Research",
      navProjects: "Projects",
      navSoftware: "Software",
      navPublications: "Publications",
      navNotes: "Notes & photos",
      navAbout: "About",
      clearFilter: "Clear filter",
      filterPrefix: "Viewing all linked content for",
      heroEyebrow: "Building science through research, simulation, and software",
      exploreWork: "Explore work",
      browsePublications: "Browse publications",
      viewCv: "View CV",
      visualCaptionA: "Measured data",
      visualCaptionB: "Models",
      visualCaptionC: "Decisions",
      statPublications: "Publications",
      statProjects: "Research projects",
      statSoftware: "Software projects",
      statThemes: "Linked themes",
      researchEyebrow: "Research map",
      researchTitle: "Themes that connect the work",
      themeHint: "Select a theme to filter projects, software, publications, and notes together.",
      projectsEyebrow: "Collaborative research",
      projectsTitle: "Selected projects",
      projectsLede: "Roles, methods, outputs, and related software are visible without leaving the page.",
      noProjects: "No projects match the selected theme.",
      softwareEyebrow: "Independent development",
      softwareTitle: "Research software & experimental systems",
      softwareLede: "Repositories are organized by the research problem they address, not by technology alone.",
      noSoftware: "No software matches the selected filters.",
      publicationsEyebrow: "Structured bibliography",
      publicationsTitle: "Publications",
      publicationsLede: "One CSV powers this view, citation exports, cross-links, and the generated CV.",
      searchLabel: "Search",
      searchPlaceholder: "Title, author, venue…",
      yearLabel: "Year",
      typeLabel: "Type",
      themeLabel: "Theme",
      roleLabel: "Role",
      groupLabel: "Group by",
      sortLabel: "Sort",
      allYears: "All years",
      allTypes: "All types",
      allThemes: "All themes",
      allRoles: "All roles",
      groupNone: "No grouping",
      groupYear: "Year",
      groupType: "Type",
      groupTheme: "Theme",
      sortNewest: "Newest first",
      sortOldest: "Oldest first",
      sortTitle: "Title A–Z",
      sortType: "Type",
      results: "results",
      compact: "Compact",
      comfortable: "Comfortable",
      exportFiltered: "Export filtered",
      noPublications: "No publications match the current filters.",
      cvEyebrow: "Single source of truth",
      cvTitle: "CV and bibliography outputs",
      cvLede: "The CV page reads the same profile, project, publication, award, and software data. Print it or export structured formats without maintaining a second document by hand.",
      openCvBuilder: "Open CV view",
      downloadMarkdown: "Markdown",
      downloadLatex: "LaTeX",
      downloadBib: "BibTeX",
      notesEyebrow: "Lightweight archive",
      notesTitle: "Notes & photos",
      notesLede: "Short records of releases, fieldwork, conferences, and milestones—kept on the same page.",
      noNotes: "No notes match the selected theme.",
      aboutEyebrow: "Background",
      aboutTitle: "About",
      educationTitle: "Education",
      awardsTitle: "Selected awards",
      teachingTitle: "Teaching",
      skillsTitle: "Methods & tools",
      footerLine: "Research, simulation, and scientific software.",
      lastUpdated: "Data updated",
      firstAuthor: "First author",
      coauthor: "Co-author",
      awarded: "Awarded",
      source: "Source",
      copy: "Copy",
      bib: "Bib",
      details: "Methods & outputs",
      problem: "Problem",
      outputs: "Outputs",
      relatedSoftware: "Related software",
      relatedProjects: "Related projects",
      repository: "Repository ↗",
      publicationsShort: "papers",
      softwareShort: "tools",
      projectRole: "Role",
      projectPartner: "Partner",
      active: "Active",
      experimental: "Experimental",
      reference: "Reference",
      completed: "Completed",
      copied: "Citation copied.",
      exported: "Export created.",
      copyFailed: "Could not copy automatically.",
      loadError: "The local data files could not be loaded. Run serve.bat instead of opening index.html directly.",
      noteKindDevelopment: "Development",
      noteKindAward: "Award",
      noteKindResearch: "Research",
      email: "Email",
      office: "Office",
      all: "All",
      highlighted: "Related item",
      currentTheme: "Theme"
    },
    ko: {
      skip: "본문으로 건너뛰기",
      brandRole: "연구 · 시뮬레이션 · 소프트웨어",
      navResearch: "연구",
      navProjects: "프로젝트",
      navSoftware: "소프트웨어",
      navPublications: "논문",
      navNotes: "기록·사진",
      navAbout: "소개",
      clearFilter: "필터 해제",
      filterPrefix: "다음 연구주제로 연결된 항목을 표시 중:",
      heroEyebrow: "연구·시뮬레이션·소프트웨어로 연결하는 건물과학",
      exploreWork: "연구 살펴보기",
      browsePublications: "논문 찾아보기",
      viewCv: "CV 보기",
      visualCaptionA: "실측 데이터",
      visualCaptionB: "모델",
      visualCaptionC: "의사결정",
      statPublications: "논문",
      statProjects: "참여 연구",
      statSoftware: "개발 프로젝트",
      statThemes: "연결 주제",
      researchEyebrow: "연구 지도",
      researchTitle: "연구를 연결하는 주제",
      themeHint: "연구주제를 선택하면 프로젝트·소프트웨어·논문·기록이 함께 필터링됩니다.",
      projectsEyebrow: "공동 연구",
      projectsTitle: "주요 참여 프로젝트",
      projectsLede: "역할·방법·산출물·관련 소프트웨어를 별도 페이지 없이 한 화면에서 확인할 수 있습니다.",
      noProjects: "선택한 연구주제와 연결된 프로젝트가 없습니다.",
      softwareEyebrow: "1인 개발",
      softwareTitle: "연구 소프트웨어와 실험적 시스템",
      softwareLede: "기술 스택보다 해결하려는 연구문제를 중심으로 공개 저장소를 분류했습니다.",
      noSoftware: "선택한 필터와 일치하는 소프트웨어가 없습니다.",
      publicationsEyebrow: "구조화된 서지정보",
      publicationsTitle: "논문",
      publicationsLede: "하나의 CSV가 화면 표시·인용 내보내기·상호연결·CV 생성을 모두 담당합니다.",
      searchLabel: "검색",
      searchPlaceholder: "제목, 저자, 학술지·학술대회…",
      yearLabel: "연도",
      typeLabel: "종류",
      themeLabel: "연구주제",
      roleLabel: "저자 역할",
      groupLabel: "묶어 보기",
      sortLabel: "정렬",
      allYears: "전체 연도",
      allTypes: "전체 종류",
      allThemes: "전체 연구주제",
      allRoles: "전체 역할",
      groupNone: "묶지 않음",
      groupYear: "연도",
      groupType: "종류",
      groupTheme: "연구주제",
      sortNewest: "최신순",
      sortOldest: "오래된순",
      sortTitle: "제목순",
      sortType: "종류순",
      results: "건",
      compact: "간결",
      comfortable: "여유",
      exportFiltered: "필터 결과 내보내기",
      noPublications: "현재 필터와 일치하는 논문이 없습니다.",
      cvEyebrow: "단일 원본",
      cvTitle: "CV와 서지정보 출력",
      cvLede: "CV 페이지도 동일한 프로필·프로젝트·논문·수상·소프트웨어 데이터를 읽습니다. 두 번째 문서를 따로 유지하지 않고 인쇄하거나 여러 형식으로 내보낼 수 있습니다.",
      openCvBuilder: "CV 화면 열기",
      downloadMarkdown: "Markdown",
      downloadLatex: "LaTeX",
      downloadBib: "BibTeX",
      notesEyebrow: "가벼운 아카이브",
      notesTitle: "기록과 사진",
      notesLede: "릴리스·현장·학회·주요 이력을 짧게 기록하고 한 페이지 안에서 이어서 봅니다.",
      noNotes: "선택한 연구주제와 연결된 기록이 없습니다.",
      aboutEyebrow: "배경",
      aboutTitle: "소개",
      educationTitle: "학력",
      awardsTitle: "주요 수상",
      teachingTitle: "교육",
      skillsTitle: "방법과 도구",
      footerLine: "연구, 시뮬레이션, 과학 소프트웨어.",
      lastUpdated: "데이터 갱신",
      firstAuthor: "주저자",
      coauthor: "공저자",
      awarded: "수상",
      source: "원문",
      copy: "인용 복사",
      bib: "Bib",
      details: "방법·산출물",
      problem: "해결 문제",
      outputs: "산출물",
      relatedSoftware: "관련 소프트웨어",
      relatedProjects: "관련 프로젝트",
      repository: "저장소 ↗",
      publicationsShort: "논문",
      softwareShort: "도구",
      projectRole: "역할",
      projectPartner: "발주·협력",
      active: "활성",
      experimental: "실험",
      reference: "참고",
      completed: "완료",
      copied: "인용정보를 복사했습니다.",
      exported: "내보내기 파일을 생성했습니다.",
      copyFailed: "자동 복사에 실패했습니다.",
      loadError: "로컬 데이터 파일을 불러오지 못했습니다. index.html을 직접 열지 말고 serve.bat을 실행하십시오.",
      noteKindDevelopment: "개발",
      noteKindAward: "수상",
      noteKindResearch: "연구",
      email: "이메일",
      office: "연구실",
      all: "전체",
      highlighted: "연결 항목",
      currentTheme: "연구주제"
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const t = (key) => I18N[state.lang]?.[key] || I18N.en[key] || key;
  const p = (record, key) => D.pick(record, key, state.lang);
  const themeMap = () => new Map(state.data.themes.map((item) => [item.id, item]));
  const projectMap = () => new Map(state.data.projects.map((item) => [item.id, item]));
  const softwareMap = () => new Map(state.data.software.map((item) => [item.id, item]));

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
      const active = button.dataset.langSwitch === state.lang;
      button.setAttribute("aria-pressed", String(active));
    });

    $$("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });

    $$("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });

    $$("[data-generated-link]").forEach((anchor) => {
      const extension = anchor.dataset.generatedLink;
      anchor.href = `generated/cv-${state.lang}.${extension}`;
    });

    if (state.data) {
      document.title = state.lang === "ko"
        ? "조형곤 · 연구와 소프트웨어"
        : "Hyeong-Gon Jo · Research & Software";
      renderAll();
    }
  }

  function updateProfileBindings() {
    const profile = state.data.profile;
    const identity = profile.identity;
    const intro = profile.intro;
    const values = {
      name: identity[`name_${state.lang}`] || identity.name_en,
      role: identity[`role_${state.lang}`] || identity.role_en,
      affiliation: identity[`affiliation_${state.lang}`] || identity.affiliation_en,
      location: identity[`location_${state.lang}`] || identity.location_en,
      "intro-short": intro[`short_${state.lang}`] || intro.short_en,
      "intro-research": intro[`research_${state.lang}`] || intro.research_en
    };

    $$("[data-profile]").forEach((element) => {
      element.textContent = values[element.dataset.profile] || "";
    });
    $("#last-updated").textContent = profile.last_updated;
  }

  function renderHeroStats() {
    const stats = [
      [state.data.publications.length, t("statPublications")],
      [state.data.projects.length, t("statProjects")],
      [state.data.software.length, t("statSoftware")],
      [state.data.themes.length, t("statThemes")]
    ];
    $("#hero-stats").innerHTML = stats.map(([value, label]) => `
      <div>
        <dt>${D.escapeHTML(label)}</dt>
        <dd>${D.escapeHTML(value)}</dd>
      </div>
    `).join("");
  }

  function matchingTheme(item, theme = state.theme) {
    if (theme === "all") return true;
    return D.splitList(item.theme_ids).includes(theme);
  }

  function setGlobalTheme(themeID, options = {}) {
    state.theme = themeID && themeID !== "all" ? themeID : "all";
    const themeSelect = $("#pub-theme");
    if (themeSelect) themeSelect.value = state.theme;
    updateActiveFilter();
    renderThemes();
    renderProjects();
    renderSoftware();
    renderPublications();
    renderNotes();

    if (options.scrollTo) {
      document.getElementById(options.scrollTo)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function updateActiveFilter() {
    const bar = $("#active-filter");
    if (state.theme === "all") {
      bar.hidden = true;
      return;
    }
    const theme = themeMap().get(state.theme);
    $("#active-filter-text").textContent = `${t("filterPrefix")} ${p(theme, "label")}`;
    bar.hidden = false;
  }

  function renderThemes() {
    const publicationCounts = new Map();
    const softwareCounts = new Map();
    state.data.themes.forEach((theme) => {
      publicationCounts.set(
        theme.id,
        state.data.publications.filter((item) => D.splitList(item.theme_ids).includes(theme.id)).length
      );
      softwareCounts.set(
        theme.id,
        state.data.software.filter((item) => D.splitList(item.theme_ids).includes(theme.id)).length
      );
    });

    $("#themes-grid").innerHTML = state.data.themes.map((theme) => `
      <button type="button"
        class="theme-card ${state.theme === theme.id ? "is-active" : ""}"
        data-theme-id="${D.escapeHTML(theme.id)}"
        aria-pressed="${state.theme === theme.id}">
        <span class="theme-glyph">${D.escapeHTML(theme.glyph)}</span>
        <h3>${D.escapeHTML(p(theme, "label"))}</h3>
        <p>${D.escapeHTML(p(theme, "summary"))}</p>
        <span class="theme-counts">
          <span>${publicationCounts.get(theme.id)} ${t("publicationsShort")}</span>
          <span>${softwareCounts.get(theme.id)} ${t("softwareShort")}</span>
        </span>
      </button>
    `).join("");
  }

  function themeChips(themeIDs) {
    const map = themeMap();
    return D.splitList(themeIDs).map((id) => {
      const theme = map.get(id);
      if (!theme) return "";
      return `<button type="button" class="chip-button" data-theme-id="${D.escapeHTML(id)}">${D.escapeHTML(p(theme, "label"))}</button>`;
    }).join("");
  }

  function entityLinks(ids, type) {
    const map = type === "project" ? projectMap() : softwareMap();
    return D.splitList(ids).map((id) => {
      const item = map.get(id);
      if (!item) return "";
      const label = type === "project" ? p(item, "title") : item.name;
      return `<button type="button" class="chip-button entity-link" data-target-type="${type}" data-target-id="${D.escapeHTML(id)}">${D.escapeHTML(label)}</button>`;
    }).join("");
  }

  function renderProjects() {
    const items = state.data.projects
      .filter((item) => matchingTheme(item))
      .sort((a, b) => Number(a.order) - Number(b.order));

    $("#projects-empty").hidden = items.length > 0;
    $("#projects-grid").innerHTML = items.map((item) => {
      const outputs = p(item, "outputs").split("|").map((value) => value.trim()).filter(Boolean);
      const softwareLinks = entityLinks(item.software_ids, "software");
      return `
        <article class="project-card" id="project-${D.escapeHTML(item.id)}" data-entity-id="${D.escapeHTML(item.id)}">
          <div class="card-topline">
            <span class="card-kicker">${D.escapeHTML(item.period)}</span>
            <span class="card-status">${D.escapeHTML(D.statusLabel(item.status, state.lang))}</span>
          </div>
          <h3>${D.escapeHTML(p(item, "title"))}</h3>
          <p class="card-summary">${D.escapeHTML(p(item, "summary"))}</p>
          <dl class="project-meta">
            <div>
              <dt>${t("projectRole")}</dt>
              <dd>${D.escapeHTML(p(item, "role"))}</dd>
            </div>
            <div>
              <dt>${t("projectPartner")}</dt>
              <dd>${D.escapeHTML(p(item, "funder"))}</dd>
            </div>
          </dl>
          <div class="chip-row">${themeChips(item.theme_ids)}</div>
          <details class="inline-detail">
            <summary>${t("details")}</summary>
            <div class="inline-detail-content">
              <p>${D.escapeHTML(p(item, "details"))}</p>
              <strong>${t("outputs")}</strong>
              <div class="output-list">${outputs.map((value) => `<span class="chip">${D.escapeHTML(value)}</span>`).join("")}</div>
              ${softwareLinks ? `<strong class="detail-label">${t("relatedSoftware")}</strong><div class="entity-links">${softwareLinks}</div>` : ""}
            </div>
          </details>
        </article>
      `;
    }).join("");
  }

  function renderSoftwareCategoryFilter() {
    const categories = ["all", "research-software", "research-infrastructure", "experimental-systems"];
    $("#software-category-filter").innerHTML = categories.map((category) => `
      <button type="button" data-software-category="${category}" class="${state.softwareCategory === category ? "is-active" : ""}">
        ${D.escapeHTML(D.softwareCategoryLabel(category, state.lang))}
      </button>
    `).join("");
  }

  function renderSoftware() {
    renderSoftwareCategoryFilter();
    const items = state.data.software
      .filter((item) => matchingTheme(item))
      .filter((item) => state.softwareCategory === "all" || item.category === state.softwareCategory)
      .sort((a, b) => Number(a.order) - Number(b.order));

    $("#software-empty").hidden = items.length > 0;
    $("#software-grid").innerHTML = items.map((item) => {
      const features = p(item, "features").split("|").map((value) => value.trim()).filter(Boolean);
      const projectLinks = entityLinks(item.project_ids, "project");
      return `
        <article class="software-card" id="software-${D.escapeHTML(item.id)}" data-entity-id="${D.escapeHTML(item.id)}">
          <div class="card-topline">
            <span class="card-kicker">${D.escapeHTML(D.softwareCategoryLabel(item.category, state.lang))}</span>
            <span class="card-status">${D.escapeHTML(D.statusLabel(item.status, state.lang))}</span>
          </div>
          <h3>${D.escapeHTML(item.name)}</h3>
          <p class="card-summary">${D.escapeHTML(p(item, "summary"))}</p>
          <p class="software-problem"><strong>${t("problem")}:</strong> ${D.escapeHTML(p(item, "problem"))}</p>
          <p class="software-stack">${D.escapeHTML(item.languages)}</p>
          <div class="chip-row">${themeChips(item.theme_ids)}</div>
          <details class="inline-detail">
            <summary>${t("details")}</summary>
            <div class="inline-detail-content">
              <div class="output-list">${features.map((value) => `<span class="chip">${D.escapeHTML(value)}</span>`).join("")}</div>
              ${projectLinks ? `<strong class="detail-label">${t("relatedProjects")}</strong><div class="entity-links">${projectLinks}</div>` : ""}
            </div>
          </details>
          <div class="software-actions">
            <a class="repo-link" href="${D.escapeHTML(item.repo_url)}" target="_blank" rel="noreferrer">${t("repository")}</a>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderPublicationControls() {
    const years = [...new Set(state.data.publications.map((item) => item.year))].sort((a, b) => Number(b) - Number(a));
    $("#pub-year").innerHTML = [
      `<option value="all">${t("allYears")}</option>`,
      ...years.map((year) => `<option value="${year}">${year}</option>`)
    ].join("");
    $("#pub-year").value = state.publication.year;

    const types = ["international-journal", "domestic-journal", "international-conference", "domestic-conference"];
    $("#pub-type").innerHTML = [
      `<option value="all">${t("allTypes")}</option>`,
      ...types.map((type) => `<option value="${type}">${D.escapeHTML(D.publicationTypeLabel({ category: type }, state.lang))}</option>`)
    ].join("");
    $("#pub-type").value = state.publication.type;

    $("#pub-theme").innerHTML = [
      `<option value="all">${t("allThemes")}</option>`,
      ...state.data.themes.map((theme) => `<option value="${D.escapeHTML(theme.id)}">${D.escapeHTML(p(theme, "label"))}</option>`)
    ].join("");
    $("#pub-theme").value = state.theme;

    $("#pub-role").innerHTML = `
      <option value="all">${t("allRoles")}</option>
      <option value="first">${t("firstAuthor")}</option>
      <option value="coauthor">${t("coauthor")}</option>
    `;
    $("#pub-role").value = state.publication.role;

    $("#pub-group").innerHTML = `
      <option value="none">${t("groupNone")}</option>
      <option value="year">${t("groupYear")}</option>
      <option value="type">${t("groupType")}</option>
      <option value="theme">${t("groupTheme")}</option>
    `;
    $("#pub-group").value = state.publication.group;

    $("#pub-sort").innerHTML = `
      <option value="newest">${t("sortNewest")}</option>
      <option value="oldest">${t("sortOldest")}</option>
      <option value="title">${t("sortTitle")}</option>
      <option value="type">${t("sortType")}</option>
    `;
    $("#pub-sort").value = state.publication.sort;

    $("#pub-search").value = state.publication.query;
  }

  function filteredPublications() {
    const query = D.normalizeText(state.publication.query);
    return state.data.publications
      .filter((item) => state.theme === "all" || D.splitList(item.theme_ids).includes(state.theme))
      .filter((item) => state.publication.year === "all" || item.year === state.publication.year)
      .filter((item) => state.publication.type === "all" || item.category === state.publication.type)
      .filter((item) => state.publication.role === "all" || item.author_role === state.publication.role)
      .filter((item) => {
        if (!query) return true;
        return D.normalizeText([item.title, item.authors, item.venue, item.year].join(" ")).includes(query);
      })
      .sort((a, b) => {
        if (state.publication.sort === "oldest") {
          return Number(a.year) - Number(b.year) || a.title.localeCompare(b.title);
        }
        if (state.publication.sort === "title") {
          return a.title.localeCompare(b.title);
        }
        if (state.publication.sort === "type") {
          return a.category.localeCompare(b.category) || Number(b.year) - Number(a.year);
        }
        return Number(b.year) - Number(a.year) || a.title.localeCompare(b.title);
      });
  }

  function publicationGroupKey(item) {
    if (state.publication.group === "year") return item.year;
    if (state.publication.group === "type") return item.category;
    if (state.publication.group === "theme") return item.primary_theme || "other";
    return "all";
  }

  function publicationGroupLabel(key) {
    if (state.publication.group === "type") {
      return D.publicationTypeLabel({ category: key }, state.lang);
    }
    if (state.publication.group === "theme") {
      const theme = themeMap().get(key);
      return theme ? p(theme, "label") : key;
    }
    if (state.publication.group === "none") return "";
    return key;
  }

  function publicationItemHTML(item) {
    const sourceURL = item.doi ? `https://doi.org/${item.doi}` : item.url;
    const labels = [
      `<span class="badge">${D.escapeHTML(D.publicationTypeLabel(item, state.lang))}</span>`,
      `<span class="badge">${D.escapeHTML(D.authorRoleLabel(item.author_role, state.lang))}</span>`,
      D.truthy(item.awarded) ? `<span class="badge badge-award">${t("awarded")}</span>` : ""
    ].join("");

    const linked = [
      ...D.splitList(item.project_ids).map((id) => `<button type="button" class="chip-button entity-link" data-target-type="project" data-target-id="${D.escapeHTML(id)}">P</button>`),
      ...D.splitList(item.software_ids).map((id) => `<button type="button" class="chip-button entity-link" data-target-type="software" data-target-id="${D.escapeHTML(id)}">S</button>`)
    ].join("");

    return `
      <article class="publication-item" id="publication-${D.escapeHTML(item.id)}">
        <div class="publication-year">${D.escapeHTML(item.year)}</div>
        <div class="publication-main">
          <h3>${D.escapeHTML(item.title)}</h3>
          <p class="publication-authors">${D.displayAuthors(item.authors, "Jo")}</p>
          <p class="publication-venue">${D.escapeHTML(item.venue)}</p>
          <div class="publication-labels">
            ${labels}
            ${themeChips(item.theme_ids)}
            ${linked}
          </div>
        </div>
        <div class="publication-buttons">
          ${sourceURL ? `<a class="publication-action" href="${D.escapeHTML(sourceURL)}" target="_blank" rel="noreferrer">${t("source")}</a>` : ""}
          <button type="button" class="publication-action" data-copy-citation="${D.escapeHTML(item.id)}">${t("copy")}</button>
          <button type="button" class="publication-action" data-export-one="${D.escapeHTML(item.id)}">${t("bib")}</button>
        </div>
      </article>
    `;
  }

  function renderPublications() {
    renderPublicationControls();
    const items = filteredPublications();
    $("#pub-result-count").textContent = String(items.length);
    $("#publications-empty").hidden = items.length > 0;
    $("#publication-list").className = `publication-list ${state.publication.density}`;

    const selectedTheme = state.theme === "all" ? null : themeMap().get(state.theme);
    $("#pub-theme-label").textContent = selectedTheme ? `· ${p(selectedTheme, "label")}` : "";

    if (!items.length) {
      $("#publication-list").innerHTML = "";
      return;
    }

    if (state.publication.group === "none") {
      $("#publication-list").innerHTML = items.map(publicationItemHTML).join("");
      return;
    }

    const groups = new Map();
    items.forEach((item) => {
      const key = publicationGroupKey(item);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });

    $("#publication-list").innerHTML = Array.from(groups.entries()).map(([key, groupItems]) => `
      <section class="publication-group">
        <h3 class="publication-group-title">
          ${D.escapeHTML(publicationGroupLabel(key))}
          <small>${groupItems.length}</small>
        </h3>
        ${groupItems.map(publicationItemHTML).join("")}
      </section>
    `).join("");
  }

  function noteKindLabel(kind) {
    if (kind === "award") return t("noteKindAward");
    if (kind === "research") return t("noteKindResearch");
    return t("noteKindDevelopment");
  }

  function renderNotes() {
    const items = state.data.notes
      .filter((item) => matchingTheme(item))
      .sort((a, b) => b.date.localeCompare(a.date));

    $("#notes-empty").hidden = items.length > 0;
    $("#notes-grid").innerHTML = items.map((item) => `
      <article class="note-card" id="note-${D.escapeHTML(item.id)}">
        <img src="${D.escapeHTML(item.image)}" alt="" width="1200" height="760" loading="lazy">
        <div class="note-body">
          <div class="note-meta">
            <span>${D.escapeHTML(noteKindLabel(item.kind))}</span>
            <time datetime="${D.escapeHTML(item.date)}">${D.escapeHTML(item.date)}</time>
          </div>
          <h3>${D.escapeHTML(p(item, "title"))}</h3>
          <p>${D.escapeHTML(p(item, "summary"))}</p>
          <div class="chip-row">${themeChips(item.theme_ids)}</div>
        </div>
      </article>
    `).join("");
  }

  function renderContact() {
    const contact = state.data.profile.contact;
    const items = [
      [`mailto:${contact.email}`, `${t("email")} · ${contact.email}`],
      [contact.github, "GitHub"],
      [contact.orcid, "ORCID"],
      ["", `${t("office")} · ${contact[`office_${state.lang}`] || contact.office_en}`]
    ];
    $("#contact-links").innerHTML = items.map(([url, label]) => (
      url
        ? `<a href="${D.escapeHTML(url)}" ${url.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""}>${D.escapeHTML(label)}</a>`
        : `<span class="muted">${D.escapeHTML(label)}</span>`
    )).join("");
  }

  function renderEducation() {
    $("#education-list").innerHTML = state.data.profile.education.map((item) => {
      const degree = item[`degree_${state.lang}`] || item.degree_en;
      const institution = item[`institution_${state.lang}`] || item.institution_en;
      const advisor = item[`advisor_${state.lang}`] || item.advisor_en;
      const thesis = item[`thesis_${state.lang}`] || item.thesis_en;
      return `
        <article class="timeline-item">
          <div class="timeline-period">${D.escapeHTML(item.period)}</div>
          <div>
            <h4>${D.escapeHTML(degree)}</h4>
            <p>${D.escapeHTML(institution)}</p>
            ${advisor ? `<p>${D.escapeHTML(advisor)}</p>` : ""}
            ${thesis ? `<p><em>${D.escapeHTML(thesis)}</em></p>` : ""}
          </div>
        </article>
      `;
    }).join("");
  }

  function renderAwards() {
    const items = [...state.data.awards].sort((a, b) => b.date.localeCompare(a.date));
    $("#awards-list").innerHTML = items.map((item) => `
      <article class="timeline-item">
        <div class="timeline-period">${D.escapeHTML(item.date)}</div>
        <div>
          <h4>${D.escapeHTML(p(item, "title"))}</h4>
          <p>${D.escapeHTML(p(item, "organization"))}</p>
          <p><em>${D.escapeHTML(p(item, "work"))}</em></p>
        </div>
      </article>
    `).join("");
  }

  function renderTeaching() {
    $("#teaching-list").innerHTML = state.data.profile.teaching.map((item) => `
      <article class="timeline-item">
        <div class="timeline-period">${D.escapeHTML(item.period)}</div>
        <div>
          <h4>${D.escapeHTML(item[`title_${state.lang}`] || item.title_en)}</h4>
          <p>${D.escapeHTML(item[`detail_${state.lang}`] || item.detail_en)}</p>
        </div>
      </article>
    `).join("");
  }

  function renderSkills() {
    $("#skills-list").innerHTML = state.data.profile.skills.map((item) => `
      <article class="skill-item">
        <strong>${D.escapeHTML(item.name)}</strong>
        <p>${D.escapeHTML(item[`detail_${state.lang}`] || item.detail_en)}</p>
      </article>
    `).join("");
  }

  function renderAbout() {
    renderContact();
    renderEducation();
    renderAwards();
    renderTeaching();
    renderSkills();
  }

  function renderAll() {
    updateProfileBindings();
    renderHeroStats();
    renderThemes();
    renderProjects();
    renderSoftware();
    renderPublications();
    renderNotes();
    renderAbout();
    updateActiveFilter();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2300);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t("copied"));
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      textarea.remove();
      showToast(success ? t("copied") : t("copyFailed"));
    }
  }

  function highlightEntity(type, id) {
    const target = document.getElementById(`${type}-${id}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.remove("is-highlighted");
    void target.offsetWidth;
    target.classList.add("is-highlighted");
    window.setTimeout(() => target.classList.remove("is-highlighted"), 2200);
  }

  function bindEvents() {
    $$("[data-lang-switch]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.langSwitch));
    });

    $("#clear-global-filter").addEventListener("click", () => setGlobalTheme("all"));

    document.addEventListener("click", (event) => {
      const themeButton = event.target.closest("[data-theme-id]");
      if (themeButton) {
        const themeID = themeButton.dataset.themeId;
        setGlobalTheme(state.theme === themeID ? "all" : themeID);
        return;
      }

      const entityButton = event.target.closest("[data-target-type][data-target-id]");
      if (entityButton) {
        highlightEntity(entityButton.dataset.targetType, entityButton.dataset.targetId);
        return;
      }

      const categoryButton = event.target.closest("[data-software-category]");
      if (categoryButton) {
        state.softwareCategory = categoryButton.dataset.softwareCategory;
        renderSoftware();
        return;
      }

      const densityButton = event.target.closest("[data-pub-density]");
      if (densityButton) {
        state.publication.density = densityButton.dataset.pubDensity;
        $$("[data-pub-density]").forEach((button) => button.classList.toggle("is-active", button === densityButton));
        renderPublications();
        return;
      }

      const exportButton = event.target.closest("[data-export-format]");
      if (exportButton) {
        D.downloadPublications(filteredPublications(), exportButton.dataset.exportFormat);
        event.target.closest("details")?.removeAttribute("open");
        showToast(t("exported"));
        return;
      }

      const copyButton = event.target.closest("[data-copy-citation]");
      if (copyButton) {
        const item = state.data.publications.find((publication) => publication.id === copyButton.dataset.copyCitation);
        if (item) copyText(D.publicationCitation(item));
        return;
      }

      const oneExport = event.target.closest("[data-export-one]");
      if (oneExport) {
        const item = state.data.publications.find((publication) => publication.id === oneExport.dataset.exportOne);
        if (item) D.downloadPublications([item], "bib");
      }
    });

    $("#pub-search").addEventListener("input", (event) => {
      state.publication.query = event.target.value;
      renderPublications();
      event.target.focus();
      event.target.setSelectionRange(event.target.value.length, event.target.value.length);
    });
    $("#pub-year").addEventListener("change", (event) => {
      state.publication.year = event.target.value;
      renderPublications();
    });
    $("#pub-type").addEventListener("change", (event) => {
      state.publication.type = event.target.value;
      renderPublications();
    });
    $("#pub-theme").addEventListener("change", (event) => {
      setGlobalTheme(event.target.value);
    });
    $("#pub-role").addEventListener("change", (event) => {
      state.publication.role = event.target.value;
      renderPublications();
    });
    $("#pub-group").addEventListener("change", (event) => {
      state.publication.group = event.target.value;
      renderPublications();
    });
    $("#pub-sort").addEventListener("change", (event) => {
      state.publication.sort = event.target.value;
      renderPublications();
    });
  }

  function renderLoadError(error) {
    console.error(error);
    const main = $("#main");
    main.innerHTML = `
      <section class="section-shell">
        <div class="container">
          <p class="empty-state">${D.escapeHTML(t("loadError"))}</p>
        </div>
      </section>
    `;
  }

  async function init() {
    state.lang = initialLanguage();
    setLanguage(state.lang, { skipURL: true });
    bindEvents();

    try {
      state.data = await D.loadAll();
      setLanguage(state.lang, { skipURL: true });
    } catch (error) {
      renderLoadError(error);
    }
  }

  init();
}());
