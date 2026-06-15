/* =========================================================================
 * LaunchPad UI — Developer OS Dashboard
 * Complete vanilla JavaScript application
 * No frameworks. Pure ES6+. Production-ready.
 * ========================================================================= */

'use strict';

/* =========================================================================
 * UTILITY HELPERS
 * ========================================================================= */

/**
 * Generate a unique ID with crypto.randomUUID fallback
 * @returns {string} Unique identifier
 */
const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
};

/**
 * Deep merge two objects — source values override target
 * @param {Object} target - Base object
 * @param {Object} source - Override object
 * @returns {Object} Merged result
 */
const deepMerge = (target, source) => {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
};

/**
 * Deep clone an object using structured clone with JSON fallback
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
};

/**
 * Create a debounced version of a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Safely set text content of an element by ID
 * @param {string} id - Element ID
 * @param {string} text - Text to set
 */
const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

/**
 * Capitalize every word in a string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
const capitalize = (str) =>
  str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/**
 * Convert hex color to rgba string
 * @param {string} hex - Hex color (#RRGGBB)
 * @param {number} alpha - Opacity (0–1)
 * @returns {string} rgba() color string
 */
const hexToRgba = (hex, alpha = 1) => {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Lighten a hex color by mixing with white
 * @param {string} hex - Hex color
 * @param {number} amount - Lighten amount (0–1)
 * @returns {string} Lightened hex color
 */
const lightenColor = (hex, amount = 0.2) => {
  const sanitized = hex.replace('#', '');
  let r = parseInt(sanitized.substring(0, 2), 16);
  let g = parseInt(sanitized.substring(2, 4), 16);
  let b = parseInt(sanitized.substring(4, 6), 16);

  r = Math.min(255, Math.round(r + (255 - r) * amount));
  g = Math.min(255, Math.round(g + (255 - g) * amount));
  b = Math.min(255, Math.round(b + (255 - b) * amount));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Check if a sessionStorage cache entry is still valid
 * @param {string} key - Cache key
 * @param {number} ttlMs - Time-to-live in milliseconds
 * @returns {Object|null} Cached data or null if expired/missing
 */
const getCache = (key, ttlMs) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > ttlMs) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

/**
 * Set a sessionStorage cache entry
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 */
const setCache = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn('Cache write failed:', e.message);
  }
};

/**
 * Safe local storage wrapper that prevents SecurityError on file:///
 */
const SafeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`SafeStorage: setItem failed for ${key}`, e.message);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
  keys: () => {
    try {
      const k = [];
      for (let i = 0; i < localStorage.length; i++) {
        k.push(localStorage.key(i));
      }
      return k;
    } catch {
      return [];
    }
  }
};

/**
 * Safe fetch wrapper with timeout and JSON parsing
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 */
const safeFetch = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    console.warn(`safeFetch failed for ${url}:`, error.message);
    throw error;
  }
};


/* =========================================================================
 * 1. USER CONFIG MODULE
 * Manages all user configuration via localStorage
 * ========================================================================= */

