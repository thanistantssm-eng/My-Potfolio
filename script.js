(() => {
  const shell = document.getElementById('appShell');
  const sidebar = document.getElementById('sidebar');
  const nav = document.getElementById('fileNav');
  const tabs = document.getElementById('tabs');
  const stage = document.getElementById('editorStage');
  const breadcrumbs = document.getElementById('breadcrumbs');
  const languageMode = document.getElementById('languageMode');
  const bottomPanel = document.getElementById('bottomPanel');
  const paletteBackdrop = document.getElementById('paletteBackdrop');
  const paletteInput = document.getElementById('paletteInput');
  const paletteResults = document.getElementById('paletteResults');
  const toast = document.getElementById('toast');
  const portfolioMenu = document.getElementById('portfolioMenu');
  const terminalForm = document.getElementById('terminalForm');
  const terminalInput = document.getElementById('terminalInput');
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalPrompt = document.getElementById('terminalPrompt');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pages = [...document.querySelectorAll('.page')];
  const files = [...document.querySelectorAll('.file[data-page]')];
  const activityButtons = [...document.querySelectorAll('.activity[data-panel]')];
  const sidePanels = [...document.querySelectorAll('.side-panel[data-panel-view]')];

  const meta = {
    home: { file: '01_Home.tsx', label: 'Home', mode: 'TypeScript React' },
    about: { file: '02_About.tsx', label: 'About', mode: 'TypeScript React' },
    skills: { file: '03_Skills.tsx', label: 'Skills', mode: 'TypeScript React' },
    projects: { file: '04_Projects.tsx', label: 'Projects', mode: 'TypeScript React' },
    experience: { file: '05_Experience.tsx', label: 'Experience', mode: 'TypeScript React' },
    contact: { file: '06_Contact.tsx', label: 'Contact', mode: 'TypeScript React' }
  };

  let activePage = 'home';
  let typingRun = 0;
  let toastTimer = 0;
  let paletteIndex = 0;
  let paletteItems = [];
  let terminalCwd = 'home';
  const terminalHistory = [];
  let terminalHistoryIndex = 0;

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function updateTerminalPrompt() {
    if (terminalPrompt) terminalPrompt.textContent = `PS C:\portfolio\${terminalCwd}>`;
  }

  function toggleTheme() {
    document.body.classList.toggle('theme-blue');
    const isBlue = document.body.classList.contains('theme-blue');
    document.getElementById('themeToggle')?.classList.toggle('active', isBlue);
    showToast(isBlue ? 'Theme switched to VS Code Blue.' : 'Theme switched to Gold Night.');
    return isBlue ? 'VS Code Blue' : 'Gold Night';
  }

  function setTerminalOpen(open = true) {
    bottomPanel.classList.toggle('open', open);
    if (open) setTimeout(() => terminalInput?.focus(), 40);
  }

  function escapeTerminalText(value) {
    return String(value).replace(/[&<>"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
  }

  function appendTerminal(text, type = 'info') {
    if (!terminalOutput) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function appendTerminalCommand(command) {
    if (!terminalOutput) return;
    const line = document.createElement('div');
    line.className = 'terminal-line command';
    const prompt = document.createElement('span');
    prompt.className = 'terminal-prompt-inline';
    prompt.textContent = `PS C:\portfolio\${terminalCwd}> `;
    const value = document.createElement('span');
    value.textContent = command;
    line.append(prompt, value);
    terminalOutput.appendChild(line);
  }

  function resolvePageToken(token = '') {
    const normalized = token.trim().toLowerCase().replace(/^[/\]+/, '').replace(/\.tsx$/, '').replace(/^0[1-6]_/, '').replace(/^\d+_?/, '');
    if (meta[normalized]) return normalized;
    return Object.keys(meta).find(key => meta[key].label.toLowerCase() === normalized || meta[key].file.toLowerCase() === token.trim().toLowerCase()) || null;
  }

  function executeTerminal(rawCommand) {
    const command = rawCommand.trim();
    if (!command) return;
    appendTerminalCommand(command);
    const [headRaw, ...rest] = command.split(/\s+/);
    const head = headRaw.toLowerCase();
    const arg = rest.join(' ').trim();

    if (head === 'clear' || head === 'cls') {
      terminalOutput.innerHTML = '';
      return;
    }
    if (head === 'help' || head === '?') {
      appendTerminal('Portfolio terminal commands:', 'success');
      appendTerminal('  ls | dir                list portfolio pages');
      appendTerminal('  cd home|about|skills|projects|experience|contact');
      appendTerminal('  open <page>             open a page without changing the command style');
      appendTerminal('  pwd                     show current portfolio path');
      appendTerminal('  whoami                  show profile identity');
      appendTerminal('  run                     replay current page animation');
      appendTerminal('  theme                   switch Gold Night / VS Code Blue');
      appendTerminal('  clear | cls             clear terminal');
      return;
    }
    if (head === 'ls' || head === 'dir') {
      appendTerminal(Object.values(meta).map(item => item.file).join('    '));
      return;
    }
    if (head === 'pwd') {
      appendTerminal(`C:\portfolio\${terminalCwd}`);
      return;
    }
    if (head === 'whoami') {
      appendTerminal('Thanistan Roy — Software Engineer · Founder, X10 THINK', 'success');
      return;
    }
    if (head === 'run' || head === 'npm') {
      playPageAnimation(activePage, true);
      appendTerminal(`✓ ${meta[activePage].label} animation restarted`, 'success');
      return;
    }
    if (head === 'theme') {
      const themeName = toggleTheme();
      appendTerminal(`Theme: ${themeName}`, 'success');
      return;
    }
    if (head === 'echo') {
      appendTerminal(arg);
      return;
    }
    if (head === 'cd' || head === 'open') {
      if (!arg || arg === '.' || arg === './') {
        appendTerminal(`C:\portfolio\${terminalCwd}`);
        return;
      }
      if (arg === '..' || arg === '../') {
        terminalCwd = 'home';
        updateTerminalPrompt();
        openPage('home');
        appendTerminal('Opened Home', 'success');
        return;
      }
      const page = resolvePageToken(arg);
      if (!page) {
        appendTerminal(`Path not found: ${arg}. Try "ls" or "help".`, 'error');
        return;
      }
      terminalCwd = page;
      updateTerminalPrompt();
      openPage(page);
      appendTerminal(`✓ Opened ${meta[page].file}`, 'success');
      return;
    }
    appendTerminal(`'${headRaw}' is not recognized. Type "help" for commands.`, 'error');
  }

  function setPanel(name) {
    activityButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.panel === name));
    sidePanels.forEach(panel => panel.classList.toggle('active', panel.dataset.panelView === name));
    if (window.innerWidth <= 860) sidebar.classList.add('open');
    if (name === 'search') setTimeout(() => document.getElementById('sideSearch')?.focus(), 40);
  }

  function makeTab(page) {
    const tab = document.createElement('button');
    tab.className = 'tab';
    tab.type = 'button';
    tab.dataset.page = page;
    tab.innerHTML = `<span class="react-dot">◈</span><span>${meta[page].file}</span><svg class="ci tab-close" aria-label="Close tab"><use href="#i-close"></use></svg>`;
    tabs.appendChild(tab);
    return tab;
  }

  function ensureTab(page) {
    return tabs.querySelector(`.tab[data-page="${page}"]`) || makeTab(page);
  }

  function updateBreadcrumb(page) {
    breadcrumbs.innerHTML = `<span>THANISTAN-PORTFOLIO</span><b>›</b><span>src</span><b>›</b><span>pages</span><b>›</b><strong>${meta[page].file}</strong>`;
    languageMode.textContent = meta[page].mode;
  }

  async function typeText(el, runId) {
    const full = el.dataset.text || '';
    const speed = Math.max(0, Number(el.dataset.speed || 14));
    el.textContent = '';
    if (reduced) {
      el.textContent = full;
      return;
    }
    for (let i = 0; i < full.length; i++) {
      if (runId !== typingRun) return;
      el.textContent += full[i];
      const char = full[i];
      await sleep(char === ',' || char === '.' ? speed * 2.3 : speed);
    }
  }

  async function playPageAnimation(page, replay = false) {
    const section = document.querySelector(`.page[data-page="${page}"]`);
    if (!section) return;
    const runId = ++typingRun;
    const typed = [...section.querySelectorAll('[data-type]')];
    const reveals = [...section.querySelectorAll('[data-enter]')];

    reveals.forEach(el => el.classList.remove('show'));
    typed.forEach(el => { if (replay || !el.dataset.typedOnce) el.textContent = ''; });

    if (reduced) {
      typed.forEach(el => { el.textContent = el.dataset.text || ''; el.dataset.typedOnce = '1'; });
      reveals.forEach(el => el.classList.add('show'));
      return;
    }

    await sleep(110);
    for (const el of typed) {
      if (runId !== typingRun) return;
      await typeText(el, runId);
      el.dataset.typedOnce = '1';
      await sleep(55);
    }
    reveals.forEach((el, i) => setTimeout(() => {
      if (runId === typingRun) el.classList.add('show');
    }, i * 70));
  }

  function openPage(page, options = {}) {
    if (!meta[page]) return;
    activePage = page;
    ensureTab(page);
    files.forEach(file => file.classList.toggle('active', file.dataset.page === page));
    pages.forEach(section => section.classList.toggle('active', section.dataset.page === page));
    [...tabs.querySelectorAll('.tab')].forEach(tab => tab.classList.toggle('active', tab.dataset.page === page));
    portfolioMenu?.querySelectorAll('[data-page]').forEach(button => button.classList.toggle('active', button.dataset.page === page));
    terminalCwd = page;
    updateTerminalPrompt();
    updateBreadcrumb(page);
    stage.scrollTop = 0;
    setPanel('explorer');
    if (window.innerWidth <= 860) sidebar.classList.remove('open');
    playPageAnimation(page, options.replay === true);
  }

  function closeTab(page) {
    const tab = tabs.querySelector(`.tab[data-page="${page}"]`);
    if (!tab) return;
    const openTabs = [...tabs.querySelectorAll('.tab')];
    const index = openTabs.indexOf(tab);
    const wasActive = page === activePage;
    tab.remove();
    if (wasActive) {
      const remaining = [...tabs.querySelectorAll('.tab')];
      const next = remaining[Math.max(0, Math.min(index - 1, remaining.length - 1))];
      if (next) openPage(next.dataset.page);
      else openPage('home');
    }
  }

  nav.addEventListener('click', event => {
    const file = event.target.closest('.file[data-page]');
    if (file) openPage(file.dataset.page);
  });

  tabs.addEventListener('click', event => {
    const tab = event.target.closest('.tab[data-page]');
    if (!tab) return;
    if (event.target.closest('.tab-close')) {
      event.stopPropagation();
      closeTab(tab.dataset.page);
      return;
    }
    openPage(tab.dataset.page);
  });

  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-open]');
    if (opener) openPage(opener.dataset.open);
  });

  activityButtons.forEach(button => button.addEventListener('click', () => setPanel(button.dataset.panel)));

  document.getElementById('runPortfolio').addEventListener('click', () => {
    updateTerminalPrompt();
  openPage('home', { replay: true });
    showToast('Portfolio restarted — typing sequence replayed.');
  });

  document.getElementById('replayAnimations').addEventListener('click', () => {
    openPage(activePage, { replay: true });
    showToast(`Replaying ${meta[activePage].label} animation.`);
  });

  document.getElementById('toggleCompact').addEventListener('click', () => {
    document.body.classList.toggle('compact');
    showToast(document.body.classList.contains('compact') ? 'Compact sidebar enabled.' : 'Standard sidebar restored.');
  });

  document.getElementById('terminalToggle').addEventListener('click', () => setTerminalOpen(!bottomPanel.classList.contains('open')));
  document.getElementById('editorTerminal')?.addEventListener('click', () => setTerminalOpen(!bottomPanel.classList.contains('open')));
  document.getElementById('closePanel').addEventListener('click', () => setTerminalOpen(false));
  document.getElementById('terminalHelp')?.addEventListener('click', () => { setTerminalOpen(true); executeTerminal('help'); });

  portfolioMenu?.addEventListener('click', event => {
    const pageButton = event.target.closest('[data-page]');
    const actionButton = event.target.closest('[data-action]');
    if (pageButton) openPage(pageButton.dataset.page);
    if (actionButton?.dataset.action === 'terminal') setTerminalOpen(true);
  });

  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('toggleThemeSide')?.addEventListener('click', toggleTheme);

  const searchInput = document.getElementById('sideSearch');
  const searchResults = document.getElementById('searchResults');
  const searchCount = document.getElementById('searchCount');

  function renderSideSearch(query = '') {
    const q = query.trim().toLowerCase();
    const results = Object.entries(meta).filter(([key, item]) => `${item.file} ${item.label}`.toLowerCase().includes(q));
    searchCount.textContent = `${results.length} result${results.length === 1 ? '' : 's'} in ${results.length} file${results.length === 1 ? '' : 's'}`;
    searchResults.innerHTML = '';
    results.forEach(([key, item]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-result';
      button.innerHTML = `<svg class="ci file-icon"><use href="#i-file-code"></use></svg><b>${item.file}</b><small>src/pages</small>`;
      button.addEventListener('click', () => openPage(key));
      searchResults.appendChild(button);
    });
  }
  searchInput.addEventListener('input', () => renderSideSearch(searchInput.value));
  renderSideSearch();

  function filteredPalette(query = '') {
    const q = query.trim().toLowerCase().replace(/^>/, '').trim();
    return Object.entries(meta).filter(([key, item]) => `${item.label} ${item.file}`.toLowerCase().includes(q));
  }

  function renderPalette() {
    paletteItems = filteredPalette(paletteInput.value);
    paletteIndex = Math.max(0, Math.min(paletteIndex, paletteItems.length - 1));
    paletteResults.innerHTML = '';
    paletteItems.forEach(([key, item], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `palette-result${index === paletteIndex ? ' selected' : ''}`;
      button.dataset.page = key;
      button.innerHTML = `<svg class="ci"><use href="#i-file-code"></use></svg><span>Go to ${item.label}</span><small>${item.file}</small>`;
      button.addEventListener('click', () => { closePalette(); openPage(key); });
      paletteResults.appendChild(button);
    });
  }

  function openPalette() {
    paletteBackdrop.hidden = false;
    paletteInput.value = '';
    paletteIndex = 0;
    renderPalette();
    setTimeout(() => paletteInput.focus(), 20);
  }

  function closePalette() {
    paletteBackdrop.hidden = true;
  }

  document.getElementById('commandCenter').addEventListener('click', openPalette);
  paletteBackdrop.addEventListener('click', event => { if (event.target === paletteBackdrop) closePalette(); });
  paletteInput.addEventListener('input', () => { paletteIndex = 0; renderPalette(); });
  paletteInput.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); if (paletteItems.length) paletteIndex = (paletteIndex + 1) % paletteItems.length; renderPalette(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); if (paletteItems.length) paletteIndex = (paletteIndex - 1 + paletteItems.length) % paletteItems.length; renderPalette(); }
    if (event.key === 'Enter' && paletteItems.length) { event.preventDefault(); const [page] = paletteItems[paletteIndex]; closePalette(); openPage(page); }
    if (event.key === 'Escape') closePalette();
  });

  document.addEventListener('keydown', event => {
    const cmd = event.ctrlKey || event.metaKey;
    if (cmd && event.key.toLowerCase() === 'p') { event.preventDefault(); openPalette(); }
    if (cmd && event.key.toLowerCase() === 'b') { event.preventDefault(); shell.classList.toggle('sidebar-hidden'); }
    if (cmd && event.shiftKey && event.key.toLowerCase() === 'e') { event.preventDefault(); shell.classList.remove('sidebar-hidden'); setPanel('explorer'); }
    if (cmd && event.shiftKey && event.key.toLowerCase() === 'f') { event.preventDefault(); shell.classList.remove('sidebar-hidden'); setPanel('search'); }
    if (cmd && event.key === '`') { event.preventDefault(); setTerminalOpen(!bottomPanel.classList.contains('open')); }
    if (event.key === 'Escape' && !paletteBackdrop.hidden) closePalette();
  });

  document.getElementById('branchItem').addEventListener('click', () => showToast('main — working tree clean'));

  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const fieldMessages = {
    name: value => !value ? 'Please enter your name.' : '',
    email: value => !value ? 'Please enter your email.' : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Enter a valid email address.' : ''),
    message: value => !value ? 'Please enter a message.' : (value.length < 8 ? 'Message should be at least 8 characters.' : '')
  };

  function validateContactField(field, reveal = true) {
    const name = field.name;
    const value = field.value.trim();
    const message = fieldMessages[name] ? fieldMessages[name](value) : '';
    const error = form.querySelector(`[data-error-for="${name}"]`);
    field.classList.toggle('invalid', Boolean(message));
    field.classList.toggle('valid', !message && Boolean(value));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) {
      error.textContent = reveal ? message : '';
      error.classList.toggle('show', reveal && Boolean(message));
    }
    return !message;
  }

  [...form.elements].filter(el => el.name).forEach(field => {
    field.addEventListener('input', () => {
      const error = form.querySelector(`[data-error-for="${field.name}"]`);
      const shouldReveal = error?.classList.contains('show') || field.classList.contains('invalid');
      validateContactField(field, shouldReveal);
      if (formStatus.classList.contains('error')) {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
      }
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = [...form.elements].filter(el => el.name);
    const valid = fields.map(field => validateContactField(field, true)).every(Boolean);
    if (!valid) {
      formStatus.textContent = 'Fix the highlighted fields, then submit again.';
      formStatus.className = 'form-status error';
      fields.find(field => field.classList.contains('invalid'))?.focus();
      return;
    }
    fields.forEach(field => {
      field.classList.remove('invalid');
      form.querySelector(`[data-error-for="${field.name}"]`)?.classList.remove('show');
    });
    const name = String(new FormData(form).get('name') || '').trim();
    formStatus.textContent = `Looks good, ${name}. Your message is ready to send.`;
    formStatus.className = 'form-status success';
    showToast('Contact form validated successfully.');
  });

  terminalForm?.addEventListener('submit', event => {
    event.preventDefault();
    const command = terminalInput.value;
    if (!command.trim()) return;
    terminalHistory.push(command);
    terminalHistoryIndex = terminalHistory.length;
    terminalInput.value = '';
    executeTerminal(command);
  });

  terminalInput?.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!terminalHistory.length) return;
      terminalHistoryIndex = Math.max(0, terminalHistoryIndex - 1);
      terminalInput.value = terminalHistory[terminalHistoryIndex] || '';
      terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!terminalHistory.length) return;
      terminalHistoryIndex = Math.min(terminalHistory.length, terminalHistoryIndex + 1);
      terminalInput.value = terminalHistory[terminalHistoryIndex] || '';
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const parts = terminalInput.value.trim().split(/\s+/);
      if (parts[0]?.toLowerCase() === 'cd' && parts.length <= 2) {
        const prefix = (parts[1] || '').toLowerCase();
        const match = Object.keys(meta).find(page => page.startsWith(prefix));
        if (match) terminalInput.value = `cd ${match}`;
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) sidebar.classList.remove('open');
  });

  updateTerminalPrompt();
  openPage('home', { replay: true });
})();
