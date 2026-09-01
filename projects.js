(function () {
  const TITLE_SHRINK_START_LENGTH = 10; // below this length, keep max font size
  const TITLE_LENGTH_THRESHOLD = 20;    // above this length, wrap to 2 lines instead of shrinking further
  const TITLE_MAX_FONT_PX = 24;
  const TITLE_MIN_FONT_PX = 14;
  const TITLE_WRAP_FONT_PX = 18;

  function getTitleStyle(title) {
    const len = title.length;

    if (len > TITLE_LENGTH_THRESHOLD) {
      return {
        className: 'whitespace-normal break-words line-clamp-2',
        style: 'font-size:' + TITLE_WRAP_FONT_PX + 'px'
      };
    }

    let fontSize = TITLE_MAX_FONT_PX;
    if (len > TITLE_SHRINK_START_LENGTH) {
      const ratio = (len - TITLE_SHRINK_START_LENGTH) / (TITLE_LENGTH_THRESHOLD - TITLE_SHRINK_START_LENGTH);
      fontSize = TITLE_MAX_FONT_PX - (TITLE_MAX_FONT_PX - TITLE_MIN_FONT_PX) * ratio;
    }
    return {
      className: 'truncate',
      style: 'font-size:' + fontSize.toFixed(1) + 'px'
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderIcon(icon) {
    if (icon.type === 'material') {
      return '<span class="material-symbols-outlined text-sm">' + escapeHtml(icon.value) + '</span>';
    }
    return '<i class="' + escapeHtml(icon.value) + '"></i>';
  }

  function renderBadge(project) {
    const langGenre = escapeHtml(project.lang) + ' | ' + escapeHtml(project.genre);
    if (project.platform) {
      return 'Platform: ' + escapeHtml(project.platform) + '<br>' + langGenre;
    }
    return langGenre;
  }

  function renderCard(project) {
    const iconsHtml = project.icons.map(renderIcon).join('');
    const descHtml = project.description.map(escapeHtml).join('<br>');
    const badgeClass = project.platform
      ? 'font-label-caps text-label-caps text-right text-secondary'
      : 'font-label-caps text-label-caps text-secondary';
    const titleStyle = getTitleStyle(project.title);

    return (
      '<div class="project-card group relative flex flex-col h-[300px]">' +
        '<div class="relative w-full h-[160px] overflow-hidden">' +
          '<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" ' +
            'data-alt="' + escapeHtml(project.title) + '" src="' + escapeHtml(project.image) + '">' +
          '<div class="absolute inset-0 project-overlay"></div>' +
          '<div class="absolute top-2 right-2 bg-surface-container-high/80 px-2 py-1 rounded border border-outline/50">' +
            '<span class="' + badgeClass + '">' + renderBadge(project) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="p-4 flex flex-col flex-grow bg-surface-container-high z-10 project-content">' +
          '<a class="font-headline-sm text-headline-sm text-primary mb-2 ' + titleStyle.className + '" style="' + titleStyle.style + '" href="' + escapeHtml(project.href) + '" target="_blank" rel="noopener">' +
            iconsHtml + ' ' + escapeHtml(project.title) +
          '</a>' +
          '<p class="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-3">' + descHtml + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  const COMING_SOON_HTML =
    '<div class="project-card flex flex-col h-[300px] border-dashed border-outline-variant bg-surface-container/50 opacity-50 justify-center items-center cursor-not-allowed">' +
      '<span class="material-symbols-outlined text-4xl text-outline-variant mb-2">lock</span>' +
      '<div class="font-headline-sm text-headline-sm text-primary mb-2 truncate">COMING SOON</div>' +
    '</div>';

  function renderSection(gridId, projects) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = projects.map(renderCard).join('') + COMING_SOON_HTML;
  }

  function renderError() {
    const message =
      '<div class="col-span-full text-center text-on-surface-variant font-label-code text-label-code py-8">' +
        'Failed to load project data.' +
      '</div>';
    document.querySelectorAll('.works-grid').forEach(function (grid) {
      grid.innerHTML = message;
    });
  }

  const dataEl = document.getElementById('projects-data');
  try {
    const data = JSON.parse(dataEl.textContent);
    renderSection('works-pc-grid', data.pc || []);
    renderSection('works-mobile-grid', data.mobile || []);
    renderSection('works-console-grid', data.console || []);
  } catch (err) {
    console.error('Failed to parse project data:', err);
    renderError();
  }
})();