const UserConfig = (() => {
  const STORAGE_KEY = 'launchpad_config';

  const DEFAULT_CONFIG = {
    user: {
      name: 'Developer',
      githubUsername: 'octocat',
      leetcodeUsername: '',
      location: '',
    },
    theme: {
      mode: 'dark',
      accent: '#6366f1',
    },
    widgets: {
      clock: { visible: true, order: 0 },
      weather: { visible: true, order: 1 },
      tasks: { visible: true, order: 2 },
      quote: { visible: true, order: 3 },
      quickApps: { visible: true, order: 4 },
      news: { visible: false, order: 5 },
      pomodoro: { visible: false, order: 6 },
      github: { visible: false, order: 7 },
      goals: { visible: true, order: 8 },
      notes: { visible: true, order: 9 },
      calendar: { visible: true, order: 10 },
      focusMode: { visible: false, order: 11 },
    },
    quickApps: [
      { name: 'YouTube', url: 'https://youtube.com', icon: 'fa-youtube', brand: true },
      { name: 'GitHub', url: 'https://github.com', icon: 'fa-github', brand: true },
      { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'fa-linkedin-in', brand: true },
      { name: 'Twitter', url: 'https://x.com', icon: 'fa-twitter', brand: true },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'fa-stack-overflow', brand: true },
      { name: 'CodePen', url: 'https://codepen.io', icon: 'fa-codepen', brand: true },
    ],
    pomodoro: {
      focus: 25,
      break: 5,
    },
    goals: {
      target: 3,
    },
    onboardingComplete: false,
    layoutOrder: [],
  };

  /** Current in-memory config reference */
  let _config = null;

  return {
    /**
     * Load config from localStorage, deep-merging with defaults
     * so new fields added in updates are always present.
     * @returns {Object} The loaded (or default) config
     */
    load() {
      try {
        const raw = SafeStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          _config = deepMerge(deepClone(DEFAULT_CONFIG), saved);
        } else {
          _config = deepClone(DEFAULT_CONFIG);
        }
      } catch {
        _config = deepClone(DEFAULT_CONFIG);
      }
      return _config;
    },

    /**
     * Persist the given config object to localStorage
     * @param {Object} config - Config to save
     */
    save(config) {
      _config = config;
      try {
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.error('Failed to save config:', e.message);
      }
    },

    /**
     * Dot-notation getter  e.g. get('user.name')
     * @param {string} path - Dot-delimited path
     * @returns {*} Value at path, or undefined
     */
    get(path) {
      if (!_config) this.load();
      return path.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), _config);
    },

    /**
     * Dot-notation setter with auto-save
     * @param {string} path - Dot-delimited path
     * @param {*} value - Value to set
     */
    set(path, value) {
      if (!_config) this.load();
      const keys = path.split('.');
      let obj = _config;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]] || typeof obj[keys[i]] !== 'object') {
          obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      this.save(_config);
    },

    /**
     * Clear all launchpad_* keys from localStorage and reload
     */
    reset() {
      const keysToRemove = [];
      const keys = SafeStorage.keys();
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key && key.startsWith('launchpad_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => SafeStorage.removeItem(k));
      location.reload();
    },

    /**
     * Export all app data (config + tasks + goals + notes) as a downloadable JSON
     */
    exportData() {
      const bundle = {
        config: _config,
        tasks: JSON.parse(SafeStorage.getItem('launchpad_tasks') || '[]'),
        goals: JSON.parse(SafeStorage.getItem('launchpad_goals') || '[]'),
        notes: SafeStorage.getItem('launchpad_notes') || '',
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `launchpad-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /**
     * Import data from a JSON string, validate, merge, and reload
     * @param {string} jsonString - Raw JSON data
     */
    importData(jsonString) {
      try {
        const bundle = JSON.parse(jsonString);

        // Validate basic structure
        if (!bundle.config || typeof bundle.config !== 'object') {
          throw new Error('Invalid backup: missing config object');
        }

        // Merge config
        const merged = deepMerge(deepClone(DEFAULT_CONFIG), bundle.config);
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

        // Restore auxiliary data
        if (Array.isArray(bundle.tasks)) {
          SafeStorage.setItem('launchpad_tasks', JSON.stringify(bundle.tasks));
        }
        if (Array.isArray(bundle.goals)) {
          SafeStorage.setItem('launchpad_goals', JSON.stringify(bundle.goals));
        }
        if (typeof bundle.notes === 'string') {
          SafeStorage.setItem('launchpad_notes', bundle.notes);
        }

        location.reload();
      } catch (e) {
        console.error('Import failed:', e.message);
        alert('Import failed: ' + e.message);
      }
    },

    /**
     * Return a deep clone of the default config
     * @returns {Object} Fresh default config
     */
    getDefault() {
      return deepClone(DEFAULT_CONFIG);
    },

    /**
     * Return the current in-memory config (read-only reference)
     * @returns {Object} Current config
     */
    current() {
      if (!_config) this.load();
      return _config;
    },
  };
})();


/* =========================================================================
 * 2. ONBOARDING MODULE
 * First-time setup wizard with multi-step form
 * ========================================================================= */

const Onboarding = (() => {
  let currentStep = 1;
  const TOTAL_STEPS = 5;

  // DOM cache
  const els = {};

  /**
   * Cache all onboarding DOM elements
   */
  const cacheDOM = () => {
    els.wizard = document.getElementById('onboarding-wizard');
    els.steps = els.wizard ? els.wizard.querySelectorAll('.onboarding-step') : [];
    els.progressFill = document.getElementById('onboard-progress-fill');
    els.stepText = document.getElementById('onboard-step-text');
    els.skipBtn = document.getElementById('onboard-skip');
    els.finishBtn = document.getElementById('onboard-finish');
    els.nameInput = document.getElementById('onboard-name');
    els.githubInput = document.getElementById('onboard-github');
    els.leetcodeInput = document.getElementById('onboard-leetcode');
    els.themeOptions = els.wizard ? els.wizard.querySelectorAll('.theme-option') : [];
    els.widgetToggles = els.wizard ? els.wizard.querySelectorAll('.onboard-widget-toggle') : [];
    els.widgetsList = document.getElementById('onboard-widgets-list');
    els.focusSlider = document.getElementById('pref-focus');
    els.breakSlider = document.getElementById('pref-break');
    els.goalsSlider = document.getElementById('pref-goals');
    els.focusVal = document.getElementById('focus-val');
    els.breakVal = document.getElementById('break-val');
    els.goalsVal = document.getElementById('goals-val');
    els.previewGreetingName = document.getElementById('prev-greeting-name');
    els.previewWrapper = els.wizard ? els.wizard.querySelector('.onboard-preview-wrapper') : null;
    els.previewPomoVal = document.getElementById('prev-pomo-val');
    els.previewGrid = els.wizard ? els.wizard.querySelector('.preview-grid') : null;
    els.bootLines = els.wizard ? els.wizard.querySelectorAll('.boot-line') : [];
  };

  /**
   * Show a specific wizard step (1-indexed)
   * @param {number} n - Step number
   */
  const showStep = (n) => {
    currentStep = Math.max(1, Math.min(n, TOTAL_STEPS));

    // Hide all steps, show current
    els.steps.forEach((step) => {
      step.classList.remove('active');
      step.style.display = 'none';
    });
    
    const activeStep = els.wizard?.querySelector(`[data-step="${currentStep}"]`);
    if (activeStep) {
      activeStep.style.display = '';
      // Trigger reflow for animation
      requestAnimationFrame(() => activeStep.classList.add('active'));
    }

    // Update progress header
    if (els.stepText) {
      els.stepText.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
    }
    if (els.progressFill) {
      els.progressFill.style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
    }

    // Reset boot lines if entering step 5
    if (currentStep === 5) {
      els.bootLines.forEach((line) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(5px)';
        line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      });
    }
  };

  /**
   * Gather inputs from all steps, save to config, and launch the dashboard
   */
  const finish = () => {
    if (els.finishBtn) {
      els.finishBtn.disabled = true;
      els.finishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booting OS...';
    }

    // Play staggered terminal boot sequence lines
    const staggerDelay = 400;
    els.bootLines.forEach((line, index) => {
      setTimeout(() => {
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
      }, index * staggerDelay);
    });

    // Wait until boot sequence is finished + brief buffer, then fade out wizard and boot
    const totalBootDuration = els.bootLines.length * staggerDelay + 800;
    
    setTimeout(() => {
      // Fade out onboarding container with scale zoom
      if (els.wizard) {
        els.wizard.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        els.wizard.style.opacity = '0';
        els.wizard.style.transform = 'scale(1.05)';
      }

      setTimeout(() => {
        const config = UserConfig.current();

        // Step 1: identity
        if (els.nameInput && els.nameInput.value.trim()) {
          config.user.name = els.nameInput.value.trim();
        }
        if (els.githubInput && els.githubInput.value.trim()) {
          config.user.githubUsername = els.githubInput.value.trim();
        }
        if (els.leetcodeInput && els.leetcodeInput.value.trim()) {
          config.user.leetcodeUsername = els.leetcodeInput.value.trim();
        }

        // Step 3: widgets configuration
        els.widgetToggles.forEach((toggle) => {
          const widgetName = toggle.dataset.widget;
          if (widgetName && config.widgets[widgetName]) {
            config.widgets[widgetName].visible = toggle.checked;
          }
        });

        // Draggable layout order mapping
        if (els.widgetsList) {
          const listOrder = Array.from(els.widgetsList.children).map((child) => child.dataset.widget);
          const widgetMap = {
            clock: 'widget-clock',
            weather: 'widget-weather',
            tasks: 'widget-tasks',
            pomodoro: 'widget-pomodoro',
            notes: 'widget-notes',
            news: 'widget-news',
            calendar: 'widget-calendar',
            github: 'widget-github',
          };

          const layoutOrder = listOrder.map((name) => widgetMap[name]).filter(Boolean);

          // Append other widgets that are not inside onboarding's draggable list
          const otherWidgets = ['widget-quote', 'widget-apps', 'widget-goals', 'widget-focus'];
          otherWidgets.forEach((id) => {
            if (!layoutOrder.includes(id)) {
              layoutOrder.push(id);
            }
          });

          config.layoutOrder = layoutOrder;
        }

        // Step 4: productivity preferences
        config.pomodoro = {
          focus: parseInt(els.focusSlider?.value, 10) || 25,
          break: parseInt(els.breakSlider?.value, 10) || 5,
        };
        config.goals = {
          target: parseInt(els.goalsSlider?.value, 10) || 3,
        };

        config.onboardingComplete = true;
        UserConfig.save(config);

        // Hide wizard and restore defaults
        if (els.wizard) {
          els.wizard.classList.add('hidden');
          els.wizard.style.opacity = '';
          els.wizard.style.transform = '';
        }

        // Launch dashboard
        App.launchDashboard(config);
      }, 600); // Wait for CSS transition
    }, totalBootDuration);
  };

  /**
   * Skip onboarding — save defaults and launch
   */
  const skip = () => {
    const config = UserConfig.current();
    config.onboardingComplete = true;
    UserConfig.save(config);

    if (els.wizard) els.wizard.classList.add('hidden');
    App.launchDashboard(config);
  };

  return {
    /**
     * Initialize the onboarding module
     */
    init() {
      cacheDOM();
      if (!els.wizard) return;

      const config = UserConfig.load();
      if (config.onboardingComplete) {
        els.wizard.classList.add('hidden');
        return;
      }

      // Show wizard
      els.wizard.classList.remove('hidden');
      showStep(1);

      // Step 1: name input live preview
      els.nameInput?.addEventListener('input', () => {
        const val = els.nameInput.value.trim();
        if (els.previewGreetingName) {
          els.previewGreetingName.textContent = val || 'Developer';
        }
      });

      // Step 2: themes live preview & preset variables mapping
      els.themeOptions.forEach((opt) => {
        opt.addEventListener('click', () => {
          els.themeOptions.forEach((o) => o.classList.remove('active'));
          opt.classList.add('active');

          const themeName = opt.dataset.theme; // aurora, cyberpunk, minimal, neon
          
          if (els.previewWrapper) {
            els.previewWrapper.className = `onboard-preview-wrapper theme-${themeName}`;
          }

          const colors = {
            aurora: '#8b5cf6',
            cyberpunk: '#f43f5e',
            minimal: '#6366f1',
            neon: '#06b6d4',
          };

          const accentColor = colors[themeName] || '#8b5cf6';
          ThemeManager.setAccent(accentColor);
          ThemeManager.setMode('dark');
        });
      });

      // Step 3: widgets toggles live preview
      els.widgetToggles.forEach((toggle) => {
        // Sync initial state on load
        const name = toggle.dataset.widget;
        const miniCard = els.previewGrid?.querySelector(`.mini-card[data-widget="${name}"]`);
        if (miniCard) {
          miniCard.classList.toggle('hidden', !toggle.checked);
        }

        toggle.addEventListener('change', () => {
          const name = toggle.dataset.widget;
          const miniCard = els.previewGrid?.querySelector(`.mini-card[data-widget="${name}"]`);
          if (miniCard) {
            miniCard.classList.toggle('hidden', !toggle.checked);
          }
        });
      });

      // Step 3: Sortable list configuration & live grid reorder binding
      if (els.widgetsList && typeof Sortable !== 'undefined') {
        new Sortable(els.widgetsList, {
          animation: 250,
          handle: '.onboard-drag-handle',
          ghostClass: 'sortable-ghost',
          onEnd: () => {
            const order = Array.from(els.widgetsList.children).map((child) => child.dataset.widget);
            order.forEach((widgetName) => {
              const miniCard = els.previewGrid?.querySelector(`.mini-card[data-widget="${widgetName}"]`);
              if (miniCard && els.previewGrid) {
                els.previewGrid.appendChild(miniCard);
              }
            });
          },
        });
      }

      // Step 4: productivity range inputs & live preview binding
      const setupSlider = (slider, valEl, previewEl) => {
        if (!slider) return;
        const update = () => {
          const val = slider.value;
          if (valEl) valEl.textContent = val;
          if (previewEl) previewEl.textContent = val;
        };
        slider.addEventListener('input', update);
        update();
      };

      setupSlider(els.focusSlider, els.focusVal, els.previewPomoVal);
      setupSlider(els.breakSlider, els.breakVal);
      setupSlider(els.goalsSlider, els.goalsVal);

      // Bind per-step navigation buttons
      for (let s = 1; s <= TOTAL_STEPS; s++) {
        const nextBtn = document.getElementById(`onboard-next-${s}`);
        const prevBtn = document.getElementById(`onboard-prev-${s}`);
        nextBtn?.addEventListener('click', () => showStep(currentStep + 1));
        prevBtn?.addEventListener('click', () => showStep(currentStep - 1));
      }

      els.skipBtn?.addEventListener('click', skip);
      els.finishBtn?.addEventListener('click', finish);
    },
  };
})();


/* =========================================================================
 * 3. THEME MANAGER MODULE
 * Handles dark/light mode and accent color customization
 * ========================================================================= */

const ThemeManager = (() => {
  const els = {};

  const cacheDOM = () => {
    els.toggle = document.getElementById('theme-toggle');
  };

  return {
    /**
     * Initialize theme from config
     * @param {Object} config - App configuration
     */
    init(config) {
      cacheDOM();
      this.setMode(config.theme.mode);
      this.setAccent(config.theme.accent);

      // Bind toggle button
      els.toggle?.addEventListener('click', () => this.toggle());
    },

    /**
     * Set the theme mode (dark/light)
     * @param {string} mode - 'dark' or 'light'
     */
    setMode(mode) {
      document.documentElement.setAttribute('data-theme', mode);

      // Update toggle icon
      const icon = els.toggle?.querySelector('i') || document.querySelector('#theme-toggle i');
      if (icon) {
        icon.className = mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }

      UserConfig.set('theme.mode', mode);
    },

    /**
     * Set the accent color and compute derived CSS custom properties
     * @param {string} color - Hex color string
     */
    setAccent(color) {
      const root = document.documentElement;
      root.style.setProperty('--accent', color);
      root.style.setProperty('--accent-glow', hexToRgba(color, 0.15));
      root.style.setProperty('--accent-hover', lightenColor(color, 0.2));

      UserConfig.set('theme.accent', color);
    },

    /**
     * Toggle between dark and light mode
     */
    toggle() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      this.setMode(next);
    },
  };
})();


/* =========================================================================
 * 4. CLOCK MODULE
 * Real-time clock updated every second
 * ========================================================================= */

const Clock = (() => {
  let intervalId = null;

  const els = {};

  const cacheDOM = () => {
    els.time = document.getElementById('clock-time');
    els.ampm = document.getElementById('clock-ampm');
    els.date = document.getElementById('clock-date');
    els.seconds = document.getElementById('clock-seconds');
  };

  /**
   * Update all clock display elements
   */
  const update = () => {
    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;

    if (els.time) els.time.textContent = `${hours}:${minutes}`;
    if (els.ampm) els.ampm.textContent = ampm;
    if (els.seconds) els.seconds.textContent = `:${seconds}`;
    if (els.date) {
      els.date.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  return {
    /**
     * Initialize the clock — start the 1-second interval
     */
    init() {
      // Clean up any previous interval
      if (intervalId) clearInterval(intervalId);

      cacheDOM();
      update();
      intervalId = setInterval(update, 1000);
    },
  };
})();


/* =========================================================================
 * 5. WEATHER MODULE
 * Fetches weather data from OpenWeatherMap with caching
 * ========================================================================= */

const Weather = (() => {
  const API_KEY = '58150b5e6a10b632504148292ede9f48';
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  const ICON_MAP = {
    '01': 'fa-sun',
    '02': 'fa-cloud-sun',
    '03': 'fa-cloud',
    '04': 'fa-cloud',
    '09': 'fa-cloud-showers-heavy',
    '10': 'fa-cloud-rain',
    '11': 'fa-bolt',
    '13': 'fa-snowflake',
    '50': 'fa-smog',
  };

  const els = {};

  const cacheDOM = () => {
    els.city = document.getElementById('weather-city');
    els.temp = document.getElementById('weather-temp');
    els.desc = document.getElementById('weather-desc');
    els.icon = document.getElementById('weather-icon-display');
    els.feels = document.getElementById('weather-feels');
    els.humidity = document.getElementById('weather-humidity');
  };

  /**
   * Update the weather UI with parsed data
   * @param {Object} data - OpenWeatherMap response
   */
  const updateUI = (data) => {
    if (!data || !data.main || !data.weather?.[0]) return;

    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const description = capitalize(data.weather[0].description);
    const iconCode = data.weather[0].icon?.slice(0, 2) || '03';
    const iconClass = ICON_MAP[iconCode] || 'fa-cloud';

    if (els.city) els.city.textContent = data.name || 'Unknown';
    if (els.temp) els.temp.textContent = `${temp}°C`;
    if (els.desc) els.desc.textContent = description;
    if (els.feels) els.feels.textContent = `${feelsLike}°C`;
    if (els.humidity) els.humidity.textContent = `${humidity}%`;
    if (els.icon) els.icon.innerHTML = `<i class="fas ${iconClass}"></i>`;
  };

  /**
   * Show a weather error state in the UI
   * @param {string} msg - Error message
   */
  const showError = (msg) => {
    if (els.city) els.city.textContent = msg || 'Weather unavailable';
    if (els.temp) els.temp.textContent = '--°C';
    if (els.desc) els.desc.textContent = '';
    if (els.feels) els.feels.textContent = '--';
    if (els.humidity) els.humidity.textContent = '--';
    if (els.icon) els.icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
  };

  /**
   * Fetch weather by city name
   * @param {string} city - City name
   */
  const fetchByCity = async (city) => {
    const cacheKey = `launchpad_weather_${city.toLowerCase()}`;
    const cached = getCache(cacheKey, CACHE_TTL);
    if (cached) {
      updateUI(cached);
      return;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
      const data = await safeFetch(url);
      setCache(cacheKey, data);
      updateUI(data);
    } catch (e) {
      console.error('Weather fetch (city) failed:', e.message);
      showError('Weather unavailable');
    }
  };

  /**
   * Fetch weather by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  const fetchByCoords = async (lat, lon) => {
    const cacheKey = `launchpad_weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = getCache(cacheKey, CACHE_TTL);
    if (cached) {
      updateUI(cached);
      return;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const data = await safeFetch(url);
      setCache(cacheKey, data);
      updateUI(data);
    } catch (e) {
      console.error('Weather fetch (coords) failed:', e.message);
      showError('Weather unavailable');
    }
  };

  return {
    /**
     * Initialize weather — use saved location or geolocation fallback
     * @param {Object} config - App configuration
     */
    init(config) {
      cacheDOM();

      // Show loading state
      if (els.city) els.city.textContent = 'Loading...';

      const location = config.user?.location;
      if (location && location.trim()) {
        fetchByCity(location.trim());
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
          () => showError('Location access denied')
        );
      } else {
        showError('Geolocation not supported');
      }
    },

    /** Expose for settings panel refresh */
    fetchByCity,
    fetchByCoords,
  };
})();


