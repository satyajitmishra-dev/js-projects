<<<<<<< HEAD
/*=========================================================================
====================== Main javascript ==================================
============================================================================*/


document.addEventListener('DOMContentLoaded', function() {

  setTimeout(function() {
    document.getElementById('loader').classList.add('fade-out');
    document.getElementById('content').style.opacity = '1';
  }, 1500);


  initializePage();
});

function initializePage() {
  // ================== Dark Mode Toggle ==================
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const moonIcon = darkModeToggle.querySelector('i');

  function applyDarkMode(state) {
    document.documentElement.classList.toggle('dark-theme', state);
    moonIcon.classList.toggle('fa-moon', !state);
    moonIcon.classList.toggle('fa-sun', state);
    darkModeToggle.style.backgroundColor = state ? '#4285f4' : '';
  }

  // Initialize dark mode state
  const savedMode = localStorage.getItem('darkMode') === 'true';
  applyDarkMode(savedMode);

  darkModeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    applyDarkMode(isDark);
    localStorage.setItem('darkMode', isDark);
  });

  // ================== Google Search ==================
  document.getElementById('search-button').addEventListener('click', performSearch);
  document.getElementById('google-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  function performSearch() {
    const query = document.getElementById('google-search').value.trim();
    if (query) window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  }

  // ================== Voice Search ==================
  const voiceBtn = document.getElementById("voice-btn");
  const searchInput = document.getElementById("google-search");

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
      searchInput.value = transcript;
      // Optional: Auto search
      document.getElementById("search-button").click();
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
    voiceBtn.style.display = "none"; // Hide if unsupported
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
    document.getElementById('current-time').textContent = time;
    document.getElementById('current-date').textContent = date;
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // ================== Daily Quote ==================
  fetch('https://api.quotable.io/random')
    .then(res => res.json())
    .then(data => document.getElementById('daily-quote').textContent = data.content)
    .catch(err => {
      console.error(err);
      document.getElementById('daily-quote').textContent = "⚠️ Error loading quote";
    });

  // ================== Weather ==================

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchWeather, showError);
  } else {
    document.getElementById('weather-city').textContent = 'Location unavailable';
    document.getElementById('weather-temp').textContent = '--°C';
  }

  function fetchWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherData(lat, lon);
  }

  function showError(error) {
    console.error(`Geolocation error: ${error.message}`);
    document.getElementById('weather-city').textContent = 'Location error';
    document.getElementById('weather-temp').textContent = '--°C';
  }

  // Function to fetch weather data using OpenWeatherMap API
 async function fetchWeatherData(lat, lon) {
  const apiKey = "58150b5e6a10b632504148292ede9f48";
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  // Set loading state
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
  const weather = capitalize(data.weather[0].description);
  const icon = data.weather[0].icon;

  setText("weather-city", city);
  setText("weather-temp", `${temp}°C`);
  setText("weather-description", weather);

  const weatherIconElem = document.getElementById("weather-icon");

  const iconMap = {
    '01': 'fa-sun',                  // clear sky
    '02': 'fa-cloud-sun',           // few clouds
    '03': 'fa-cloud',               // scattered clouds
    '04': 'fa-cloud',               // broken clouds
    '09': 'fa-cloud-showers-heavy', // shower rain
    '10': 'fa-cloud-rain',          // rain
    '11': 'fa-bolt',                // thunderstorm
    '13': 'fa-snowflake',           // snow
    '50': 'fa-smog'                 // mist
  };

  const iconCode = icon.slice(0, 2); // get first two digits
  const iconClass = iconMap[iconCode] || 'fa-cloud'; // fallback

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

// Helper function to capitalize weather descriptions
function capitalize(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Optional: Auto-detect location on page load
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setText("weather-city", "Location blocked");
      }
    );
  } else {
    console.warn("Geolocation not supported");
    setText("weather-city", "Geolocation unsupported");
  }
});

  // ================== Reminders - Task Input ==================
  const mainTaskInput = document.getElementById('main-task-input');
  const taskContainer = document.querySelector('.task-container');

  // Load saved tasks
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => createTask(task));

  mainTaskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
      const value = this.value.trim();
      createTask(value);
      savedTasks.push(value);
      localStorage.setItem('tasks', JSON.stringify(savedTasks));
      this.value = '';
    }
  });

  function createTask(text) {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';

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
  // ================== Quick Apps ==================
  document.querySelectorAll('.app-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const app = this.className.split(' ')[1];
      const links = {
        instagram: 'https://instagram.com/satyajit_mishra1',
        youtube: 'https://youtube.com',
        github: 'https://github.com/satyajitmishra-dev',
        linkedin: 'https://linkedin.com/satyajitmishra1',
        twitter: 'https://x.com/satyajit-mishr0',
        whatsapp: 'https://whatsapp.com',
        stackoverflow: 'https://stackoverflow.com/',
        codepen: 'https://codepen.com/'
      };
      if (links[app]) window.open(links[app], '_blank');
    });
  });

  // ================== Fetch Tech News ==================
  function fetchTechNews() {
    const apiKey = "2e93467a8694c2a2b82e1a6b560bd053";
    const url = `https://gnews.io/api/v4/top-headlines?topic=technology&lang=en&country=us&max=5&apikey=${apiKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const newsList = document.getElementById("news-list");
        newsList.innerHTML = "";

        if (data.articles && data.articles.length > 0) {
          data.articles.forEach((article) => {
            const li = document.createElement("li");
            li.style.marginBottom = "10px";
            li.innerHTML = `<a href="${article.url}" target="_blank" style="text-decoration: none; color: #e56b6f;">
              📰 ${article.title}
            </a>`;
            newsList.appendChild(li);
          });
        } else {
          throw new Error("No articles found");
        }
      })
      .catch((err) => {
        console.error("News fetch error:", err);
        document.getElementById("news-list").innerHTML = "<li>Failed to load news. Please try again later.</li>";
      });
  }

  fetchTechNews();

  // ================== Sortable Cards ==================
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;

  if (isDesktop && typeof Sortable !== 'undefined') {
    const container = document.getElementById('card-container');
    
 
    const sortable = new Sortable(container, {
      animation: 200,
      ghostClass: 'sortable-ghost',
      onEnd: function (evt) {

        const cardOrder = Array.from(container.children).map(card => card.id);
   
        localStorage.setItem('cardOrder', JSON.stringify(cardOrder));
      }
    });


    const storedOrder = JSON.parse(localStorage.getItem('cardOrder'));
    if (storedOrder) {
      storedOrder.forEach(cardId => {
        const card = document.getElementById(cardId);
        if (card) container.appendChild(card); // Reorder the cards based on the stored order
      });
    }
  }
}
=======
/*=========================================================================
====================== Main javascript ==================================
============================================================================*/


document.addEventListener('DOMContentLoaded', function() {

  setTimeout(function() {
    document.getElementById('loader').classList.add('fade-out');
    document.getElementById('content').style.opacity = '1';
  }, 1500);


  initializePage();
});

function initializePage() {
  // ================== Dark Mode Toggle ==================
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const moonIcon = darkModeToggle.querySelector('i');

  function applyDarkMode(state) {
    document.documentElement.classList.toggle('dark-theme', state);
    moonIcon.classList.toggle('fa-moon', !state);
    moonIcon.classList.toggle('fa-sun', state);
    darkModeToggle.style.backgroundColor = state ? '#4285f4' : '';
  }

  // Initialize dark mode state
  const savedMode = localStorage.getItem('darkMode') === 'true';
  applyDarkMode(savedMode);

  darkModeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    applyDarkMode(isDark);
    localStorage.setItem('darkMode', isDark);
  });

  // ================== Google Search ==================
  document.getElementById('search-button').addEventListener('click', performSearch);
  document.getElementById('google-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  function performSearch() {
    const query = document.getElementById('google-search').value.trim();
    if (query) window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  }

  // ================== Voice Search ==================
  const voiceBtn = document.getElementById("voice-btn");
  const searchInput = document.getElementById("google-search");

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
      searchInput.value = transcript;
      // Optional: Auto search
      document.getElementById("search-button").click();
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
    voiceBtn.style.display = "none"; // Hide if unsupported
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
    document.getElementById('current-time').textContent = time;
    document.getElementById('current-date').textContent = date;
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);
  
  // ================== Battery ==================

   navigator.getBattery().then(function(battery) {
    function updateBatteryIcon() {
      let level = battery.level;
      let percentage = Math.round(level * 100);
      let charging = battery.charging;
      let iconClass = "";

      if (charging && percentage === 100) {
        iconClass = "fa-battery-full"; // Charging Full
      } else if (charging) {
        iconClass = "fa-battery-charging";
      } else if (percentage >= 80) {
        iconClass = "fa-battery-full";
      } else if (percentage >= 60) {
        iconClass = "fa-battery-three-quarters";
      } else if (percentage >= 40) {
        iconClass = "fa-battery-half";
      } else if (percentage >= 20) {
        iconClass = "fa-battery-quarter";
      } else {
        iconClass = "fa-battery-empty";
      }

      batterySection.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${percentage}%`;
    }

  
    updateBatteryIcon();

   
    battery.addEventListener('levelchange', updateBatteryIcon);

    battery.addEventListener('chargingchange', function() {
      console.log("Charging Status Changed:", battery.charging ? "Charging" : "Not Charging");
      updateBatteryIcon();
    });
  });

  // ================== Daily Quote ==================
  fetch('http://api.quotable.io/random')
    .then(res => res.json())
    .then(data => document.getElementById('daily-quote').textContent = data.content)
    .catch(err => {
      console.error(err);
      document.getElementById('daily-quote').textContent = "Learning never exhausts the mind";
    });

  // ================== Weather ==================

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchWeather, showError);
  } else {
    document.getElementById('weather-city').textContent = 'Location unavailable';
    document.getElementById('weather-temp').textContent = '--°C';
  }

  function fetchWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherData(lat, lon);
  }

  function showError(error) {
    console.error(`Geolocation error: ${error.message}`);
    document.getElementById('weather-city').textContent = 'Location error';
    document.getElementById('weather-temp').textContent = '--°C';
  }

  // Function to fetch weather data using OpenWeatherMap API
 async function fetchWeatherData(lat, lon) {
  const apiKey = "58150b5e6a10b632504148292ede9f48";
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  // Set loading state
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
  const weather = capitalize(data.weather[0].description);
  const icon = data.weather[0].icon;

  setText("weather-city", city);
  setText("weather-temp", `${temp}°C`);
  setText("weather-description", weather);

  const weatherIconElem = document.getElementById("weather-icon");

  const iconMap = {
    '01': 'fa-sun',                  // clear sky
    '02': 'fa-cloud-sun',           // few clouds
    '03': 'fa-cloud',               // scattered clouds
    '04': 'fa-cloud',               // broken clouds
    '09': 'fa-cloud-showers-heavy', // shower rain
    '10': 'fa-cloud-rain',          // rain
    '11': 'fa-bolt',                // thunderstorm
    '13': 'fa-snowflake',           // snow
    '50': 'fa-smog'                 // mist
  };

  const iconCode = icon.slice(0, 2); // get first two digits
  const iconClass = iconMap[iconCode] || 'fa-cloud'; // fallback

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

// Helper function to capitalize weather descriptions
function capitalize(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

//Auto-detect location on page load
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setText("weather-city", "Location blocked");
      }
    );
  } else {
    console.warn("Geolocation not supported");
    setText("weather-city", "Geolocation unsupported");
  }
});

  // ================== Reminders - Task Input ==================
  const mainTaskInput = document.getElementById('main-task-input');
  const taskContainer = document.querySelector('.task-container');

  // Load saved tasks
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => createTask(task));

  mainTaskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
      const value = this.value.trim();
      createTask(value);
      savedTasks.push(value);
      localStorage.setItem('tasks', JSON.stringify(savedTasks));
      this.value = '';
    }
  });

  function createTask(text) {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';

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
  // ================== Quick Apps ==================
  document.querySelectorAll('.app-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const app = this.className.split(' ')[1];
      const links = {
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com/in/',
        twitter: 'https://x.com',
        whatsapp: 'https://web.whatsapp.com',
        facebook: 'https://facebook.com',
        leetcode: 'https://leetcode.com',
        stackoverflow: 'https://stackoverflow.com/',
        codepen: 'https://codepen.com/'
      };
      if (links[app]) window.open(links[app], '_blank');
    });
  });

  // ================== Fetch Tech News ==================
  function fetchTechNews() {
    const apiKey = "2e93467a8694c2a2b82e1a6b560bd053";
    const url = `https://gnews.io/api/v4/top-headlines?topic=technology&lang=en&country=us&max=5&apikey=${apiKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const newsList = document.getElementById("news-list");
        newsList.innerHTML = "";

        if (data.articles && data.articles.length > 0) {
          data.articles.forEach((article) => {
            const li = document.createElement("li");
            li.style.marginBottom = "10px";
            li.innerHTML = `<a href="${article.url}" target="_blank" style="text-decoration: none; color: #e56b6f;">
              📰 ${article.title}
            </a>`;
            newsList.appendChild(li);
          });
        } else {
          throw new Error("No articles found");
        }
      })
      .catch((err) => {
        console.error("News fetch error:", err);
        document.getElementById("news-list").innerHTML = "<li>Failed to load news. Please try again later.</li>";
      });
  }

  fetchTechNews();

  // ================== Sortable Cards ==================
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;

  if (isDesktop && typeof Sortable !== 'undefined') {
    const container = document.getElementById('card-container');
    
 
    const sortable = new Sortable(container, {
      animation: 200,
      ghostClass: 'sortable-ghost',
      onEnd: function (evt) {

        const cardOrder = Array.from(container.children).map(card => card.id);
   
        localStorage.setItem('cardOrder', JSON.stringify(cardOrder));
      }
    });


    const storedOrder = JSON.parse(localStorage.getItem('cardOrder'));
    if (storedOrder) {
      storedOrder.forEach(cardId => {
        const card = document.getElementById(cardId);
        if (card) container.appendChild(card); // Reorder the cards based on the stored order
      });
    }
  }
}
>>>>>>> 1fd66db2d5d128e12c763de3b8422e1de4ec28eb
