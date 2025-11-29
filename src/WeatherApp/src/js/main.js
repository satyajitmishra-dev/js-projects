const userLocation = document.querySelector("input");
const serchButton = document.querySelector("button");
/* ********************************  With Async Fn  ****************************** */
serchButton.addEventListener("click", (e) => {
  e.preventDefault();
if(userLocation === " "){
    alert("Enter A Location First")
}
  const cityName = userLocation.value.trim();
  const apiKey = `58150b5e6a10b632504148292ede9f48`;
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  async function collectWeatherData(response) {
    try {
      const weatherData = await fetch(apiUrl);
      const data = await weatherData.json();
      
      
      document.getElementById("city-name").textContent = data.name;
      document.getElementById(
        "temperature"
      ).textContent = `${Math.round(data.main.temp)} °C`;
      document.getElementById(
        "humidity"
      ).textContent = `${data.main.humidity} %`;
      document.getElementById(
        "wind-speed"
      ).textContent = `${data.wind.speed} km/h`;
      document.getElementById("error-message").textContent = "";
    } catch (error) {
      console.log(error.message);
      document.getElementById("error-message").textContent =
       alert(`Your Location ${cityName} not Found`);
    }
  }
  collectWeatherData();
});

/* ********************************  WithOut Async Fn  ****************************** */
// const userLocation = document.querySelector("input");
// const serchButton = document.querySelector("button");

// serchButton.addEventListener("click", (e) => {
//   e.preventDefault();

//   const cityName = userLocation.value.trim();

//   const apiKey = `58150b5e6a10b632504148292ede9f48`;
//   const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

//   fetch(apiUrl)
//     .then(function (response) {
//       if (!response.ok) {
//         alert("city not found");
//       }
//       return response.json();
//     })
//     .then(function (weatherData) {
//       document.getElementById("city-name").textContent = weatherData.name;
//       document.getElementById(
//         "temperature"
//       ).textContent = `${weatherData.main.temp} °C`;
//       document.getElementById(
//         "humidity"
//       ).textContent = `${weatherData.main.humidity} %`;
//       document.getElementById(
//         "wind-speed"
//       ).textContent = `${weatherData.wind.speed} km/h`;
//       document.getElementById("error-message").textContent = "";
//     })
//     .catch(function (error) {
//       console.log(error.message);
//       document.getElementById("error-message").textContent =
//         "City not found. Please try again.";
//     });
// });