/* =========================================================================
 * 6. TASKS MODULE
 * Task management with localStorage persistence and confetti celebration
 * ========================================================================= */

const Tasks = (() => {
  const STORAGE_KEY = 'launchpad_tasks';
  let tasks = [];

  const els = {};

  const cacheDOM = () => {
    els.input = document.getElementById('task-input');
    els.addBtn = document.getElementById('add-task-btn');
    els.list = document.getElementById('task-list');
    els.empty = document.getElementById('task-empty');
    els.count = document.getElementById('task-count');
  };

  /**
   * Load tasks from localStorage
   * @returns {Array} Array of task objects
   */
  const loadTasks = () => {
    try {
      tasks = JSON.parse(SafeStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      tasks = [];
    }
    return tasks;
  };

  /**
   * Save tasks array to localStorage
   */
  const saveTasks = () => {
    try {
      SafeStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks:', e.message);
    }
  };

  /**
   * Check if all tasks are done and fire confetti if so
   */
  const checkAllComplete = () => {
    if (tasks.length > 0 && tasks.every((t) => t.done)) {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  /**
   * Render the full task list into the DOM
   */
  const render = () => {
    if (!els.list) return;
    els.list.innerHTML = '';
    const frag = document.createDocumentFragment();

    tasks.forEach((task) => {
      const div = document.createElement('div');
      div.className = 'task-item';
      div.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.done;
      checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`);

      const span = document.createElement('span');
      span.className = `task-text${task.done ? ' done' : ''}`;
      span.textContent = task.text;

      const delBtn = document.createElement('button');
      delBtn.className = 'task-delete';
      delBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
      delBtn.innerHTML = '<i class="fas fa-trash"></i>';

      div.appendChild(checkbox);
      div.appendChild(span);
      div.appendChild(delBtn);
      frag.appendChild(div);
    });

    els.list.appendChild(frag);

    // Update count badge
    const doneCount = tasks.filter((t) => t.done).length;
    if (els.count) els.count.textContent = `${doneCount}/${tasks.length}`;

    // Empty state
    if (els.empty) {
      els.empty.classList.toggle('hidden', tasks.length > 0);
    }
  };

  /**
   * Add a new task
   * @param {string} text - Task description
   */
  const addTask = (text) => {
    if (!text || !text.trim()) return;
    tasks.push({
      id: generateId(),
      text: text.trim(),
      done: false,
      createdAt: Date.now(),
    });
    saveTasks();
    render();
    checkAllComplete();
  };

  return {
    /**
     * Initialize the tasks module
     */
    init() {
      cacheDOM();
      loadTasks();
      render();

      // Add task on Enter key
      els.input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          addTask(els.input.value);
          els.input.value = '';
        }
      });

      // Add task on button click
      els.addBtn?.addEventListener('click', () => {
        addTask(els.input?.value);
        if (els.input) els.input.value = '';
      });

      // Event Delegation for list interactions
      els.list?.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.task-delete');
        if (delBtn) {
          const id = delBtn.closest('.task-item')?.dataset.id;
          if (id) {
            tasks = tasks.filter((t) => t.id !== id);
            saveTasks();
            render();
          }
        }
      });

      els.list?.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
          const id = e.target.closest('.task-item')?.dataset.id;
          const task = tasks.find((t) => t.id === id);
          if (task) {
            task.done = e.target.checked;
            saveTasks();
            render();
            checkAllComplete();
          }
        }
      });
    },

    /** Expose for command palette */
    addTask,
  };
})();


/* =========================================================================
 * 7. QUOTE MODULE
 * Fetches inspirational quotes with caching and fallback
 * ========================================================================= */

const Quote = (() => {
  const CACHE_KEY = 'launchpad_quote';
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour

  const FALLBACK_QUOTES = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
    { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
    { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
    { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
    { text: 'Programs must be written for people to read.', author: 'Harold Abelson' },
    { text: 'Any fool can write code that a computer can understand.', author: 'Martin Fowler' },
    { text: 'Experience is the name everyone gives to their mistakes.', author: 'Oscar Wilde' },
  ];

  const els = {};

  const cacheDOM = () => {
    els.text = document.getElementById('quote-text');
    els.author = document.getElementById('quote-author');
    els.refresh = document.getElementById('refresh-quote');
  };

  /**
   * Render a quote in the UI
   * @param {string} text - Quote text
   * @param {string} author - Quote author
   */
  const render = (text, author) => {
    if (els.text) els.text.textContent = `"${text}"`;
    if (els.author) els.author.textContent = `— ${author}`;
  };

  /**
   * Pick a random fallback quote
   */
  const showFallback = () => {
    const q = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    render(q.text, q.author);
  };

  /**
   * Fetch a quote from the API
   * @param {boolean} bypassCache - If true, skip cache check
   */
  const fetchQuote = async (bypassCache = false) => {
    if (!bypassCache) {
      const cached = getCache(CACHE_KEY, CACHE_TTL);
      if (cached) {
        render(cached.text, cached.author);
        return;
      }
    }

    try {
      // Use DummyJSON quotes API (reliable, free, no key needed)
      const data = await safeFetch('https://dummyjson.com/quotes/random');
      if (data && data.quote && data.author) {
        const quote = { text: data.quote, author: data.author };
        setCache(CACHE_KEY, quote);
        render(quote.text, quote.author);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (e) {
      console.warn('Quote API failed, using fallback:', e.message);
      showFallback();
    }
  };

  return {
    /**
     * Initialize the quote module
     */
    init() {
      cacheDOM();
      fetchQuote();

      // Refresh button — bypass cache
      els.refresh?.addEventListener('click', () => fetchQuote(true));
    },
  };
})();


/* =========================================================================
 * 8. QUICK APPS MODULE
 * Configurable app launcher grid with add/delete functionality
 * ========================================================================= */

const QuickApps = (() => {
  const els = {};

  const cacheDOM = () => {
    els.grid = document.getElementById('apps-grid');
    els.addTrigger = document.getElementById('add-app-trigger');
    els.modal = document.getElementById('add-app-modal');
    els.nameInput = document.getElementById('app-name-input');
    els.urlInput = document.getElementById('app-url-input');
    els.saveBtn = document.getElementById('save-app-btn');
    els.cancelBtn = document.getElementById('cancel-app-btn');
    els.closeBtn = document.getElementById('close-app-modal');
  };

  /**
   * Get a CSS class based on icon name for app-specific coloring
   * @param {string} icon - Font Awesome icon class
   * @returns {string} CSS class name
   */
  const getAppClass = (icon) => {
    const map = {
      'fa-youtube': 'app-youtube',
      'fa-github': 'app-github',
      'fa-linkedin-in': 'app-linkedin',
      'fa-twitter': 'app-twitter',
      'fa-stack-overflow': 'app-stackoverflow',
      'fa-codepen': 'app-codepen',
      'fa-instagram': 'app-instagram',
      'fa-discord': 'app-discord',
      'fa-reddit': 'app-reddit',
      'fa-spotify': 'app-spotify',
    };
    return map[icon] || '';
  };

  /**
   * Close the add-app modal and clear inputs
   */
  const closeModal = () => {
    if (els.modal) els.modal.classList.add('hidden');
    if (els.nameInput) els.nameInput.value = '';
    if (els.urlInput) els.urlInput.value = '';
  };

  /**
   * Open the add-app modal
   */
  const openModal = () => {
    if (els.modal) els.modal.classList.remove('hidden');
    els.nameInput?.focus();
  };

  /**
   * Render the apps grid from config
   */
  const render = () => {
    if (!els.grid) return;
    els.grid.innerHTML = '';

    const apps = UserConfig.get('quickApps') || [];

    apps.forEach((app, index) => {
      const btn = document.createElement('button');
      btn.className = `app-btn ${getAppClass(app.icon)}`;
      btn.dataset.url = app.url;
      btn.title = app.name;

      // Icon element
      const iconDiv = document.createElement('div');
      iconDiv.className = 'app-btn-icon';

      if (app.brand) {
        // Font Awesome brand icon
        iconDiv.innerHTML = `<i class="fa-brands ${app.icon}"></i>`;
      } else if (app.icon === 'fa-globe') {
        // Custom app — use Google favicon service
        let domain = app.url;
        try {
          domain = new URL(app.url).hostname;
        } catch {
          domain = app.url.replace(/^https?:\/\//, '').split('/')[0];
        }
        iconDiv.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="${app.name}" style="width:24px;height:24px;border-radius:4px;" onerror="this.outerHTML='<i class=\\'fas fa-globe\\'></i>'">`;
      } else {
        iconDiv.innerHTML = `<i class="fas ${app.icon}"></i>`;
      }

      // Name
      const nameSpan = document.createElement('span');
      nameSpan.textContent = app.name;

      // Delete button
      const delDiv = document.createElement('div');
      delDiv.className = 'app-delete';
      delDiv.innerHTML = '<i class="fas fa-times"></i>';
      delDiv.setAttribute('aria-label', `Remove ${app.name}`);

      // Delete click handler
      delDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentApps = UserConfig.get('quickApps') || [];
        currentApps.splice(index, 1);
        UserConfig.set('quickApps', currentApps);
        render();
      });

      // App click handler — open URL
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.app-delete')) return;
        window.open(app.url, '_blank');
      });

      btn.appendChild(iconDiv);
      btn.appendChild(nameSpan);
      btn.appendChild(delDiv);
      els.grid.appendChild(btn);
    });

    // Add the "Add App" trigger button at the end
    if (els.addTrigger) {
      // Clone the trigger so it's always at the end of the grid
      const triggerClone = els.addTrigger.cloneNode(true);
      triggerClone.addEventListener('click', openModal);
      els.grid.appendChild(triggerClone);
    } else {
      // Create a fallback add button
      const addBtn = document.createElement('button');
      addBtn.className = 'app-btn add-app-trigger';
      addBtn.innerHTML = '<div class="app-btn-icon"><i class="fas fa-plus"></i></div><span>Add App</span>';
      addBtn.addEventListener('click', openModal);
      els.grid.appendChild(addBtn);
    }
  };

  return {
    /**
     * Initialize quick apps from config
     * @param {Object} config - App configuration
     */
    init(config) {
      cacheDOM();
      render();

      // Modal events
      els.saveBtn?.addEventListener('click', () => {
        const name = els.nameInput?.value?.trim();
        let url = els.urlInput?.value?.trim();

        if (!name || !url) return;

        // Auto-prepend protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        const apps = UserConfig.get('quickApps') || [];
        apps.push({ name, url, icon: 'fa-globe', brand: false });
        UserConfig.set('quickApps', apps);
        render();
        closeModal();
      });

      els.cancelBtn?.addEventListener('click', closeModal);
      els.closeBtn?.addEventListener('click', closeModal);

      // Close on backdrop click
      els.modal?.addEventListener('click', (e) => {
        if (e.target === els.modal) closeModal();
      });
    },

    /** Expose render for settings updates */
    render,
  };
})();


