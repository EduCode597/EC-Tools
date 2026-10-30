/**
 * EC-Tools Application Logic
 * Personal Project & Stack Navigator
 */

(function () {
  'use strict';

  // Storage key
  const STORAGE_KEY = 'ec_tools_dataset_v1';

  // App State
  let tools = [];
  let activeCategory = 'all';
  let activeTag = null;
  let searchQuery = '';
  let editingToolId = null;

  // DOM Elements
  const toolsContainer = document.getElementById('toolsContainer');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryLinks = document.querySelectorAll('.category-nav-link');
  const tagCloud = document.getElementById('tagCloud');
  const activeCategoryTitle = document.getElementById('activeCategoryTitle');
  const activeCategorySubtitle = document.getElementById('activeCategorySubtitle');
  const toolCountBadge = document.getElementById('toolCountBadge');
  const toastEl = document.getElementById('customToast');
  const toastMessageEl = document.getElementById('toastMessage');

  // Modals
  const toolModalEl = document.getElementById('toolModal');
  let toolModalInstance = null;
  const toolForm = document.getElementById('toolForm');
  const toolModalTitle = document.getElementById('toolModalTitle');

  const dataModalEl = document.getElementById('dataModal');
  let dataModalInstance = null;
  const jsonExportArea = document.getElementById('jsonExportArea');

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
   * Initialize bootstrap modal instances
   */
  function initModals() {
    if (typeof bootstrap !== 'undefined') {
      if (toolModalEl) toolModalInstance = new bootstrap.Modal(toolModalEl);
      if (dataModalEl) dataModalInstance = new bootstrap.Modal(dataModalEl);
    }
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
   * Load data from localStorage or default bundled data
   */
  async function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        tools = JSON.parse(stored);
        render();
        return;
      } catch (e) {
        console.warn('Failed to parse localStorage data, falling back to defaults', e);
      }
    }

    // Fallback to window.DEFAULT_TOOLS if loaded
    if (window.DEFAULT_TOOLS && Array.isArray(window.DEFAULT_TOOLS)) {
      tools = [...window.DEFAULT_TOOLS];
      render();
      return;
    }

    // Fallback to fetch data/tools.json
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
   * Save dataset to localStorage
   */
  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools, null, 2));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
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
          render();
        });
      }
      return;
    }

    toolsContainer.innerHTML = filtered
      .map((tool) => {
        const catClass = getCategoryClass(tool.category);
        const tagsHtml = (tool.tags || [])
          .map(
            (t) =>
              `<span class="card-tag" role="button" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</span>`
          )
          .join('');

        return `
          <div class="col-12 col-md-6 col-xl-4">
            <div class="tool-card" id="card-${escapeHtml(tool.id)}">
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
                  <button type="button" class="btn-card-action btn-edit-tool" data-id="${escapeHtml(tool.id)}" title="Edit tool details">
                    <i class="bi bi-pencil-square"></i>
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
    // Search input
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

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
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
        // Keep active tag or clear if switching? Clear active tag to avoid empty results
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

    // Card delegator (Tags, Copy URL, Edit Tool)
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

        // Edit Tool
        const editBtn = e.target.closest('.btn-edit-tool');
        if (editBtn) {
          const id = editBtn.getAttribute('data-id');
          openEditModal(id);
          return;
        }
      });
    }

    // Add Tool Button
    const addToolBtn = document.getElementById('addToolBtn');
    if (addToolBtn) {
      addToolBtn.addEventListener('click', () => {
        openAddModal();
      });
    }

    // Tool Form Submit
    if (toolForm) {
      toolForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveToolFromForm();
      });
    }

    // Data Management Buttons (Export / Import)
    const openDataModalBtn = document.getElementById('openDataModalBtn');
    if (openDataModalBtn) {
      openDataModalBtn.addEventListener('click', () => {
        if (jsonExportArea) {
          jsonExportArea.value = JSON.stringify(tools, null, 2);
        }
        if (dataModalInstance) dataModalInstance.show();
      });
    }

    const copyJsonBtn = document.getElementById('copyJsonBtn');
    if (copyJsonBtn) {
      copyJsonBtn.addEventListener('click', () => {
        if (jsonExportArea && navigator.clipboard) {
          navigator.clipboard.writeText(jsonExportArea.value).then(() => {
            showToast('JSON copied to clipboard!');
          });
        }
      });
    }

    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    if (downloadJsonBtn) {
      downloadJsonBtn.addEventListener('click', () => {
        const jsonStr = JSON.stringify(tools, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tools.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('tools.json downloaded successfully!');
      });
    }

    const importJsonBtn = document.getElementById('importJsonBtn');
    if (importJsonBtn) {
      importJsonBtn.addEventListener('click', () => {
        if (!jsonExportArea) return;
        try {
          const imported = JSON.parse(jsonExportArea.value);
          if (Array.isArray(imported)) {
            tools = imported;
            saveData();
            render();
            if (dataModalInstance) dataModalInstance.hide();
            showToast('Tools successfully updated from JSON!');
          } else {
            alert('JSON must be an array of tool objects.');
          }
        } catch (err) {
          alert('Invalid JSON format. Please verify the syntax.');
        }
      });
    }

    const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
    if (resetDefaultsBtn) {
      resetDefaultsBtn.addEventListener('click', () => {
        if (confirm('Reset all tools back to default repository tools? Any custom additions will be cleared.')) {
          localStorage.removeItem(STORAGE_KEY);
          if (window.DEFAULT_TOOLS) {
            tools = [...window.DEFAULT_TOOLS];
          }
          render();
          if (dataModalInstance) dataModalInstance.hide();
          showToast('Reset to default tools successfully!');
        }
      });
    }

    // Delete tool button inside modal
    const deleteToolBtn = document.getElementById('deleteToolBtn');
    if (deleteToolBtn) {
      deleteToolBtn.addEventListener('click', () => {
        if (!editingToolId) return;
        if (confirm('Are you sure you want to delete this tool?')) {
          tools = tools.filter((t) => t.id !== editingToolId);
          saveData();
          render();
          if (toolModalInstance) toolModalInstance.hide();
          showToast('Tool deleted.');
        }
      });
    }
  }

  /**
   * Modal: Open for Add
   */
  function openAddModal() {
    editingToolId = null;
    if (toolForm) toolForm.reset();
    if (toolModalTitle) toolModalTitle.textContent = 'Add New Tool / Resource';
    const deleteBtn = document.getElementById('deleteToolBtn');
    if (deleteBtn) deleteBtn.style.display = 'none';

    // Preselect active category if not 'all'
    const categorySelect = document.getElementById('toolCategory');
    if (categorySelect && activeCategory !== 'all') {
      categorySelect.value = activeCategory;
    }

    if (toolModalInstance) toolModalInstance.show();
  }

  /**
   * Modal: Open for Edit
   */
  function openEditModal(id) {
    const tool = tools.find((t) => t.id === id);
    if (!tool) return;

    editingToolId = id;
    if (toolModalTitle) toolModalTitle.textContent = `Edit Tool: ${tool.name}`;

    document.getElementById('toolName').value = tool.name || '';
    document.getElementById('toolCategory').value = tool.category || 'Tech Stacks';
    document.getElementById('toolUrl').value = tool.url || '';
    document.getElementById('toolDescription').value = tool.description || '';
    document.getElementById('toolHowTo').value = tool.howToUse || '';
    document.getElementById('toolTags').value = (tool.tags || []).join(', ');

    const deleteBtn = document.getElementById('deleteToolBtn');
    if (deleteBtn) deleteBtn.style.display = 'inline-block';

    if (toolModalInstance) toolModalInstance.show();
  }

  /**
   * Modal: Save form
   */
  function saveToolFromForm() {
    const name = document.getElementById('toolName').value.trim();
    const category = document.getElementById('toolCategory').value;
    const url = document.getElementById('toolUrl').value.trim();
    const description = document.getElementById('toolDescription').value.trim();
    const howToUse = document.getElementById('toolHowTo').value.trim();
    const rawTags = document.getElementById('toolTags').value;

    const tags = rawTags
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    if (!name || !url) {
      alert('Please provide at least a Tool Name and Documentation URL.');
      return;
    }

    if (editingToolId) {
      // Update existing
      const index = tools.findIndex((t) => t.id === editingToolId);
      if (index !== -1) {
        tools[index] = {
          ...tools[index],
          name,
          category,
          url,
          description,
          howToUse,
          tags,
        };
        showToast(`Updated "${name}" successfully!`);
      }
    } else {
      // Create new
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
      const newTool = {
        id,
        name,
        category,
        url,
        description,
        howToUse,
        tags,
      };
      tools.unshift(newTool);
      showToast(`Added "${name}" to your tools!`);
    }

    saveData();
    render();
    if (toolModalInstance) toolModalInstance.hide();
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initModals();
    setupEventListeners();
    loadData();
  });

  // Export functions for testing if needed
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      getFilteredTools,
      escapeHtml,
      getCategoryClass,
    };
  }
})();
