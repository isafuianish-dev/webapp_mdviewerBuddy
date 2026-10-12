(function () {
  'use strict';

  var APP_KEY = 'webapp_mdviewerBuddy';
  var APP_VERSION = '001.001';
  var SELECTED_KEY = APP_KEY + '.selected.v1';
  var FONT_KEY = APP_KEY + '.font.v1';
  var ZOOM_KEY = APP_KEY + '.zoom.v1';
  var MD_DIR = 'md/';
  var MANIFEST_URL = MD_DIR + 'manifest.json';
  var SERVER_HINT = 'Loading markdown files needs this app to be served from a local or remote server — it can’t read the md folder when index.html is opened directly from your file system.';

  var FONT_OPTIONS = [
    { id: 'system', label: 'System UI', stack: 'var(--font)' },
    { id: 'arial', label: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
    { id: 'georgia', label: 'Georgia', stack: 'Georgia, "Times New Roman", serif' },
    { id: 'verdana', label: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
    { id: 'courier', label: 'Courier New', stack: '"Courier New", Courier, monospace' }
  ];
  var ZOOM_MIN = 80;
  var ZOOM_MAX = 200;
  var ZOOM_STEP = 10;
  var ZOOM_DEFAULT = 100;

  var ICONS = Object.assign({}, Buddy.ICONS, {
    fileText: Buddy.icon('fileTextLines')
  });

  var escapeHtml = Buddy.escapeHtml;

  var state = {
    files: [],
    selected: null,
    loadError: null,
    font: FONT_OPTIONS[0].id,
    zoom: ZOOM_DEFAULT,
    rawView: false,
    tocHeadings: [],
    tocScrollBound: false
  };

  var dom = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheDom();
    initStaticIcons();
    bindGlobalEvents();
    loadFontZoomPrefs();
    loadFiles();
  }

  function cacheDom() {
    dom.btnSettings = document.getElementById('btnSettings');
    dom.fileSearch = document.getElementById('fileSearch');
    dom.fileList = document.getElementById('fileList');
    dom.fileListEmpty = document.getElementById('fileListEmpty');
    dom.emptyState = document.getElementById('emptyState');
    dom.emptyStateText = dom.emptyState.querySelector('p');
    dom.docDetail = document.getElementById('docDetail');
    dom.docHeader = document.getElementById('docHeader');
    dom.docContent = document.getElementById('docContent');
    dom.docTitle = document.getElementById('docTitle');
    dom.docBody = document.getElementById('docBody');
    dom.rawToggleBtn = document.getElementById('rawToggleBtn');
    dom.tocTrigger = document.getElementById('tocTrigger');
    dom.tocTriggerBtn = document.getElementById('tocTriggerBtn');
    dom.tocPopoverList = document.getElementById('tocPopoverList');
    dom.fontStepper = document.getElementById('fontStepper');
    dom.fontDisplay = document.getElementById('fontDisplay');
    dom.fontPrevBtn = document.getElementById('fontPrevBtn');
    dom.fontNextBtn = document.getElementById('fontNextBtn');
    dom.zoomValue = document.getElementById('zoomValue');
    dom.zoomOutBtn = document.getElementById('zoomOutBtn');
    dom.zoomInBtn = document.getElementById('zoomInBtn');
  }

  function initStaticIcons() {
    dom.btnSettings.innerHTML = ICONS.settings;
    dom.fontPrevBtn.innerHTML = ICONS.chevronLeft;
    dom.fontNextBtn.innerHTML = ICONS.chevronRight;
    dom.zoomOutBtn.innerHTML = ICONS.chevronDown;
    dom.zoomInBtn.innerHTML = ICONS.chevronUp;
    dom.rawToggleBtn.innerHTML = ICONS.braces;
    dom.tocTriggerBtn.innerHTML = ICONS.toc;
  }

  function bindGlobalEvents() {
    dom.btnSettings.addEventListener('click', openSettingsModal);
    dom.fileSearch.addEventListener('input', renderFileList);
    dom.fontPrevBtn.addEventListener('click', function () { stepFont(-1); });
    dom.fontNextBtn.addEventListener('click', function () { stepFont(1); });
    dom.zoomOutBtn.addEventListener('click', function () { setZoom(state.zoom - ZOOM_STEP); });
    dom.zoomInBtn.addEventListener('click', function () { setZoom(state.zoom + ZOOM_STEP); });
    dom.rawToggleBtn.addEventListener('click', toggleRawView);
    dom.docBody.addEventListener('click', onDocBodyClick);
  }

  function toggleRawView() {
    state.rawView = !state.rawView;
    renderDetail();
  }

  function updateRawToggleUI() {
    dom.rawToggleBtn.classList.toggle('active', state.rawView);
    dom.rawToggleBtn.setAttribute('aria-pressed', String(state.rawView));
    var label = state.rawView ? 'View rendered markdown' : 'View raw markdown';
    dom.rawToggleBtn.title = label;
    dom.rawToggleBtn.setAttribute('aria-label', label);


    dom.fontStepper.hidden = state.rawView;
  }







  function onDocBodyClick(e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = decodeURIComponent(link.getAttribute('href').slice(1));
    if (!id) return;
    var target = dom.docBody.querySelector('[id="' + id.replace(/"/g, '\\"') + '"]');
    if (!target) return;
    e.preventDefault();
    scrollToHeading(target);
  }

  var modalApi = Buddy.modal.init();
  var openModal = modalApi.open;
  var closeModal = modalApi.close;

  function openSettingsModal() {
    Buddy.settings.open(APP_KEY, openModal, closeModal, { appVersion: APP_VERSION });
  }



  function loadFontZoomPrefs() {
    try {
      var savedFont = localStorage.getItem(FONT_KEY);
      if (savedFont && FONT_OPTIONS.some(function (f) { return f.id === savedFont; })) {
        state.font = savedFont;
      }
    } catch (e) {}
    try {
      var savedZoom = parseInt(localStorage.getItem(ZOOM_KEY), 10);
      if (!isNaN(savedZoom) && savedZoom >= ZOOM_MIN && savedZoom <= ZOOM_MAX) {
        state.zoom = savedZoom;
      }
    } catch (e) {}
    applyFontZoom();
  }

  function applyFontZoom() {
    var opt = FONT_OPTIONS.filter(function (f) { return f.id === state.font; })[0] || FONT_OPTIONS[0];
    document.documentElement.style.setProperty('--doc-font-family', opt.stack);
    document.documentElement.style.setProperty('--doc-zoom', state.zoom / 100);
    dom.fontDisplay.value = opt.label;
    dom.zoomValue.textContent = state.zoom + '%';
    dom.zoomOutBtn.disabled = state.zoom <= ZOOM_MIN;
    dom.zoomInBtn.disabled = state.zoom >= ZOOM_MAX;
  }

  function stepFont(delta) {
    var fontIndex = FONT_OPTIONS.findIndex(function (f) { return f.id === state.font; });
    if (fontIndex === -1) fontIndex = 0;
    fontIndex = (fontIndex + delta + FONT_OPTIONS.length) % FONT_OPTIONS.length;
    setFont(FONT_OPTIONS[fontIndex].id);
  }

  function setFont(id) {
    state.font = id;
    try { localStorage.setItem(FONT_KEY, id); } catch (e) {}
    applyFontZoom();
  }

  function setZoom(value) {
    value = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
    state.zoom = value;
    try { localStorage.setItem(ZOOM_KEY, String(value)); } catch (e) {}
    applyFontZoom();
  }



  function loadFiles() {
    fetch(MANIFEST_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('manifest not found');
        return res.json();
      })
      .then(function (names) {
        return Promise.all(names.map(fetchFile));
      })
      .then(function (files) {
        state.files = files.filter(Boolean);

        var savedSelection = null;
        try { savedSelection = localStorage.getItem(SELECTED_KEY); } catch (e) {}
        var initial = state.files.find(function (f) { return f.name === savedSelection; }) || state.files[0];
        state.selected = initial ? initial.name : null;

        render();
      })
      .catch(function () {
        state.loadError = SERVER_HINT;
        render();
      });
  }

  function fetchFile(name) {
    return fetch(MD_DIR + name)
      .then(function (res) {
        if (!res.ok) throw new Error('file not found');
        return res.text();
      })
      .then(function (content) {
        return { name: name, title: deriveTitle(name, content), content: content };
      })
      .catch(function () {
        return null;
      });
  }

  function deriveTitle(name, content) {
    var match = /^\s*#\s+(.+?)\s*$/m.exec(content);
    if (match) return match[1];
    return name.replace(/\.md$/i, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }



  function render() {
    renderFileList();
    renderDetail();
  }

  function renderFileList() {
    var query = dom.fileSearch.value.trim().toLowerCase();
    var files = state.files.filter(function (f) {
      return !query || f.title.toLowerCase().indexOf(query) !== -1 || f.name.toLowerCase().indexOf(query) !== -1;
    });

    dom.fileList.innerHTML = '';

    files.forEach(function (file) {
      var li = document.createElement('li');
      li.className = 'file-list-item' + (file.name === state.selected ? ' active' : '');
      li.innerHTML = ICONS.fileText +
        '<span class="file-list-item-body">' +
        '<span class="file-list-item-name">' + escapeHtml(file.title) + '</span>' +
        '<span class="file-list-item-meta">' +
        '<span>' + escapeHtml(file.name) + '</span>' +
        '<span>' + countWords(file.content) + ' words</span>' +
        '</span>' +
        '</span>';
      li.addEventListener('click', function () {
        state.selected = file.name;
        try { localStorage.setItem(SELECTED_KEY, file.name); } catch (e) {}
        render();
      });
      dom.fileList.appendChild(li);
    });

    if (state.loadError) {
      dom.fileListEmpty.textContent = state.loadError;
      dom.fileListEmpty.hidden = false;
    } else if (state.files.length === 0) {
      dom.fileListEmpty.textContent = 'No markdown files found in the md folder.';
      dom.fileListEmpty.hidden = false;
    } else if (files.length === 0) {
      dom.fileListEmpty.textContent = 'No files match your search.';
      dom.fileListEmpty.hidden = false;
    } else {
      dom.fileListEmpty.hidden = true;
    }
  }

  function getSelectedFile() {
    return state.files.find(function (f) { return f.name === state.selected; }) || null;
  }

  function renderDetail() {
    var file = getSelectedFile();
    if (!file) {
      dom.emptyStateText.textContent = state.loadError || 'Select a file from the list to view it here.';
      dom.emptyState.hidden = false;
      dom.docContent.hidden = true;
      dom.docHeader.hidden = true;
      teardownToc();
      return;
    }

    dom.emptyState.hidden = true;
    dom.docContent.hidden = false;
    dom.docHeader.hidden = false;
    dom.docTitle.textContent = file.title;
    dom.docBody.innerHTML = state.rawView
      ? '<pre class="raw-markdown"><code>' + escapeHtml(file.content) + '</code></pre>'
      : Buddy.markdown.render(file.content);
    enhanceCodeBlocks();
    enhanceTables();
    dom.docDetail.scrollTop = 0;
    buildToc();
    updateRawToggleUI();
  }

  function countWords(text) {
    var words = text.trim().match(/\S+/g);
    return words ? words.length : 0;
  }



  function enhanceCodeBlocks() {
    var pres = dom.docBody.querySelectorAll('pre');
    pres.forEach(function (pre) {
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.title = 'Copy';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML = ICONS.copy;
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        copyToClipboard(code ? code.textContent : pre.textContent, btn);
      });
      wrapper.appendChild(btn);
    });
  }



  function enhanceTables() {
    var tables = dom.docBody.querySelectorAll('table');
    tables.forEach(function (table) {
      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrap';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  function copyToClipboard(text, btn) {
    function showCopied() {
      btn.classList.add('copied');
      btn.innerHTML = ICONS.check;
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.innerHTML = ICONS.copy;
      }, 1500);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showCopied, function () { fallbackCopy(text, showCopied); });
    } else {
      fallbackCopy(text, showCopied);
    }
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (done) done();
  }



  var tocScrollRaf = null;

  function buildToc() {
    teardownToc();

    var headingEls = dom.docBody.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headingEls.length < 2) return;

    var minLevel = Math.min.apply(null, Array.prototype.map.call(headingEls, function (h) {
      return Number(h.tagName.charAt(1));
    }));




    var root = { children: [] };
    var stack = [{ level: minLevel - 1, node: root }];
    headingEls.forEach(function (heading) {
      var level = Number(heading.tagName.charAt(1));
      while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
      var node = { heading: heading, children: [] };
      stack[stack.length - 1].node.children.push(node);
      stack.push({ level: level, node: node });
    });






    var lines = [];
    if (root.children.length === 1) {
      lines.push({ heading: root.children[0].heading, prefix: '' });
      appendTocLines(root.children[0].children, '', lines);
    } else {
      appendTocLines(root.children, '', lines);
    }
    renderTocLines(lines, dom.tocPopoverList);

    dom.tocTrigger.hidden = false;
    dom.docDetail.addEventListener('scroll', onTocScroll);
    state.tocScrollBound = true;
    updateActiveTocItem();
  }





  function appendTocLines(nodes, ancestorPrefix, lines) {
    nodes.forEach(function (node, i) {
      var isLast = i === nodes.length - 1;
      lines.push({ heading: node.heading, prefix: ancestorPrefix + (isLast ? '└── ' : '├── ') });
      if (node.children.length) {
        appendTocLines(node.children, ancestorPrefix + (isLast ? '    ' : '│   '), lines);
      }
    });
  }

  function renderTocLines(lines, container) {
    lines.forEach(function (line) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toc-popover-item';

      var prefixEl = document.createElement('span');
      prefixEl.className = 'toc-tree-prefix';
      prefixEl.textContent = line.prefix;
      btn.appendChild(prefixEl);

      var labelEl = document.createElement('span');
      labelEl.className = 'toc-tree-label';
      labelEl.textContent = line.heading.textContent;
      btn.appendChild(labelEl);

      btn.addEventListener('click', function () { scrollToHeading(line.heading); });
      li.appendChild(btn);
      container.appendChild(li);

      state.tocHeadings.push({ heading: line.heading, popBtn: btn });
    });
  }

  function teardownToc() {
    if (state.tocScrollBound) {
      dom.docDetail.removeEventListener('scroll', onTocScroll);
      state.tocScrollBound = false;
    }
    if (tocScrollRaf) {
      cancelAnimationFrame(tocScrollRaf);
      tocScrollRaf = null;
    }
    state.tocHeadings = [];
    dom.tocPopoverList.innerHTML = '';
    dom.tocTrigger.hidden = true;
  }

  function scrollToHeading(heading) {
    var reducedMotion = window.Buddy && Buddy.theme && Buddy.theme.isMotionReduced();
    heading.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function onTocScroll() {
    if (tocScrollRaf) return;
    tocScrollRaf = requestAnimationFrame(function () {
      tocScrollRaf = null;
      updateActiveTocItem();
    });
  }

  function updateActiveTocItem() {
    if (!state.tocHeadings.length) return;
    var containerTop = dom.docDetail.getBoundingClientRect().top;
    var active = state.tocHeadings[0];
    for (var i = 0; i < state.tocHeadings.length; i++) {
      var rectTop = state.tocHeadings[i].heading.getBoundingClientRect().top;
      if (rectTop - containerTop <= 24) {
        active = state.tocHeadings[i];
      } else {
        break;
      }
    }
    state.tocHeadings.forEach(function (item) {
      var isActive = item === active;
      item.popBtn.classList.toggle('active', isActive);
    });
  }
})();