/* =========================================================================
 * 9. NEWS MODULE
 * Lazy-loaded tech news from GNews API with caching
 * ========================================================================= */

const News = (() => {
  const API_KEY = '2e93467a8694c2a2b82e1a6b560bd053';
  const CACHE_KEY = 'launchpad_news';
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  const FALLBACK_NEWS = [
    { title: 'AI Revolution: Large Language Models Transform Software Development', url: 'https://news.ycombinator.com' },
    { title: 'JavaScript Frameworks 2025: The State of the Ecosystem', url: 'https://dev.to' },
    { title: 'WebAssembly Gains Momentum in Server-Side Applications', url: 'https://techcrunch.com' },
    { title: 'Cybersecurity: Zero-Trust Architecture Becomes Standard', url: 'https://thehackernews.com' },
    { title: 'Quantum Computing: New Breakthroughs in Error Correction', url: 'https://www.theverge.com' },
  ];

  let fetched = false;
  const els = {};

  const cacheDOM = () => {
    els.list = document.getElementById('news-list');
    els.widget = document.getElementById('widget-news');
  };

  /**
   * Show skeleton loading items
   */
  const showSkeleton = () => {
    if (!els.list) return;
    els.list.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const li = document.createElement('li');
      li.className = 'skeleton';
      li.innerHTML = '<div class="skeleton-line"></div>';
      els.list.appendChild(li);
    }
  };

  /**
   * Render news articles into the list
   * @param {Array} articles - Array of { title, url }
   */
  const render = (articles) => {
    if (!els.list) return;
    els.list.innerHTML = '';

    articles.forEach((article) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = article.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = article.title;
      li.appendChild(a);
      els.list.appendChild(li);
    });
  };

  /**
   * Show fallback news on error
   */
  const showError = () => {
    render(FALLBACK_NEWS);
  };

  /**
   * Fetch tech news from the GNews API
   */
  const fetchNews = async () => {
    if (fetched) return;
    fetched = true;

    // Check cache first
    const cached = getCache(CACHE_KEY, CACHE_TTL);
    if (cached) {
      render(cached);
      return;
    }

    showSkeleton();

    try {
      const url = `https://gnews.io/api/v4/top-headlines?topic=technology&lang=en&country=us&max=5&apikey=${API_KEY}`;
      const data = await safeFetch(url);

      if (data.articles && data.articles.length > 0) {
        const articles = data.articles.map((a) => ({ title: a.title, url: a.url }));
        setCache(CACHE_KEY, articles);
        render(articles);
      } else {
        throw new Error('No articles found');
      }
    } catch (e) {
      console.warn('News fetch failed, using fallback:', e.message);
      showError();
    }
  };

  return {
    /**
     * Initialize the news module with lazy loading via IntersectionObserver
     */
    init() {
      cacheDOM();
      fetched = false;

      const target = els.widget || els.list?.closest('[data-widget]');
      if (!target) {
        // No widget wrapper found — fetch immediately
        fetchNews();
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              fetchNews();
              observer.unobserve(target);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(target);
    },
  };
})();


