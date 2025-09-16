import { apiKey } from "./config.js";
//variable
const theContainer = document.querySelector(".container");
let unit;
const cardHolder = document.querySelector(".cards-holder");
const searchButton = document.getElementById("src-btn");
const unitsButton = document.getElementById("units-btn");
const unitsMenu = document.getElementById("units-drop-menu");
const switchButton = document.getElementById("switch-unit");
let lastData = null;
let selectedDayIndex = 0;

// click event on main input  search field
searchButton.addEventListener("click", () => {
  const city = document.getElementById("search-field").value;
  if (city) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=yes&alerts=no&lang=ar`;
    //fetch function
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        cardHolder.innerHTML = "";
        theContainer.querySelector(".hourly-forecast")?.remove();
        lastData = data;
        createWeatherCard(data, "metric");

        const aside = createHourlyForecast(data.forecast.forecastday);
        theContainer.appendChild(aside);
      })
      //on error fetching url
      .catch((err) => {
        console.error("error:", err);
        const main = document.querySelector(".main-container");
        main.innerHTML = "";
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message");
        const title = document.createElement("h1");
        title.textContent = "something went wrong";
        const text = document.createElement("p");
        text.textContent =
          "we couldn't connect to the server (api error).please try again in a few minutes";
        const retryButton = document.createElement("button");
        retryButton.textContent = "retry";
        retryButton.addEventListener("click", () => {
          searchButton.click();
        });
        errorMessage.append(title, text, retryButton);
        document.body.appendChild(errorMessage);
      });
  }
});
//creating elements at dom

//1)create weather card
function createWeatherCard(data, unit = "metric") {
  const weatherSection = document.createElement("section");
  weatherSection.classList.add("weather-card");
  //start location and date
  const location = document.createElement("div");
  location.classList.add("location");
  const locationName = document.createElement("h2");
  locationName.textContent = `${data.location.name} , ${data.location.country}`;
  const date = document.createElement("p");
  date.textContent = new Date(data.location.localtime).toLocaleDateString(
    "en-us",
    {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
  //end location and date
  location.append(locationName, date);
  //start temperature and icon
  const temperature = document.createElement("div");
  temperature.className = "temperature";
  const iconSpan = document.createElement("span");
  iconSpan.className = "icon";
  const icon = document.createElement("img");
  icon.src = `https:${data.current.condition.icon}`;
  icon.alt = data.current.condition.text;
  iconSpan.appendChild(icon);
  const valueSpan = document.createElement("span");
  valueSpan.className = "value";
  const unitSymbol = unit === "imperial" ? "°F" : "°C";
  valueSpan.textContent =
    unit === "imperial"
      ? `${Math.round(data.current.temp_f)}  ${unitSymbol}`
      : `${Math.round(data.current.temp_c)}  ${unitSymbol}`;
  //end temperature and icon
  temperature.append(iconSpan, valueSpan);
  //append the location and temperature to weather section
  weatherSection.append(location, temperature);

  const infoSection = createInfoSection(data, unit);
  const dailySection = createDayBox(data.forecast.forecastday, unit);

  createHourlyForecast(data.forecast.forecastday);
  // append the main three sections to the card holder div
  cardHolder.append(weatherSection, infoSection, dailySection);

  return weatherSection;
}
//2)create info section
function createInfoSection(data, unit) {
  const infoSection = document.createElement("section");
  infoSection.className = "info";
  const unitSymbol = unit === "imperial" ? "°F" : "°C";
  const speedUnit = unit === "imperial" ? "mph" : "km/h";
  // create data into object from the weather api
  const weatherInfo = [
    {
      label: "feels like",
      value:
        unit === "imperial"
          ? `${data.current.feelslike_f} ${unitSymbol}`
          : `${data.current.feelslike_c} ${unitSymbol}`,
    },
    { label: "humidity", value: data.current.humidity + "%" },
    {
      label: "wind speed",
      value:
        unit === "imperial"
          ? `${data.current.wind_mph} ${speedUnit}`
          : `${data.current.wind_kph} ${speedUnit}`,
    },
    {
      label: "precipitation",
      value:
        unit === "imperial"
          ? `${data.current.precip_in} in`
          : `${data.current.precip_mm} mm`,
    },
  ];
  // looping on weather info and create boxes dynamic according to the object
  weatherInfo.forEach((item) => {
    const box = createBox(item.label, item.value);
    infoSection.appendChild(box);
  });
  return infoSection;
}
//3)create info box
function createBox(label, value) {
  const box = document.createElement("div");
  box.className = "box";
  const text = document.createElement("p");
  text.textContent = label;
  const span = document.createElement("span");
  span.textContent = value;
  box.append(text, span);
  return box;
}
//4)create day box
function createDayBox(forecastDays, unit = "metric") {
  //create daily section
  const dailySection = document.createElement("section");
  dailySection.classList.add("daily-forecast");
  //create daily title
  const title = document.createElement("h3");
  title.textContent = "daily forecast";
  dailySection.appendChild(title);
  //days container
  const daysContainer = document.createElement("div");
  daysContainer.classList.add("days");
  forecastDays.forEach((day) => {
    // day div
    const dayBox = document.createElement("div");
    dayBox.classList.add("day");
    //day name
    const dayName = document.createElement("p");
    dayName.textContent = new Date(day.date).toLocaleDateString("en-US", {
      weekday: "short",
    });

    //weather icon
    const icon = document.createElement("img");
    icon.src = `https:${day.day.condition.icon}`;
    icon.alt = day.day.condition.text;
    // high ,low
    const tempDiv = document.createElement("div");
    tempDiv.classList.add("temp");
    const highSpan = document.createElement("span");
    const highDiv = document.createElement("div");
    const lowSpan = document.createElement("span");
    const lowDiv = document.createElement("div");
    highSpan.textContent =
      unit === "imperial"
        ? `${Math.round(day.day.maxtemp_f)}`
        : `${Math.round(day.day.maxtemp_c)}`;
    lowSpan.textContent =
      unit === "imperial"
        ? `${Math.round(day.day.mintemp_f)}`
        : `${Math.round(day.day.mintemp_c)}`;
    //appending
    highDiv.appendChild(highSpan);
    lowDiv.appendChild(lowSpan);
    tempDiv.append(highDiv, lowDiv);
    dayBox.append(dayName, icon, tempDiv);
    daysContainer.append(dayBox);
  });
  dailySection.appendChild(daysContainer);
  return dailySection;
}
//5)create nav data

//create the main structure
function createHourlyForecast(forecastDays, selectedDayIndex = 0) {
  const aside = document.createElement("aside");
  aside.classList.add("hourly-forecast");
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("day-info");
  //address
  const title = document.createElement("h3");
  title.textContent = "hourly forecast";
  infoDiv.appendChild(title);
  //drop menu
  const dorpDiv = document.createElement("div");
  dorpDiv.classList.add("day-dropdown");
  const dayButton = document.createElement("button");
  dayButton.classList.add("drop-btn");
  dayButton.id = "day-btn";

  const firstDay = forecastDays[selectedDayIndex].date;

  dayButton.textContent = new Date(firstDay).toLocaleDateString("en-US", {
    weekday: "long",
  });

  dorpDiv.appendChild(dayButton);
  const dropMenu = document.createElement("div");
  dropMenu.classList.add("drop-menu-ul");

  const list = document.createElement("ul");
  list.style.display = "none";
  forecastDays.forEach((day) => {
    const node = document.createElement("li");
    const listButton = document.createElement("button");
    listButton.textContent = new Date(day.date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    listButton.addEventListener("click", () => {
      dayButton.textContent = new Date(day.date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      document.querySelector(".hours")?.remove();
      const newHours = createHoursForecast(day.hour, unit);
      aside.appendChild(newHours);
      list.style.display = "none";
    });
    node.appendChild(listButton);
    list.appendChild(node);
  });
  dropMenu.appendChild(list);
  dorpDiv.appendChild(dropMenu);
  infoDiv.appendChild(dorpDiv);
  aside.appendChild(infoDiv);
  aside.appendChild(
    createHoursForecast(forecastDays[selectedDayIndex].hour, unit)
  );
  dayButton.addEventListener("click", () => {
    list.style.display = list.style.display === "none" ? "block" : "none";
  });
  return aside;
}
//create the hours
function createHoursForecast(hourlyData, unit = "metric") {
  const hoursDiv = document.createElement("div");
  hoursDiv.classList.add("hours");

  const hoursToShow = hourlyData.slice(0, 8);

  hoursToShow.forEach((theHour) => {
    //time
    const hourDiv = document.createElement("div");
    hourDiv.classList.add("hour");
    const info = document.createElement("div");
    //icon
    const icon = document.createElement("img");
    icon.src = `https:${theHour.condition.icon}`;
    icon.alt = theHour.condition.text;
    //hour
    const timeSpan = document.createElement("span");
    timeSpan.textContent = new Date(theHour.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    info.append(icon, timeSpan);
    const tempDiv = document.createElement("div");

    const tempSpan = document.createElement("span");
    tempSpan.textContent =
      unit === "imperial"
        ? `${Math.round(theHour.temp_f)}°`
        : `${Math.round(theHour.temp_c)}°`;
    tempDiv.append(tempSpan);
    hourDiv.append(info, tempDiv);
    hoursDiv.appendChild(hourDiv);
  });
  return hoursDiv;
}
//create highlight the list in units button
function highlight(unit) {
  document.querySelectorAll("#units-drop-menu ul li").forEach((li) => {
    li.classList.remove("active");
  });
  const uls = document.querySelectorAll("#units-drop-menu ul");
  if (unit === "imperial") {
    uls[0].querySelector("li:nth-child(2)").classList.add("active");
    uls[1].querySelector("li:nth-child(2)").classList.add("active");
    uls[2].querySelector("li:nth-child(2)").classList.add("active");
  } else {
    uls[0].querySelector("li:nth-child(1)").classList.add("active");
    uls[1].querySelector("li:nth-child(1)").classList.add("active");
    uls[2].querySelector("li:nth-child(1)").classList.add("active");
  }
}

//click on unit button

unitsButton.addEventListener("click", () => {
  unitsMenu.classList.toggle("active");
});
// click on switch button to change units
switchButton.addEventListener("click", () => {
  unit = unit === "metric" ? "imperial" : "metric";

  switchButton.textContent =
    unit === "imperial" ? "Switch to Metric" : "Switch to Imperial";

  highlight(unit);
  cardHolder.innerHTML = "";
  theContainer.querySelector(".hourly-forecast")?.remove();
  createWeatherCard(lastData, unit);
  const aside = createHourlyForecast(
    lastData.forecast.forecastday,
    selectedDayIndex,
    unit
  );
  theContainer.appendChild(aside);
});
