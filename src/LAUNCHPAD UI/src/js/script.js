/*=========================================================================
====================== Main javascript ==================================
============================================================================*/

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('fade-out');
    const content = document.getElementById('content');
    if (content) content.style.opacity = '1';
  }, 1500);

  initializePage();
});

function initializePage() {
  // ================== Dark Mode Toggle ==================
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    const moonIcon = darkModeToggle.querySelector('i');

    function applyDarkMode(state) {
      document.documentElement.classList.toggle('dark-theme', state);
      if (moonIcon) {
        moonIcon.classList.toggle('fa-moon', !state);
        moonIcon.classList.toggle('fa-sun', state);
      }
    }

    const savedMode = localStorage.getItem('darkMode') === 'true';
    applyDarkMode(savedMode);

    darkModeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark-theme');
      applyDarkMode(isDark);
      localStorage.setItem('darkMode', isDark);
    });
  }

  // ================== Keyboard Shortcuts ==================
  document.addEventListener('keydown', (e) => {
    // Ctrl+K: Focus search
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const search = document.getElementById('google-search');
      if (search) search.focus();
    }

    // Ctrl+D: Toggle dark mode
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      if (darkModeToggle) darkModeToggle.click();
    }

    // Ctrl+N: Focus task input
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      const taskInput = document.getElementById('main-task-input');
      if (taskInput) taskInput.focus();
    }

    // Ctrl+1-9: Scroll to specific cards
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const cardNum = parseInt(e.key);
      const card = document.getElementById(`card${cardNum}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.animation = 'none';
        setTimeout(() => {
          card.style.animation = 'cardHighlight 0.6s ease';
        }, 10);
      }
    }
  });

  // ================== Google Search ==================
  const searchBtn = document.getElementById('search-button');
  const searchInput = document.getElementById('google-search');

  function performSearch() {
    const query = searchInput.value.trim();
    if (query) window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  }

  if (searchBtn) searchBtn.addEventListener('click', performSearch);
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  // ================== Voice Search ==================
  const voiceBtn = document.getElementById("voice-btn");

  if (voiceBtn) {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      voiceBtn.addEventListener("click", () => {
        recognition.start();
        voiceBtn.classList.add('voice-pulse');
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (searchInput) searchInput.value = transcript;
        performSearch();
        voiceBtn.classList.remove('voice-pulse');
      };

      recognition.onend = () => {
        voiceBtn.classList.remove('voice-pulse');
      };

      recognition.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
        voiceBtn.classList.remove('voice-pulse');
      };
    } else {
      voiceBtn.style.display = "none";
    }
  }

  // ================== Time & Date ==================
  function updateDateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const time = `${hours}:${minutes} ${ampm}`;
    const date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;

    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    if (timeEl) timeEl.textContent = time;
    if (dateEl) dateEl.textContent = date;
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // ================== Daily Quote ==================
  const fallbackQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Stay hungry, stay foolish. - Steve Jobs",
    "Code is like humor. When you have to explain it, it's bad. - Cory House",
    "First, solve the problem. Then, write the code. - John Johnson",
    "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
    "Knowledge is power. - Francis Bacon",
    "Simplicity is the soul of efficiency. - Austin Freeman",
    "Make it work, make it right, make it fast. - Kent Beck",
    "The best way to predict the future is to invent it. - Alan Kay"
  ];

  fetch('https://api.quotable.io/random')
    .then(res => {
      if (!res.ok) throw new Error('API Error');
      return res.json();
    })
    .then(data => {
      const quoteEl = document.getElementById('daily-quote');
      if (quoteEl) quoteEl.textContent = data.content;
    })
    .catch(err => {
      console.warn('Quote API unavailable, using fallback:', err.message);
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      const quoteEl = document.getElementById('daily-quote');
      if (quoteEl) quoteEl.textContent = randomQuote;
    });

  // ================== Weather ==================
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchWeather, showError);
  } else {
    showError({ message: "Geolocation not supported" });
  }

  function fetchWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherData(lat, lon);
  }

  function showError(error) {
    console.error(`Geolocation error: ${error.message}`);
    const cityEl = document.getElementById('weather-city');
    const tempEl = document.getElementById('weather-temp');
    if (cityEl) cityEl.textContent = 'Location unavailable';
    if (tempEl) tempEl.textContent = '--°C';
  }

  async function fetchWeatherData(lat, lon) {
    const apiKey = "58150b5e6a10b632504148292ede9f48";
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    setText("weather-city", "Loading...");
    setText("weather-temp", "--°C");
    setText("weather-description", "");

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data || !data.main || !data.weather || !data.weather[0]) {
        throw new Error("Incomplete weather data");
      }

      updateWeatherUI(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setText("weather-city", "Weather unavailable");
      setText("weather-temp", "--°C");
      setText("weather-description", "N/A");

      const weatherIconElem = document.getElementById("weather-icon");
      if (weatherIconElem) {
        weatherIconElem.innerHTML = `<i class="fas fa-exclamation-triangle"></i>`;
      }
    }
  }

  function updateWeatherUI(data) {
    const city = data.name;
    const temp = Math.floor(data.main.temp);
    const feelsLike = Math.floor(data.main.feels_like);
    const humidity = data.main.humidity;
    const weather = capitalize(data.weather[0].description);
    const icon = data.weather[0].icon;

    setText("weather-city", city);
    setText("weather-temp", `${temp}°C`);
    setText("weather-description", weather);
    setText("feels-like", `${feelsLike}°C`);
    setText("humidity", `${humidity}%`);

    const weatherIconElem = document.getElementById("weather-icon");
    const iconMap = {
      '01': 'fa-sun',
      '02': 'fa-cloud-sun',
      '03': 'fa-cloud',
      '04': 'fa-cloud',
      '09': 'fa-cloud-showers-heavy',
      '10': 'fa-cloud-rain',
      '11': 'fa-bolt',
      '13': 'fa-snowflake',
      '50': 'fa-smog'
    };

    const iconCode = icon.slice(0, 2);
    const iconClass = iconMap[iconCode] || 'fa-cloud';

    if (weatherIconElem) {
      weatherIconElem.innerHTML = `<i class="fas ${iconClass}"></i>`;
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    }
  }

  function capitalize(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // ================== Reminders - Task Input ==================
  const mainTaskInput = document.getElementById('main-task-input');
  const taskContainer = document.querySelector('.task-container');

  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => createTask(task));

  if (mainTaskInput) {
    mainTaskInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && this.value.trim()) {
        const value = this.value.trim();
        createTask(value);
        savedTasks.push(value);
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
        this.value = '';

        // Check if all tasks are completed for confetti
        checkAllTasksCompleted();
      }
    });
  }

  function createTask(text) {
    if (!taskContainer) return;
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';

    checkbox.addEventListener('change', function () {
      // Toggle strikethrough on the task input
      if (this.checked) {
        input.style.textDecoration = 'line-through';
        input.style.opacity = '0.6';
      } else {
        input.style.textDecoration = 'none';
        input.style.opacity = '1';
      }
      checkAllTasksCompleted();
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-input';
    input.value = text;

    const delBtn = document.createElement('button');
    delBtn.innerHTML = `<i class="fa-solid fa-trash" style="color:rgba(247, 2, 2, 0.54);"></i>`;
    delBtn.style.marginLeft = '8px';
    delBtn.style.background = 'none';
    delBtn.style.border = 'none';
    delBtn.style.cursor = 'pointer';
    delBtn.onclick = () => {
      taskContainer.removeChild(div);
      const index = savedTasks.indexOf(text);
      if (index > -1) {
        savedTasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
      }
    };

    div.appendChild(checkbox);
    div.appendChild(input);
    div.appendChild(delBtn);
    taskContainer.appendChild(div);
  }


  // ================== Confetti on All Tasks Complete ==================
  function checkAllTasksCompleted() {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    if (checkboxes.length > 0) {
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      if (allChecked && typeof confetti !== 'undefined') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }

  // ================== Quick Apps ==================
  const quickAppsContainer = document.querySelector('.quick-apps');
  const addAppBtn = document.getElementById('add-app-btn');
  const addAppModal = document.getElementById('add-app-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const cancelAppBtn = document.getElementById('cancel-app');
  const saveAppBtn = document.getElementById('save-app');
  const appNameInput = document.getElementById('app-name');
  const appUrlInput = document.getElementById('app-url');

  // Load custom apps from localStorage
  let customApps = JSON.parse(localStorage.getItem('customApps')) || [];

  function renderCustomApps() {
    // Remove existing custom apps
    document.querySelectorAll('.custom-app-btn').forEach(el => el.remove());

    customApps.forEach((app, index) => {
      const btn = document.createElement('button');
      btn.className = 'app-btn custom-app-btn';
      btn.title = app.name;
      btn.innerHTML = `
        <div class="app-icon">
          <img src="https://www.google.com/s2/favicons?domain=${app.url}&sz=64" alt="${app.name}" onerror="this.src='src/favicon.ico'">
        </div>
        ${app.name}
        <div class="delete-app-btn" data-index="${index}"><i class="fas fa-times"></i></div>
      `;

      btn.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-app-btn')) {
          // Add https:// if not present
          let url = app.url;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          window.open(url, '_blank');
        }
      });

      // Insert before the Add App button
      if (quickAppsContainer && addAppBtn) {
        quickAppsContainer.insertBefore(btn, addAppBtn);
      }
    });

    // Re-attach delete listeners
    document.querySelectorAll('.delete-app-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        customApps.splice(index, 1);
        localStorage.setItem('customApps', JSON.stringify(customApps));
        renderCustomApps();
      });
    });
  }

  renderCustomApps();

  // Load deleted default apps from localStorage
  let deletedDefaultApps = JSON.parse(localStorage.getItem('deletedDefaultApps')) || [];

  // Handle hardcoded apps - Add delete buttons to all
  document.querySelectorAll('.app-btn:not(.custom-app-btn):not(.add-app-btn)').forEach(btn => {
    const appClass = btn.className.split(' ')[1]; // Get app name (youtube, github, etc.)

    // Hide app if it was previously deleted
    if (deletedDefaultApps.includes(appClass)) {
      btn.remove();
      return;
    }

    // Add delete button to each default app
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-app-btn';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    btn.appendChild(deleteBtn);

    // Handle app click
    btn.addEventListener('click', function (e) {
      if (!e.target.closest('.delete-app-btn')) {
        const app = this.className.split(' ')[1];
        const links = {
          instagram: 'https://instagram.com/satyajit_mishra1',
          youtube: 'https://youtube.com',
          github: 'https://github.com/satyajitmishra-dev',
          linkedin: 'https://linkedin.com/in/satyajitmishra1',
          twitter: 'https://x.com/satyajit-mishr0',
          whatsapp: 'https://whatsapp.com',
          stackoverflow: 'https://stackoverflow.com/',
          codepen: 'https://codepen.com/'
        };
        if (links[app]) window.open(links[app], '_blank');
      }
    });

    // Handle delete button click for default apps
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Add to deleted list and save to localStorage
      deletedDefaultApps.push(appClass);
      localStorage.setItem('deletedDefaultApps', JSON.stringify(deletedDefaultApps));
      btn.remove();
    });
  });

  // Modal Logic
  if (addAppBtn) {
    addAppBtn.addEventListener('click', () => {
      if (addAppModal) {
        addAppModal.classList.add('active');
        if (appNameInput) appNameInput.focus();
      }
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (addAppModal) addAppModal.classList.remove('active');
      if (appNameInput) appNameInput.value = '';
      if (appUrlInput) appUrlInput.value = '';
    });
  }

  if (cancelAppBtn) {
    cancelAppBtn.addEventListener('click', () => {
      if (addAppModal) addAppModal.classList.remove('active');
      if (appNameInput) appNameInput.value = '';
      if (appUrlInput) appUrlInput.value = '';
    });
  }

  if (saveAppBtn) {
    saveAppBtn.addEventListener('click', () => {
      const name = appNameInput ? appNameInput.value.trim() : '';
      const url = appUrlInput ? appUrlInput.value.trim() : '';

      if (name && url) {
        customApps.push({ name, url });
        localStorage.setItem('customApps', JSON.stringify(customApps));
        renderCustomApps();

        if (addAppModal) addAppModal.classList.remove('active');
        if (appNameInput) appNameInput.value = '';
        if (appUrlInput) appUrlInput.value = '';
      }
    });
  }

  // Close modal on outside click
  if (addAppModal) {
    addAppModal.addEventListener('click', (e) => {
      if (e.target === addAppModal) {
        addAppModal.classList.remove('active');
        if (appNameInput) appNameInput.value = '';
        if (appUrlInput) appUrlInput.value = '';
      }
    });
  }

  // ================== Fetch Tech News ==================
  function fetchTechNews() {
    const fallbackNews = [
      { title: "AI Revolution: ChatGPT Transforms Software Development", url: "https://news.ycombinator.com" },
      { title: "JavaScript Frameworks 2024: React vs Vue vs Angular", url: "https://dev.to" },
      { title: "Quantum Computing Breakthrough Announced by Tech Giants", url: "https://techcrunch.com" },
      { title: "Cybersecurity Alert: New Vulnerabilities Discovered", url: "https://thehackernews.com" },
      { title: "5G Technology Rollout Accelerates Worldwide", url: "https://www.theverge.com" }
    ];

    const apiKey = "2e93467a8694c2a2b82e1a6b560bd053";
    const url = `https://gnews.io/api/v4/top-headlines?topic=technology&lang=en&country=us&max=5&apikey=${apiKey}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => {
        const newsList = document.getElementById("news-list");
        if (!newsList) return;
        newsList.innerHTML = "";

        if (data.articles && data.articles.length > 0) {
          data.articles.forEach((article) => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
            newsList.appendChild(li);
          });
        } else {
          throw new Error("No articles found");
        }
      })
      .catch((err) => {
        console.warn('News API unavailable (CORS or network error), using fallback:', err.message);
        const newsList = document.getElementById("news-list");
        if (!newsList) return;
        newsList.innerHTML = "";

        fallbackNews.forEach((article) => {
          const li = document.createElement("li");
          li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
          newsList.appendChild(li);
        });
      });
  }

  fetchTechNews();

  // ================== Sortable Cards ==================
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;

  if (isDesktop && typeof Sortable !== 'undefined') {
    const container = document.getElementById('card-container');
    if (container) {
      const sortable = new Sortable(container, {
        animation: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.card-title',
        forceFallback: true,
        onEnd: function (evt) {
          const cardOrder = Array.from(container.children).map(card => card.id);
          localStorage.setItem('cardOrder', JSON.stringify(cardOrder));
        }
      });

      const storedOrder = JSON.parse(localStorage.getItem('cardOrder'));
      if (storedOrder) {
        storedOrder.forEach(cardId => {
          const card = document.getElementById(cardId);
          if (card) container.appendChild(card);
        });
      }
    }
  }

  // ================== Pomodoro Timer ==================
  let pomodoroInterval = null;
  let pomodoroTimeLeft = 25 * 60; // 25 minutes in seconds
  let pomodoroIsWork = true;
  let pomodoroSessions = 0;
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const pomodoroTimeEl = document.getElementById('pomodoro-time');
  const pomodoroModeEl = document.getElementById('pomodoro-mode');
  const pomodoroSessionsEl = document.getElementById('pomodoro-sessions');
  const pomodoroProgressEl = document.querySelector('.pomodoro-progress');
  const pomodoroStartBtn = document.getElementById('pomodoro-start');
  const pomodoroPauseBtn = document.getElementById('pomodoro-pause');
  const pomodoroResetBtn = document.getElementById('pomodoro-reset');

  function updatePomodoroDisplay() {
    if (!pomodoroTimeEl) return;
    const minutes = Math.floor(pomodoroTimeLeft / 60);
    const seconds = pomodoroTimeLeft % 60;
    pomodoroTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (pomodoroProgressEl) {
      const totalTime = pomodoroIsWork ? WORK_TIME : BREAK_TIME;
      const progress = ((totalTime - pomodoroTimeLeft) / totalTime) * 339.292;
      pomodoroProgressEl.style.strokeDashoffset = 339.292 - progress;
    }
  }

  function startPomodoro() {
    if (pomodoroInterval) return;

    if (pomodoroStartBtn) pomodoroStartBtn.style.display = 'none';
    if (pomodoroPauseBtn) pomodoroPauseBtn.style.display = 'flex';

    pomodoroInterval = setInterval(() => {
      pomodoroTimeLeft--;
      updatePomodoroDisplay();

      if (pomodoroTimeLeft <= 0) {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;

        if (pomodoroIsWork) {
          pomodoroSessions++;
          if (pomodoroSessionsEl) pomodoroSessionsEl.textContent = `Sessions: ${pomodoroSessions}`;
          pomodoroTimeLeft = BREAK_TIME;
          if (pomodoroModeEl) {
            pomodoroModeEl.textContent = 'Break Time';
            pomodoroModeEl.style.color = 'var(--accent-orange)';
          }
        } else {
          pomodoroTimeLeft = WORK_TIME;
          if (pomodoroModeEl) {
            pomodoroModeEl.textContent = 'Work Session';
            pomodoroModeEl.style.color = 'var(--accent-green)';
          }
        }

        pomodoroIsWork = !pomodoroIsWork;
        if (pomodoroStartBtn) pomodoroStartBtn.style.display = 'flex';
        if (pomodoroPauseBtn) pomodoroPauseBtn.style.display = 'none';
        updatePomodoroDisplay();
      }
    }, 1000);
  }

  function pausePomodoro() {
    if (pomodoroInterval) {
      clearInterval(pomodoroInterval);
      pomodoroInterval = null;
      if (pomodoroStartBtn) pomodoroStartBtn.style.display = 'flex';
      if (pomodoroPauseBtn) pomodoroPauseBtn.style.display = 'none';
    }
  }

  function resetPomodoro() {
    pausePomodoro();
    pomodoroTimeLeft = WORK_TIME;
    pomodoroIsWork = true;
    if (pomodoroModeEl) {
      pomodoroModeEl.textContent = 'Work Session';
      pomodoroModeEl.style.color = 'var(--accent-green)';
    }
    updatePomodoroDisplay();
  }

  if (pomodoroStartBtn) {
    pomodoroStartBtn.addEventListener('click', startPomodoro);
    pomodoroPauseBtn.addEventListener('click', pausePomodoro);
    pomodoroResetBtn.addEventListener('click', resetPomodoro);
    updatePomodoroDisplay();
  }

  // ================== Settings Panel ==================
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsClose = document.getElementById('settings-close');
  const cardToggles = document.querySelectorAll('.card-toggle');

  // Load saved card visibility
  const savedVisibility = JSON.parse(localStorage.getItem('cardVisibility')) || {};
  cardToggles.forEach(toggle => {
    const cardId = toggle.dataset.card;
    if (savedVisibility[cardId] === false) {
      toggle.checked = false;
      const card = document.getElementById(cardId);
      if (card) card.classList.add('hidden');
    }
  });

  if (settingsToggle) {
    settingsToggle.addEventListener('click', () => {
      if (settingsPanel) settingsPanel.classList.toggle('active');
    });
  }

  if (settingsClose) {
    settingsClose.addEventListener('click', () => {
      if (settingsPanel) settingsPanel.classList.remove('active');
    });
  }

  cardToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const cardId = toggle.dataset.card;
      const card = document.getElementById(cardId);

      if (toggle.checked) {
        if (card) card.classList.remove('hidden');
        savedVisibility[cardId] = true;
      } else {
        if (card) card.classList.add('hidden');
        savedVisibility[cardId] = false;
      }

      localStorage.setItem('cardVisibility', JSON.stringify(savedVisibility));
    });
  });
}