/* =========================================================================
 * 10. POMODORO MODULE
 * Focus timer with work/break cycles and SVG progress ring
 * ========================================================================= */

const Pomodoro = (() => {
  let WORK = 25 * 60; // 25 minutes
  let BREAK = 5 * 60; // 5 minutes
  const CIRCUMFERENCE = 2 * Math.PI * 54; // ~339.292

  let timeLeft = WORK;
  let isRunning = false;
  let isWork = true;
  let sessions = 0;
  let intervalId = null;

  const els = {};

  const cacheDOM = () => {
    els.time = document.getElementById('pomodoro-time');
    els.label = document.getElementById('pomodoro-label');
    els.progress = document.getElementById('pomodoro-progress');
    els.startBtn = document.getElementById('pomo-start');
    els.pauseBtn = document.getElementById('pomo-pause');
    els.resetBtn = document.getElementById('pomo-reset');
    els.sessions = document.getElementById('pomo-sessions');
  };

  /**
   * Update the pomodoro display (timer text + SVG progress ring)
   */
  const updateDisplay = () => {
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');

    if (els.time) els.time.textContent = `${mins}:${secs}`;

    // SVG stroke-dashoffset for progress ring
    if (els.progress) {
      const total = isWork ? WORK : BREAK;
      const elapsed = total - timeLeft;
      const offset = CIRCUMFERENCE - (elapsed / total) * CIRCUMFERENCE;
      els.progress.style.strokeDashoffset = offset;
    }

    if (els.label) els.label.textContent = isWork ? 'Focus' : 'Break';
    if (els.sessions) els.sessions.textContent = `Sessions: ${sessions}`;
  };

  /**
   * Handle each timer tick
   */
  const tick = () => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      // Switch modes
      if (isWork) {
        sessions++;
      }
      isWork = !isWork;
      timeLeft = isWork ? WORK : BREAK;
      updateDisplay();
      // Auto-start next session
      // (interval is already running)
    }
  };

  return {
    /**
     * Initialize the pomodoro timer
     */
    init() {
      // Clean up previous
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      cacheDOM();

      const config = UserConfig.current();
      if (config.pomodoro && config.pomodoro.focus) {
        WORK = config.pomodoro.focus * 60;
      }
      if (config.pomodoro && config.pomodoro.break) {
        BREAK = config.pomodoro.break * 60;
      }

      timeLeft = WORK;
      isRunning = false;
      isWork = true;
      updateDisplay();

      // Bind controls
      els.startBtn?.addEventListener('click', () => this.start());
      els.pauseBtn?.addEventListener('click', () => this.pause());
      els.resetBtn?.addEventListener('click', () => this.reset());
    },

    /**
     * Start the pomodoro timer
     */
    start() {
      if (isRunning) return;
      isRunning = true;

      if (els.startBtn) els.startBtn.style.display = 'none';
      if (els.pauseBtn) els.pauseBtn.style.display = '';

      intervalId = setInterval(tick, 1000);
    },

    /**
     * Pause the pomodoro timer
     */
    pause() {
      if (!isRunning) return;
      isRunning = false;

      clearInterval(intervalId);
      intervalId = null;

      if (els.startBtn) els.startBtn.style.display = '';
      if (els.pauseBtn) els.pauseBtn.style.display = 'none';
    },

    /**
     * Reset the pomodoro timer to work mode
     */
    reset() {
      this.pause();
      timeLeft = WORK;
      isWork = true;
      updateDisplay();
    },
  };
})();


/* =========================================================================
 * 11. GITHUB MODULE
 * Displays a GitHub contribution grid (last 16 weeks)
 * ========================================================================= */

