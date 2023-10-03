var citySearchEl = document.querySelector("#city-search");
var searchButtonEl = document.querySelector("#search-button");
var searchHistoryResultsEl = document.querySelector("#search-history-results");
var clearButtonEl = document.querySelector("#clear-button");
var currentWeatherEl = document.querySelector("#current-weather-text");
var fiveDayTextEl = document.querySelector("#five-day-text");
var fiveDayForecastEl = document.querySelector("#five-day-forecast");

var WeatherContainerEl = document.querySelector(".current-weather-container");
var FiveDayContainerEl = document.querySelector(".five-day-forecast-container");

var apiKey = "5dba84f4402b3859fe8edfb84e23c069";

// Search button for Cities
searchButtonEl.addEventListener("click", function () {
  cityLocationSearch();
});

// Enter Key Press
citySearchEl.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    cityLocationSearch();
  }
});

// Clears local storage
clearButtonEl.addEventListener("click", function () {
  localStorage.clear();
  location.reload();
});

// Used for city search, and storing/retrieving data from local storage.
function cityLocationSearch() {
  var cityStored = citySearchEl.value.trim().toLowerCase();
  city = cityStored.toString();

  if (!cityStored) {
    citySearchEl.setAttribute("placeholder", "Please type a city name");
    return;
  }

  var cityArray;
  if (localStorage.getItem("searchedCities")) {
    cityArray = JSON.parse(localStorage.getItem("searchedCities"));
  } else {
    cityArray = [];
  }

  if (!cityArray.includes(city)) {
    cityArray.push(city);
  }

  localStorage.setItem("searchedCities", JSON.stringify(cityArray));

  readFromLocalStorage();
  currentLocation(city);
}

function currentLocation(city) {
  // Looks at name of city that was entered, and calls the coordinates.
  var coordUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

  fetch(coordUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var latitude = data[0].lat;
      var longitude = data[0].lon;
      var cityName = data[0].name;

      // Uses coordinates from above to call current weather data for specific location
      var currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;

      fetch(currentWeatherUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          currentWeatherEl.innerHTML = "";

          WeatherContainerEl.classList.add("cool-border");

          // Variables for dates, months starts at 0 so we add 1.
          var d = new Date();
          var dayOfMonth = d.getDate();
          var month = d.getMonth() + 1;
          var year = d.getFullYear();

          var icon = data.weather[0].icon;
          var iconURL = `<img src="https://openweathermap.org/img/wn/${icon}.png"/>`;

          var currentWeatherFor = document.querySelector(
            "#current-weather-for"
          );

          currentWeatherFor.innerHTML = `Current Weather for ${cityName} (${month}/${dayOfMonth}/${year})${iconURL}`;

          var temp = data.main.temp;
          var tempParagraph = document.createElement("p");
          tempParagraph.innerHTML = `Temp: ${temp}&#8457`;
          currentWeatherEl.appendChild(tempParagraph);

          var wind = data.wind.speed;
          var windParagraph = document.createElement("p");
          windParagraph.innerHTML = `Wind: ${wind} MPH`;
          currentWeatherEl.appendChild(windParagraph);

          var humidity = data.main.humidity;
          var humidityParagraph = document.createElement("p");
          humidityParagraph.innerHTML = `Humidity ${humidity}%`;
          currentWeatherEl.appendChild(humidityParagraph);

          // Uses the selected location to call the forecast for the next 5 days.
          var fiveDayForcastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;

          fetch(fiveDayForcastURL)
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
              fiveDayForecastEl.innerHTML = "";

              var filteredArray = [];

              var fiveDayForecastText =
                document.querySelector("#five-day-text");

              fiveDayForecastText.innerHTML = `5-Day Forecast`;

              // pulls 40 results overall for every 3 hours, but we only need 5 so we increment 7 each time.
              for (var i = 9; i < data.list.length; i += 7) {
                var currentElement = data.list[i];
                filteredArray.push(currentElement);
              }
              // Use the above results to create a forecast for the next 5 days.
              for (var i = 0; i < filteredArray.length; i++) {
                var currentElement = filteredArray[i];

                FiveDayContainerEl.classList.add("cool-border");

                var fiveDayDateDiv = document.createElement("div");
                var forecastDiv = document.createElement("div");

                // dt counts in milliseconds, so we multiply by 1000 to get seconds for an accurate date reading.
                var d = new Date(currentElement.dt * 1000);
                var dayOfMonth = d.getDate();
                var month = d.getMonth() + 1;
                var year = d.getFullYear();

                fiveDayDateDiv.innerHTML = `${month}/${dayOfMonth}/${year}`;
                forecastDiv.appendChild(fiveDayDateDiv);

                var fiveDayIconDiv = document.createElement("div");
                var icon = currentElement.weather[0].icon;
                fiveDayIconDiv.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}.png"/>`;
                forecastDiv.appendChild(fiveDayIconDiv);

                var fiveDayTempDiv = document.createElement("div");
                var temp = currentElement.main.temp;
                fiveDayTempDiv.innerHTML = `Temp: ${temp}&#8457`;
                forecastDiv.appendChild(fiveDayTempDiv);

                var fiveDayWindDiv = document.createElement("div");
                var wind = currentElement.wind.speed;
                fiveDayWindDiv.innerHTML = `Wind: ${wind} MPH`;
                forecastDiv.appendChild(fiveDayWindDiv);

                var fiveDayHumidityDiv = document.createElement("div");
                var humidity = currentElement.main.humidity;
                fiveDayHumidityDiv.innerHTML = `Humidity: ${humidity}%`;
                forecastDiv.appendChild(fiveDayHumidityDiv);

                fiveDayForecastEl.appendChild(forecastDiv);
              }
            });
        });
    });
}

// Adds the local storage to the search history.
function readFromLocalStorage() {
  searchHistoryResultsEl.innerHTML = "";

  var cities = localStorage.getItem("searchedCities");

  if (cities) {
    cities = JSON.parse(cities);
    for (var i = 0; i < cities.length; i++) {
      var currentCity = cities[i];

      var saveHistory = document.createElement("button");
      saveHistory.setAttribute("id", currentCity);
      saveHistory.classList.add("button", "mb-3");

      saveHistory.addEventListener("click", function (event) {
        var city = event.target.getAttribute("id");
        currentLocation(city);
      });

      var firstLetterCaps =
        currentCity.charAt(0).toUpperCase() + currentCity.slice(1);

      saveHistory.innerHTML = firstLetterCaps;
      searchHistoryResultsEl.appendChild(saveHistory);
    }
  }
}

// Search history is always visable unless cleared
readFromLocalStorage();
