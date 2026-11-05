/**
 * EC-Tools Application Logic
 * Personal Project & Stack Navigator (Read-Only Static Deployment for GitHub Pages)
 */

(function () {
  'use strict';

  // App State
  let tools = [];
  let activeCategory = 'all';
  let activeTag = null;
  let searchQuery = '';

  // DOM Elements
  const toolsContainer = document.getElementById('toolsContainer');
  const searchInput = document.getElementById('searchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryLinks = document.querySelectorAll('.category-nav-link');
  const tagCloud = document.getElementById('tagCloud');
  const activeCategoryTitle = document.getElementById('activeCategoryTitle');
  const activeCategorySubtitle = document.getElementById('activeCategorySubtitle');
  const toolCountBadge = document.getElementById('toolCountBadge');
  const toastEl = document.getElementById('customToast');
  const toastMessageEl = document.getElementById('toastMessage');

  /**
   * Helper: Show Toast Notification
   */
  function showToast(message, icon = 'bi-check-circle-fill') {
    if (!toastEl) return;
    toastMessageEl.innerHTML = `<i class="bi ${icon} me-1 text-primary"></i> ${message}`;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  /**
   * Category slug helper for badge styling
   */
  function getCategoryClass(category) {
    const slug = (category || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `cat-${slug}`;
  }

  /**
   * Resolve dedicated manual page path for a tool
   */
  function getManualUrl(tool) {
    if (!tool) return '';
    return tool.manualUrl || `manuals/${tool.id}.html`;
  }

  /**
   * Load data from window.DEFAULT_TOOLS or fallback to fetch data/tools.json
   */
  async function loadData() {
    // 1. Instant load from bundled script (works in file:// and GitHub Pages)
    if (window.DEFAULT_TOOLS && Array.isArray(window.DEFAULT_TOOLS)) {
      tools = [...window.DEFAULT_TOOLS];
      render();
      return;
    }

    // 2. Fetch data/tools.json fallback
    try {
      const res = await fetch('data/tools.json');
      if (res.ok) {
        tools = await res.json();
      }
    } catch (err) {
      console.warn('Could not fetch tools.json directly:', err);
    }

    render();
  }

  /**
   * Filter tools based on activeCategory, activeTag, and searchQuery
   */
  function getFilteredTools() {
    return tools.filter((tool) => {
      // Category filter
      if (activeCategory !== 'all' && tool.category !== activeCategory) {
        return false;
      }

      // Tag filter
      if (activeTag) {
        const hasTag = (tool.tags || []).some(
          (t) => t.toLowerCase() === activeTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const inName = (tool.name || '').toLowerCase().includes(q);
        const inDesc = (tool.description || '').toLowerCase().includes(q);
        const inHowTo = (tool.howToUse || '').toLowerCase().includes(q);
        const inCat = (tool.category || '').toLowerCase().includes(q);
        const inTags = (tool.tags || []).some((t) => t.toLowerCase().includes(q));

        if (!inName && !inDesc && !inHowTo && !inCat && !inTags) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Update category badge counters and sidebar active status
   */
  function updateCategoryCounters() {
    const counts = { all: tools.length };

    tools.forEach((t) => {
      if (t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });

    categoryLinks.forEach((link) => {
      const cat = link.getAttribute('data-category');
      const countSpan = link.querySelector('.cat-count');
      if (countSpan) {
        countSpan.textContent = counts[cat] || 0;
      }

      if (cat === activeCategory) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update main header title
    if (activeCategoryTitle) {
      if (activeCategory === 'all') {
        activeCategoryTitle.innerHTML = `<i class="bi bi-grid-fill me-2 text-primary"></i>All Tools & Resources`;
        if (activeCategorySubtitle) {
          activeCategorySubtitle.textContent = 'Explore your complete directory of stacks, frameworks, skills, and design tools.';
        }
      } else {
        activeCategoryTitle.innerHTML = `<i class="bi bi-folder2-open me-2 text-primary"></i>${activeCategory}`;
        if (activeCategorySubtitle) {
          activeCategorySubtitle.textContent = `Documented tools and future project practical guides under ${activeCategory}.`;
        }
      }
    }
  }

  /**
   * Render dynamic tag pills
   */
  function renderTags() {
    if (!tagCloud) return;

    const tagSet = new Set();
    tools.forEach((tool) => {
      if (Array.isArray(tool.tags)) {
        tool.tags.forEach((tag) => tagSet.add(tag.toLowerCase()));
      }
    });

    const sortedTags = Array.from(tagSet).sort();

    tagCloud.innerHTML = sortedTags
      .map((tag) => {
        const isActive = activeTag === tag;
        return `
          <button type="button" class="tag-pill ${isActive ? 'active' : ''}" data-tag="${escapeHtml(tag)}">
            #${escapeHtml(tag)}
          </button>
        `;
      })
      .join('');
  }

  /**
   * Render tool cards grid
   */
  function renderTools() {
    if (!toolsContainer) return;

    const filtered = getFilteredTools();

    if (toolCountBadge) {
      toolCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'tool' : 'tools'}`;
    }

    if (filtered.length === 0) {
      toolsContainer.innerHTML = `
        <div class="col-12 empty-state">
          <i class="bi bi-search"></i>
          <h5 class="fw-semibold text-main">No tools matched your criteria</h5>
          <p class="text-muted small">Try adjusting your search terms or clearing your category/tag filters.</p>
          <button class="btn btn-outline-secondary btn-sm mt-2" id="resetFiltersBtn">
            <i class="bi bi-arrow-clockwise me-1"></i>Reset All Filters
          </button>
        </div>
      `;

      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeCategory = 'all';
          activeTag = null;
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          if (mobileSearchInput) mobileSearchInput.value = '';
          render();
        });
      }
      return;
    }

    toolsContainer.innerHTML = filtered
      .map((tool) => {
        const catClass = getCategoryClass(tool.category);
        const manualUrl = getManualUrl(tool);
        const tagsHtml = (tool.tags || [])
          .map(
            (t) =>
              `<span class="card-tag" role="button" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</span>`
          )
          .join('');

        return `
          <div class="col-12 col-md-6 col-xl-4">
            <div class="tool-card" id="card-${escapeHtml(tool.id)}" data-manual-url="${escapeHtml(manualUrl)}" role="link" tabindex="0" aria-label="Open ${escapeHtml(tool.name)} user manual">
              <div class="tool-card-header">
                <div>
                  <h3 class="tool-name">
                    ${escapeHtml(tool.name)}
                  </h3>
                  <span class="tool-category-badge ${catClass}">
                    ${escapeHtml(tool.category || 'Tool')}
                  </span>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <button type="button" class="btn-card-action btn-copy-url" data-url="${escapeHtml(tool.url)}" title="Copy documentation link">
                    <i class="bi bi-link-45deg"></i>
                  </button>
                </div>
              </div>

              <p class="tool-description">
                ${escapeHtml(tool.description || 'No description provided.')}
              </p>

              <div class="tool-how-to">
                <div class="tool-how-to-label">
                  <i class="bi bi-lightbulb-fill"></i> How to Use in Future Projects
                </div>
                <div>${escapeHtml(tool.howToUse || 'Add tips, recommended setups, or cheat-sheet notes here.')}</div>
              </div>

              <div class="tool-card-footer">
                <div class="tool-card-tags">
                  ${tagsHtml}
                </div>
                <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer" class="btn-open-doc" title="Open official documentation">
                  Docs <i class="bi bi-box-arrow-up-right"></i>
                </a>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Escape HTML to prevent injection
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return str || '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Full re-render
   */
  function render() {
    updateCategoryCounters();
    renderTags();
    renderTools();
  }

  /**
   * Event Listeners
   */
  function setupEventListeners() {
    // Desktop Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        }
        renderTools();
      });

      // Keyboard shortcut: '/' to focus search, Escape to blur/clear
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput && !['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
          e.preventDefault();
          searchInput.focus();
        } else if (e.key === 'Escape' && document.activeElement === searchInput) {
          searchInput.value = '';
          searchQuery = '';
          if (clearSearchBtn) clearSearchBtn.style.display = 'none';
          searchInput.blur();
          renderTools();
        }
      });
    }

    // Mobile Search input
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchInput) searchInput.value = searchQuery;
        renderTools();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderTools();
      });
    }

    // Category click delegation
    categoryLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.getAttribute('data-category');
        activeCategory = cat;
        activeTag = null;
        render();
      });
    });

    // Tag cloud click
    if (tagCloud) {
      tagCloud.addEventListener('click', (e) => {
        const pill = e.target.closest('.tag-pill');
        if (!pill) return;
        const tag = pill.getAttribute('data-tag');
        if (activeTag === tag) {
          activeTag = null; // Toggle off
        } else {
          activeTag = tag;
        }
        render();
      });
    }

    // Card delegator (Tags, Copy URL)
    if (toolsContainer) {
      toolsContainer.addEventListener('click', (e) => {
        // Tag click inside card
        const cardTag = e.target.closest('.card-tag');
        if (cardTag) {
          const tag = cardTag.getAttribute('data-tag');
          activeTag = activeTag === tag ? null : tag;
          render();
          return;
        }

        // Copy URL
        const copyBtn = e.target.closest('.btn-copy-url');
        if (copyBtn) {
          const url = copyBtn.getAttribute('data-url');
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
              showToast('Documentation link copied to clipboard!');
            });
          }
          return;
        }

        // Ignore direct clicks on external doc links or other buttons
        if (e.target.closest('.btn-open-doc, a, button')) {
          return;
        }

        // Navigate to dedicated tool manual page when clicking the card
        const card = e.target.closest('.tool-card[data-manual-url]');
        if (card) {
          const manualUrl = card.getAttribute('data-manual-url');
          if (manualUrl) {
            window.location.href = manualUrl;
          }
        }
      });

      toolsContainer.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.tool-card[data-manual-url]');
        if (card && e.target === card) {
          e.preventDefault();
          const manualUrl = card.getAttribute('data-manual-url');
          if (manualUrl) {
            window.location.href = manualUrl;
          }
        }
      });
    }

    // Palette Rotator triggers
    const rotateBtns = [
      document.getElementById('rotatePaletteBtn'),
      document.getElementById('mobileRotatePaletteBtn'),
      document.getElementById('footerRotatePaletteBtn')
    ];

    rotateBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => {
          rotatePalette();
        });
      }
    });

    // Swatch rows in footer: click to activate palette
    const swatchRows = document.querySelectorAll('.swatch-row');
    swatchRows.forEach((row) => {
      row.addEventListener('click', () => {
        const palId = row.getAttribute('data-palette');
        const targetIdx = PALETTES.findIndex((p) => p.id === palId);
        if (targetIdx !== -1) {
          currentPaletteIndex = targetIdx;
          applyPalette(PALETTES[currentPaletteIndex], true);
        } else {
          rotatePalette();
        }
      });

      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });
    });

    // Footer Copy Email
    const footerCopyEmailBtn = document.getElementById('footerCopyEmailBtn');
    if (footerCopyEmailBtn) {
      footerCopyEmailBtn.addEventListener('click', () => {
        const email = footerCopyEmailBtn.getAttribute('data-email') || 'educode597@gmail.com';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(() => {
            showToast(`Email copied: ${email}`, 'bi-envelope-check-fill');
          }).catch(() => {
            showToast(`Contact: ${email}`, 'bi-envelope-fill');
          });
        } else {
          showToast(`Contact: ${email}`, 'bi-envelope-fill');
        }
      });
    }

    // Back to top smooth scroll
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 5-Hex Color Scheme Rotator System
  // Palette: #ffffff - #fff4e9 - #828e82 - #131b23 - #000000
  // --------------------------------------------------------------------------
  const PALETTES = [
    { id: 'warm-linen', name: 'Warm Linen', hex: '#fff4e9', desc: 'Warm Linen & Obsidian' },
    { id: 'midnight-obsidian', name: 'Midnight Obsidian', hex: '#131b23', desc: 'Midnight Obsidian & Sage' },
    { id: 'nordic-sage', name: 'Nordic Sage', hex: '#828e82', desc: 'Editorial Sage & Cream' },
    { id: 'pitch-black', name: 'Pitch Obsidian', hex: '#000000', desc: 'Pitch Black & White' },
    { id: 'crisp-alabaster', name: 'Crisp Alabaster', hex: '#ffffff', desc: 'Crisp Alabaster & Sage' }
  ];
  let currentPaletteIndex = 0;

  function initPalette() {
    const saved = localStorage.getItem('ec_tools_palette');
    const idx = PALETTES.findIndex((p) => p.id === saved);
    if (idx !== -1) {
      currentPaletteIndex = idx;
    } else {
      currentPaletteIndex = 0;
    }
    applyPalette(PALETTES[currentPaletteIndex], false);
  }

  function applyPalette(palette, notify = false) {
    document.documentElement.setAttribute('data-palette', palette.id);
    localStorage.setItem('ec_tools_palette', palette.id);

    const currentPaletteLabel = document.getElementById('currentPaletteLabel');
    if (currentPaletteLabel) {
      currentPaletteLabel.textContent = palette.name;
    }

    const mobileCurrentPaletteLabel = document.getElementById('mobileCurrentPaletteLabel');
    if (mobileCurrentPaletteLabel) {
      mobileCurrentPaletteLabel.textContent = palette.name;
    }

    const footerActiveThemeBadge = document.getElementById('footerActiveThemeBadge');
    if (footerActiveThemeBadge) {
      footerActiveThemeBadge.textContent = palette.name;
    }

    const footerRotatorStep = document.getElementById('footerRotatorStep');
    if (footerRotatorStep) {
      footerRotatorStep.textContent = `${currentPaletteIndex + 1} / ${PALETTES.length}`;
    }

    // Highlight active swatch row
    const swatchRows = document.querySelectorAll('.swatch-row');
    swatchRows.forEach((row) => {
      if (row.getAttribute('data-palette') === palette.id) {
        row.classList.add('active-swatch-row');
      } else {
        row.classList.remove('active-swatch-row');
      }
    });

    if (notify) {
      showToast(`Palette: ${palette.desc} (${palette.hex})`, 'bi-palette2');
    }
  }

  function rotatePalette() {
    currentPaletteIndex = (currentPaletteIndex + 1) % PALETTES.length;
    applyPalette(PALETTES[currentPaletteIndex], true);
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initPalette();
    setupEventListeners();
    loadData();
  });

  // Export functions for unit testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      getFilteredTools,
      escapeHtml,
      getCategoryClass,
      getManualUrl,
    };
  }
})();