const GitHub = (() => {
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour
  let username = '';
  let fetched = false;

  const els = {};

  const cacheDOM = () => {
    els.grid = document.getElementById('gh-grid');
    els.stats = document.getElementById('gh-stats');
    els.username = document.getElementById('gh-username');
    els.error = document.getElementById('gh-error');
    els.widget = document.getElementById('widget-github');
  };

  /**
   * Map a contribution count to a level (0–4)
   * @param {number} count - Number of contributions
   * @returns {number} Level 0-4
   */
  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  /**
   * Render the contribution grid
   * @param {Object} data - GitHub contributions API response
   */
  const render = (data) => {
    if (!els.grid) return;
    els.grid.innerHTML = '';

    // Hide error, show grid
    if (els.error) els.error.classList.add('hidden');
    els.grid.classList.remove('hidden');

    // Parse contributions — API returns { contributions: [ { date, count, ... }, ... ] }
    let contributions = [];
    if (data.contributions && Array.isArray(data.contributions)) {
      contributions = data.contributions;
    }

    // Take the last 112 days (16 weeks × 7 days)
    const last112 = contributions.slice(-112);

    // Pad to exactly 112 if we have fewer
    while (last112.length < 112) {
      last112.unshift({ date: '', count: 0 });
    }

    // Build grid: 16 columns × 7 rows, column-major order
    // Each column is one week, rows are days (Mon–Sun)
    let totalContributions = 0;

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 16; col++) {
        const index = col * 7 + row;
        const day = last112[index] || { count: 0 };
        const count = day.count || 0;
        totalContributions += count;

        const cell = document.createElement('div');
        cell.className = `gh-cell level-${getLevel(count)}`;
        cell.title = day.date ? `${day.date}: ${count} contributions` : `${count} contributions`;
        els.grid.appendChild(cell);
      }
    }

    // Update stats
    if (els.stats) {
      els.stats.textContent = `${totalContributions} contributions in the last 16 weeks`;
    }
  };

  /**
   * Show the error state
   */
  const showError = () => {
    if (els.error) els.error.classList.remove('hidden');
    if (els.grid) els.grid.classList.add('hidden');
    if (els.stats) els.stats.textContent = '';
  };

  /**
   * Fetch contributions for a username
   * @param {string} user - GitHub username
   */
  const fetchContributions = async (user) => {
    if (!user) {
      showError();
      return;
    }

    const cacheKey = `launchpad_github_${user.toLowerCase()}`;
    const cached = getCache(cacheKey, CACHE_TTL);
    if (cached) {
      render(cached);
      return;
    }

    try {
      const url = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`;
      const data = await safeFetch(url);
      setCache(cacheKey, data);
      render(data);
    } catch (e) {
      console.error('GitHub contributions fetch failed:', e.message);
      showError();
    }
  };

  return {
    /**
     * Initialize the GitHub module with lazy loading
     * @param {Object} config - App configuration
     */
    init(config) {
      cacheDOM();
      fetched = false;
      username = config.user?.githubUsername || '';

      if (els.username) els.username.textContent = username ? `@${username}` : 'No username set';

      const target = els.widget;
      if (!target) {
        fetchContributions(username);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !fetched) {
              fetched = true;
              fetchContributions(username);
              observer.unobserve(target);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(target);
    },

    /** Expose for settings panel updates */
    refresh(newUsername) {
      username = newUsername;
      fetched = false;
      if (els.username) els.username.textContent = newUsername ? `@${newUsername}` : 'No username set';
      // Clear cache for this user
      fetchContributions(newUsername);
    },
  };
})();


/* =========================================================================
 * 12. GOALS MODULE
 * Daily goals tracker with progress bar
 * ========================================================================= */

const Goals = (() => {
  const STORAGE_KEY = 'launchpad_goals';
  let goals = [];

  const els = {};

  const cacheDOM = () => {
    els.input = document.getElementById('goal-input');
    els.addBtn = document.getElementById('add-goal-btn');
    els.list = document.getElementById('goal-list');
    els.progress = document.getElementById('goals-progress');
    els.progressFill = document.getElementById('goal-progress-fill');
  };

  /**
   * Get today's date as YYYY-MM-DD
   * @returns {string}
   */
  const todayStr = () => new Date().toISOString().slice(0, 10);

  /**
   * Load goals from localStorage
   */
  const loadGoals = () => {
    try {
      goals = JSON.parse(SafeStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      goals = [];
    }
  };

  /**
   * Save goals to localStorage
   */
  const saveGoals = () => {
    try {
      SafeStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.warn('Failed to save goals:', e.message);
    }
  };

  /**
   * Render today's goals into the DOM
   */
  const render = () => {
    if (!els.list) return;
    els.list.innerHTML = '';
    const frag = document.createDocumentFragment();

    const today = todayStr();
    const todayGoals = goals.filter((g) => g.date === today);

    todayGoals.forEach((goal) => {
      const div = document.createElement('div');
      div.className = 'task-item';
      div.dataset.id = goal.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = goal.done;
      checkbox.setAttribute('aria-label', `Mark goal "${goal.text}" as ${goal.done ? 'incomplete' : 'complete'}`);

      const span = document.createElement('span');
      span.className = `task-text${goal.done ? ' done' : ''}`;
      span.textContent = goal.text;

      const delBtn = document.createElement('button');
      delBtn.className = 'task-delete';
      delBtn.setAttribute('aria-label', `Delete goal: ${goal.text}`);
      delBtn.innerHTML = '<i class="fas fa-trash"></i>';

      div.appendChild(checkbox);
      div.appendChild(span);
      div.appendChild(delBtn);
      frag.appendChild(div);
    });

    els.list.appendChild(frag);

    // Update progress
    const doneCount = todayGoals.filter((g) => g.done).length;
    const total = todayGoals.length;

    if (els.progress) els.progress.textContent = `${doneCount}/${total}`;
    if (els.progressFill) {
      const pct = total > 0 ? (doneCount / total) * 100 : 0;
      els.progressFill.style.width = `${pct}%`;
    }
  };

  /**
   * Add a new goal for today
   * @param {string} text - Goal description
   */
  const addGoal = (text) => {
    if (!text || !text.trim()) return;
    goals.push({
      id: generateId(),
      text: text.trim(),
      done: false,
      date: todayStr(),
    });
    saveGoals();
    render();
  };

  return {
    /**
     * Initialize the goals module
     */
    init() {
      cacheDOM();
      loadGoals();
      render();

      // Add goal on Enter key
      els.input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          addGoal(els.input.value);
          els.input.value = '';
        }
      });

      // Add goal on button click
      els.addBtn?.addEventListener('click', () => {
        addGoal(els.input?.value);
        if (els.input) els.input.value = '';
      });

      // Event Delegation
      els.list?.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.task-delete');
        if (delBtn) {
          const id = delBtn.closest('.task-item')?.dataset.id;
          if (id) {
            goals = goals.filter((g) => g.id !== id);
            saveGoals();
            render();
          }
        }
      });

      els.list?.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
          const id = e.target.closest('.task-item')?.dataset.id;
          const goal = goals.find((g) => g.id === id);
          if (goal) {
            goal.done = e.target.checked;
            saveGoals();
            render();
          }
        }
      });
    },
  };
})();


/* =========================================================================
 * 13. NOTES MODULE
 * Simple textarea notepad with auto-save and character count
 * ========================================================================= */

const Notes = (() => {
  const STORAGE_KEY = 'launchpad_notes';

  const els = {};

  const cacheDOM = () => {
    els.area = document.getElementById('notes-area');
    els.chars = document.getElementById('note-chars');
  };

  /**
   * Update the character count display
   */
  const updateCharCount = () => {
    if (els.chars && els.area) {
      els.chars.textContent = `${els.area.value.length} chars`;
    }
  };

  /**
   * Save the note content to localStorage (debounced handler)
   */
  const saveNote = debounce(() => {
    try {
      SafeStorage.setItem(STORAGE_KEY, els.area?.value || '');
    } catch (e) {
      console.warn('Failed to save notes:', e.message);
    }
  }, 500);

  return {
    /**
     * Initialize the notes module
     */
    init() {
      cacheDOM();
      if (!els.area) return;

      // Load saved note safely
      const saved = SafeStorage.getItem(STORAGE_KEY) || '';
      if (els.area) {
        els.area.value = saved;
      }
      updateCharCount();

      // Auto-save on input
      els.area?.addEventListener('input', () => {
        updateCharCount();
        saveNote();
      });
    },
  };
})();


/* =========================================================================
 * 14. CALENDAR MODULE
 * Interactive monthly calendar with navigation
 * ========================================================================= */

const Calendar = (() => {
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const els = {};

  const cacheDOM = () => {
    els.days = document.getElementById('cal-days');
    els.monthYear = document.getElementById('cal-month-year');
    els.prev = document.getElementById('cal-prev');
    els.next = document.getElementById('cal-next');
  };

  /**
   * Render the calendar grid for the current month/year
   */
  const render = () => {
    if (!els.days) return;
    els.days.innerHTML = '';

    // Update header label
    if (els.monthYear) {
      els.monthYear.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    }

    const today = new Date();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'cal-day other-month';
      cell.textContent = daysInPrevMonth - i;
      els.days.appendChild(cell);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day';

      // Highlight today
      if (
        d === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
      ) {
        cell.classList.add('today');
      }

      cell.textContent = d;
      els.days.appendChild(cell);
    }

    // Next month leading days to fill the grid (up to 42 cells = 6 rows)
    const totalCells = els.days.children.length;
    const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (let i = 1; i <= remaining; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day other-month';
      cell.textContent = i;
      els.days.appendChild(cell);
    }
  };

  return {
    /**
     * Initialize the calendar module
     */
    init() {
      cacheDOM();
      currentMonth = new Date().getMonth();
      currentYear = new Date().getFullYear();
      render();

      // Navigation
      els.prev?.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        render();
      });

      els.next?.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        render();
      });
    },
  };
})();


/* =========================================================================
 * 15. FOCUS MODE MODULE
 * Distraction-free overlay mode
 * ========================================================================= */

const FocusMode = (() => {
  let active = false;

  const els = {};

  const cacheDOM = () => {
    els.toggleBtn = document.getElementById('focus-toggle');
    els.overlay = document.getElementById('focus-overlay');
    els.exitBtn = document.getElementById('exit-focus');
  };

  /**
   * Enter focus mode
   */
  const enter = () => {
    active = true;
    document.body.classList.add('focus-active');
    if (els.overlay) els.overlay.classList.remove('hidden');
    if (els.toggleBtn) els.toggleBtn.textContent = 'Exit Focus';
  };

  /**
   * Exit focus mode
   */
  const exit = () => {
    active = false;
    document.body.classList.remove('focus-active');
    if (els.overlay) els.overlay.classList.add('hidden');
    if (els.toggleBtn) els.toggleBtn.textContent = 'Focus Mode';
  };

  return {
    /**
     * Initialize the focus mode module
     */
    init() {
      cacheDOM();

      els.toggleBtn?.addEventListener('click', () => this.toggle());
      els.exitBtn?.addEventListener('click', exit);
    },

    /**
     * Toggle focus mode on/off
     */
    toggle() {
      if (active) {
        exit();
      } else {
        enter();
      }
    },
  };
})();


/* =========================================================================
 * 16. COMMAND PALETTE MODULE
 * Ctrl+K powered command launcher with fuzzy search
 * ========================================================================= */

const CommandPalette = (() => {
  let activeIndex = -1;
  let filteredCommands = [];

  const els = {};

  const cacheDOM = () => {
    els.palette = document.getElementById('command-palette');
    els.input = document.getElementById('cmd-input');
    els.results = document.getElementById('cmd-results');
  };

  /**
   * Build the full list of commands, including dynamic quick app entries
   * @returns {Array} Command definitions
   */
  const buildCommands = () => {
    const commands = [
      {
        name: 'Search Google',
        icon: 'fa-search',
        action: () => {
          const el = document.getElementById('search-input');
          if (el) el.focus();
        },
      },
      {
        name: 'Toggle Theme',
        icon: 'fa-moon',
        action: () => ThemeManager.toggle(),
      },
      {
        name: 'Open Settings',
        icon: 'fa-cog',
        action: () => SettingsPanel.open(),
      },
      {
        name: 'Toggle Focus Mode',
        icon: 'fa-crosshairs',
        action: () => FocusMode.toggle(),
      },
      {
        name: 'Start Pomodoro',
        icon: 'fa-play',
        action: () => Pomodoro.start(),
      },
      {
        name: 'Reset Pomodoro',
        icon: 'fa-rotate-left',
        action: () => Pomodoro.reset(),
      },
      {
        name: 'New Task',
        icon: 'fa-plus',
        action: () => {
          const el = document.getElementById('task-input');
          if (el) el.focus();
        },
      },
      {
        name: 'Export Settings',
        icon: 'fa-download',
        action: () => UserConfig.exportData(),
      },
      {
        name: 'Reset Dashboard',
        icon: 'fa-trash-alt',
        action: () => {
          if (confirm('Are you sure you want to reset the entire dashboard? All data will be lost.')) {
            UserConfig.reset();
          }
        },
      },
    ];

    // Dynamically add quick apps as commands
    const apps = UserConfig.get('quickApps') || [];
    apps.forEach((app) => {
      commands.push({
        name: `Open ${app.name}`,
        icon: app.brand ? app.icon : 'fa-globe',
        isBrand: app.brand,
        action: () => window.open(app.url, '_blank'),
      });
    });

    return commands;
  };

  /**
   * Render a list of commands into the results container
   * @param {Array} commands - Commands to render
   */
  const render = (commands) => {
    if (!els.results) return;
    els.results.innerHTML = '';
    filteredCommands = commands;
    activeIndex = -1;

    commands.forEach((cmd, i) => {
      const div = document.createElement('div');
      div.className = 'cmd-item';
      div.dataset.index = i;

      const iconPrefix = cmd.isBrand ? 'fa-brands' : 'fas';
      div.innerHTML = `<i class="${iconPrefix} ${cmd.icon}"></i><span>${cmd.name}</span>`;

      div.addEventListener('click', () => {
        cmd.action();
        close();
      });

      // Hover sets active
      div.addEventListener('mouseenter', () => {
        setActive(i);
      });

      els.results.appendChild(div);
    });
  };

  /**
   * Set the active (highlighted) command index
   * @param {number} index - Command index
   */
  const setActive = (index) => {
    const items = els.results?.querySelectorAll('.cmd-item') || [];
    items.forEach((item) => item.classList.remove('active'));

    activeIndex = index;
    if (index >= 0 && index < items.length) {
      items[index].classList.add('active');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  /**
   * Filter commands by search query
   * @param {string} query - Search query
   */
  const search = (query) => {
    const all = buildCommands();
    if (!query.trim()) {
      render(all);
      return;
    }
    const q = query.toLowerCase();
    const matches = all.filter((cmd) => cmd.name.toLowerCase().includes(q));
    render(matches);
  };

  /**
   * Close the command palette
   */
  const close = () => {
    if (els.palette) els.palette.classList.add('hidden');
    if (els.input) els.input.value = '';
    activeIndex = -1;
    filteredCommands = [];
  };

  return {
    /**
     * Initialize the command palette
     */
    init() {
      cacheDOM();

      // Global Ctrl+K shortcut
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
          e.preventDefault();
          this.open();
        }
      });

      // Input search filtering
      els.input?.addEventListener('input', () => {
        search(els.input.value);
      });

      // Keyboard navigation within palette
      els.input?.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (activeIndex < filteredCommands.length - 1) {
            setActive(activeIndex + 1);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (activeIndex > 0) {
            setActive(activeIndex - 1);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < filteredCommands.length) {
            filteredCommands[activeIndex].action();
            close();
          }
        } else if (e.key === 'Escape') {
          close();
        }
      });

      // Click outside to close
      els.palette?.addEventListener('click', (e) => {
        if (e.target === els.palette) close();
      });
    },

    /**
     * Open the command palette
     */
    open() {
      if (!els.palette) return;
      els.palette.classList.remove('hidden');
      els.input?.focus();
      render(buildCommands());
    },

    /**
     * Close the command palette (exposed for global shortcuts)
     */
    close() {
      close();
    },
  };
})();


/* =========================================================================
 * 17. SETTINGS PANEL MODULE
 * Configuration drawer with live preview
 * ========================================================================= */

const SettingsPanel = (() => {
  const els = {};

  /** Debounced GitHub username validator */
  let ghValidateTimer = null;

  const cacheDOM = () => {
    els.panel = document.getElementById('settings-panel');
    els.closeBtn = document.getElementById('settings-close');
    els.trigger = document.getElementById('settings-trigger');

    // Profile inputs
    els.nameInput = document.getElementById('setting-name');
    els.githubInput = document.getElementById('setting-github');
    els.leetcodeInput = document.getElementById('setting-leetcode');
    els.locationInput = document.getElementById('setting-location');
    els.useGeoBtn = document.getElementById('setting-use-geo');
    els.ghValidation = document.getElementById('gh-validation');

    // Theme controls
    els.themeDark = document.getElementById('setting-theme-dark');
    els.themeLight = document.getElementById('setting-theme-light');
    els.accentOptions = els.panel ? els.panel.querySelectorAll('.accent-option') : [];
    els.customAccent = document.getElementById('custom-accent');

    // Widget toggles
    els.widgetToggles = els.panel ? els.panel.querySelectorAll('.widget-toggle') : [];

    // Data management buttons
    els.exportBtn = document.getElementById('export-btn');
    els.importBtn = document.getElementById('import-btn');
    els.importFile = document.getElementById('import-file');
    els.resetBtn = document.getElementById('reset-btn');
  };

  /**
   * Populate all settings fields from the current config
   */
  const populateFields = () => {
    const config = UserConfig.current();

    if (els.nameInput) els.nameInput.value = config.user.name || '';
    if (els.githubInput) els.githubInput.value = config.user.githubUsername || '';
    if (els.leetcodeInput) els.leetcodeInput.value = config.user.leetcodeUsername || '';
    if (els.locationInput) els.locationInput.value = config.user.location || '';

    // Theme buttons
    const currentMode = config.theme.mode;
    if (els.themeDark) els.themeDark.classList.toggle('active', currentMode === 'dark');
    if (els.themeLight) els.themeLight.classList.toggle('active', currentMode === 'light');

    // Accent swatches
    const currentAccent = config.theme.accent;
    els.accentOptions.forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.accent === currentAccent);
    });
    if (els.customAccent) els.customAccent.value = currentAccent;

    // Widget toggles
    els.widgetToggles.forEach((toggle) => {
      const key = toggle.dataset.widget;
      if (key && config.widgets[key]) {
        toggle.checked = config.widgets[key].visible;
      }
    });
  };

  /**
   * Validate a GitHub username by checking the API
   * @param {string} username - GitHub username to validate
   */
  const validateGitHub = async (username) => {
    if (!username.trim()) {
      if (els.ghValidation) {
        els.ghValidation.textContent = '';
        els.ghValidation.className = '';
      }
      return;
    }

    if (els.ghValidation) {
      els.ghValidation.textContent = 'Checking...';
      els.ghValidation.className = 'validating';
    }

    try {
      await safeFetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
      if (els.ghValidation) {
        els.ghValidation.textContent = '✓ Valid username';
        els.ghValidation.className = 'valid';
      }
    } catch (e) {
      if (els.ghValidation) {
        els.ghValidation.textContent = '✗ User not found';
        els.ghValidation.className = 'invalid';
      }
    }
  };

  /** Debounced save for profile inputs */
  const debouncedSave = debounce((path, value, refreshFn) => {
    UserConfig.set(path, value);
    if (refreshFn) refreshFn();
  }, 300);

  return {
    /**
     * Initialize the settings panel
     */
    init() {
      cacheDOM();

      // Open/close
      els.trigger?.addEventListener('click', () => this.open());
      els.closeBtn?.addEventListener('click', () => this.close());

      // Click outside panel to close (on the overlay)
      els.panel?.addEventListener('click', (e) => {
        if (e.target === els.panel) this.close();
      });

      // Profile: name
      els.nameInput?.addEventListener('input', () => {
        debouncedSave('user.name', els.nameInput.value.trim(), () => {
          Greeting.init(UserConfig.current());
        });
      });

      // Profile: GitHub username with validation
      els.githubInput?.addEventListener('input', () => {
        const val = els.githubInput.value.trim();
        debouncedSave('user.githubUsername', val, () => {
          GitHub.refresh(val);
        });

        // Debounced validation
        clearTimeout(ghValidateTimer);
        ghValidateTimer = setTimeout(() => validateGitHub(val), 800);
      });

      // Profile: LeetCode username
      els.leetcodeInput?.addEventListener('input', () => {
        debouncedSave('user.leetcodeUsername', els.leetcodeInput.value.trim());
      });

      // Profile: Location
      els.locationInput?.addEventListener('blur', () => {
        const val = els.locationInput.value.trim();
        UserConfig.set('user.location', val);
        if (val) Weather.fetchByCity(val);
      });

      // Geolocation button in settings
      els.useGeoBtn?.addEventListener('click', () => {
        if (!navigator.geolocation) {
          alert('Geolocation is not supported.');
          return;
        }
        els.useGeoBtn.textContent = 'Detecting...';
        els.useGeoBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              const data = await safeFetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                { headers: { 'Accept-Language': 'en' } }
              );
              const city =
                data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                data.address?.state ||
                '';

              if (els.locationInput && city) {
                els.locationInput.value = city;
                UserConfig.set('user.location', city);
                Weather.fetchByCity(city);
              }
            } catch (e) {
              console.warn('Reverse geocode failed:', e.message);
            }
            els.useGeoBtn.textContent = 'Use My Location';
            els.useGeoBtn.disabled = false;
          },
          () => {
            els.useGeoBtn.textContent = 'Use My Location';
            els.useGeoBtn.disabled = false;
          }
        );
      });

      // Theme mode buttons
      els.themeDark?.addEventListener('click', () => {
        ThemeManager.setMode('dark');
        if (els.themeDark) els.themeDark.classList.add('active');
        if (els.themeLight) els.themeLight.classList.remove('active');
      });

      els.themeLight?.addEventListener('click', () => {
        ThemeManager.setMode('light');
        if (els.themeLight) els.themeLight.classList.add('active');
        if (els.themeDark) els.themeDark.classList.remove('active');
      });

      // Accent swatches
      els.accentOptions.forEach((opt) => {
        opt.addEventListener('click', () => {
          const color = opt.dataset.accent;
          if (color) {
            ThemeManager.setAccent(color);
            els.accentOptions.forEach((o) => o.classList.remove('active'));
            opt.classList.add('active');
            if (els.customAccent) els.customAccent.value = color;
          }
        });
      });

      // Custom color picker
      els.customAccent?.addEventListener('input', () => {
        ThemeManager.setAccent(els.customAccent.value);
        els.accentOptions.forEach((o) => o.classList.remove('active'));
      });

      // Widget toggles
      els.widgetToggles.forEach((toggle) => {
        toggle.addEventListener('change', () => {
          const key = toggle.dataset.widget;
          if (!key) return;
          UserConfig.set(`widgets.${key}.visible`, toggle.checked);

          // Show/hide the widget in the DOM
          const widget = document.querySelector(`#bento-grid [data-widget="${key}"]`);
          if (widget) widget.classList.toggle('hidden', !toggle.checked);
        });
      });

      // Export
      els.exportBtn?.addEventListener('click', () => UserConfig.exportData());

      // Import
      els.importBtn?.addEventListener('click', () => els.importFile?.click());

      els.importFile?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          UserConfig.importData(evt.target.result);
        };
        reader.readAsText(file);

        // Reset the input so the same file can be re-imported
        e.target.value = '';
      });

      // Reset
      els.resetBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset everything? All data will be lost.')) {
          UserConfig.reset();
        }
      });
    },

    /**
     * Open the settings panel
     */
    open() {
      if (els.panel) els.panel.classList.remove('hidden');
      populateFields();
    },

    /**
     * Close the settings panel
     */
    close() {
      if (els.panel) els.panel.classList.add('hidden');
    },
  };
})();


/* =========================================================================
 * 18. DRAG & DROP MODULE
 * Uses Sortable.js for widget reordering with persistence
 * ========================================================================= */

const DragDrop = (() => {
  let sortableInstance = null;

  return {
    /**
     * Initialize Sortable.js on the bento grid
     */
    init() {
      const grid = document.getElementById('bento-grid');
      if (!grid || typeof Sortable === 'undefined') return;

      sortableInstance = new Sortable(grid, {
        animation: 300,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.widget-header',
        forceFallback: true,
        onEnd: () => {
          const order = Array.from(grid.children).map((child) => child.id || child.dataset.widget || '');
          UserConfig.set('layoutOrder', order);
        },
      });
    },

    /**
     * Restore the saved layout order from config
     */
    restoreOrder() {
      const grid = document.getElementById('bento-grid');
      if (!grid) return;

      const order = UserConfig.get('layoutOrder') || [];
      if (!order.length) return;

      order.forEach((id) => {
        const el = document.getElementById(id) || grid.querySelector(`[data-widget="${id}"]`);
        if (el) grid.appendChild(el);
      });
    },
  };
})();


/* =========================================================================
 * 19. GREETING MODULE
 * Time-based personalized greeting
 * ========================================================================= */

const Greeting = (() => {
  return {
    /**
     * Set the greeting text based on time of day
     * @param {Object} config - App configuration
     */
    init(config) {
      const el = document.getElementById('greeting');
      if (!el) return;

      const hour = new Date().getHours();
      const name = config.user?.name || 'Developer';

      let greeting;
      if (hour < 12) {
        greeting = `Good morning, ${name}`;
      } else if (hour < 17) {
        greeting = `Good afternoon, ${name}`;
      } else if (hour < 21) {
        greeting = `Good evening, ${name}`;
      } else {
        greeting = `Good night, ${name}`;
      }

      el.textContent = greeting;
    },
  };
})();


/* =========================================================================
 * 20. VOICE SEARCH MODULE
 * Web Speech API integration with feature detection
 * ========================================================================= */

const VoiceSearch = (() => {
  let recognition = null;

  return {
    /**
     * Initialize voice search with SpeechRecognition API
     */
    init() {
      const voiceBtn = document.getElementById('voice-btn');
      const searchInput = document.getElementById('search-input');

      if (!voiceBtn) return;

      // Feature detection
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        voiceBtn.style.display = 'none';
        return;
      }

      recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      voiceBtn.addEventListener('click', () => {
        try {
          recognition.start();
          voiceBtn.classList.add('voice-pulse');
        } catch (e) {
          console.warn('Voice recognition start failed:', e.message);
        }
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (searchInput) {
          searchInput.value = transcript;
          // Auto-search
          const query = transcript.trim();
          if (query) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
          }
        }
        voiceBtn.classList.remove('voice-pulse');
      };

      recognition.onend = () => {
        voiceBtn.classList.remove('voice-pulse');
      };

      recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        voiceBtn.classList.remove('voice-pulse');
      };
    },
  };
})();


/* =========================================================================
 * GOOGLE SEARCH MODULE
 * Search bar functionality
 * ========================================================================= */

const GoogleSearch = (() => {
  return {
    /**
     * Initialize the search bar
     */
    init() {
      const searchBtn = document.getElementById('search-btn');
      const searchInput = document.getElementById('search-input');

      const performSearch = () => {
        const query = searchInput?.value?.trim();
        if (query) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        }
      };

      searchBtn?.addEventListener('click', performSearch);
      searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
      });
    },
  };
})();


/* =========================================================================
 * APP — MAIN ORCHESTRATOR
 * Initializes all modules in the correct order
 * ========================================================================= */

const App = {
  /**
   * Entry point — load config and decide on onboarding or dashboard
   */
  init() {
    const config = UserConfig.load();

    if (!config.onboardingComplete) {
      const loader = document.getElementById('app-loader');
      if (loader) loader.classList.add('hidden');
      Onboarding.init();
      return; // Don't init dashboard yet — onboarding will call launchDashboard on completion
    }

    this.launchDashboard(config);
  },

  /**
   * Launch the full dashboard with all widgets initialized
   * @param {Object} config - App configuration
   */
  launchDashboard(config) {
    // Hide onboarding wizard if still visible
    const wizard = document.getElementById('onboarding-wizard');
    if (wizard) wizard.classList.add('hidden');

    // Apply theme
    ThemeManager.init(config);

    // Apply widget visibility from config
    this.applyWidgetVisibility(config);

    // ── Initialize all widget modules ──
    Greeting.init(config);
    Clock.init();
    Weather.init(config);
    Tasks.init();
    Quote.init();
    QuickApps.init(config);
    News.init();           // lazy loaded via IntersectionObserver
    Pomodoro.init();
    GitHub.init(config);   // lazy loaded via IntersectionObserver
    Goals.init();
    Notes.init();
    Calendar.init();
    FocusMode.init();

    // ── Initialize UI systems ──
    CommandPalette.init();
    SettingsPanel.init();
    DragDrop.init();
    DragDrop.restoreOrder();

    // ── Initialize search & voice ──
    GoogleSearch.init();
    VoiceSearch.init();

    // ── Keyboard shortcuts ──
    this.bindGlobalShortcuts();

    // ── Show the app with a brief loader transition ──
    const loader = document.getElementById('app-loader');
    const app = document.getElementById('app');

    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      if (app) app.classList.remove('hidden');
    }, 800);
  },

  /**
   * Show/hide widgets based on config visibility settings
   * @param {Object} config - App configuration
   */
  applyWidgetVisibility(config) {
    if (!config.widgets) return;
    Object.entries(config.widgets).forEach(([key, val]) => {
      const widget = document.querySelector(`#bento-grid [data-widget="${key}"]`);
      if (widget) widget.classList.toggle('hidden', !val.visible);
    });
  },

  /**
   * Bind global keyboard shortcuts
   */
  bindGlobalShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K → open command palette
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        CommandPalette.open();
      }

      // Ctrl+D → toggle theme
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        ThemeManager.toggle();
      }

      // Ctrl+N → focus task input
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        const taskInput = document.getElementById('task-input');
        if (taskInput) taskInput.focus();
      }

      // Ctrl+F → toggle focus mode (ONLY when not in an input/textarea)
      if (e.ctrlKey && e.key === 'f' && !e.shiftKey) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          FocusMode.toggle();
        }
        // Otherwise, let the browser's native find work
      }

      // Escape → close all overlays
      if (e.key === 'Escape') {
        CommandPalette.close();
        SettingsPanel.close();
        // Close any open modal overlays
        document.querySelectorAll('.modal-overlay:not(.hidden)').forEach((m) => {
          m.classList.add('hidden');
        });
      }
    });
  },
};


/* =========================================================================
 * ENTRY POINT
 * ========================================================================= */

document.addEventListener('DOMContentLoaded', () => App.init());
