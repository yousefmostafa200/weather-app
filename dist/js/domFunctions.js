export const setPlaceHolderText = () => {
  const input = document.querySelector('#searchBar__text');
  window.innerWidth < 400
    ? (input.placeholder = 'City, State, Country')
    : (input.placeholder = 'City, State, Country, or Zip Code');
};

export const addSpinner = (element) => {
  animteButton(element);
  setTimeout(animteButton, 1000, element);
};

const animteButton = (element) => {
  element.classList.toggle('none');
  element.nextElementSibling.classList.toggle('block');
  element.nextElementSibling.classList.toggle('none');
};

export const displayError = (headerMsg, srMsg) => {
  updateWeatherLocationHeader(headerMsg);
  updateScreenReaderConfirmation(srMsg);
};

export const displayApiError = (statusCode) => {
  const captilaizeMsg = toCaptalizeCase(statusCode.message);
  updateWeatherLocationHeader(captilaizeMsg);
  updateScreenReaderConfirmation(`${captilaizeMsg}. Please try again.`);
};

const toCaptalizeCase = (text) => {
  const words = text.split(' ');
  const captalizeWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return captalizeWords.join(' ');
};

const updateWeatherLocationHeader = (message) => {
  const h1 = document.querySelector('#currentForecast__location');
  if (message.indexOf('Lat:') !== -1 && message.indexOf('Long:') !== -1) {
    const msgArray = message.split(' ').map((msg) => msg.replace(':', ': '));
    console.log(msgArray);

    const lat = `Lat: ${msgArray[1].slice(0, 5)}`;
    const lng = `Long: ${msgArray[3].slice(0, 5)}`;

    console.log(lat, lng);
    h1.textContent = `${lat} • ${lng}`;
  } else {
    h1.textContent = message;
  }
};

export const updateScreenReaderConfirmation = (message) => {
  document.querySelector('#confirmation').textContent = message;
};

export const updateDisplay = (weatherJson, locationObj) => {
  fadeDisplay();
  clearDisplay();

  const weatherClass = getWeatherClass(weatherJson.list[0].weather[0].icon);
  setBGImage(weatherClass);
  const screenReaderWeather = buildScreenReaderWeather(
    weatherJson,
    locationObj
  );

  updateScreenReaderConfirmation(screenReaderWeather);
  updateWeatherLocationHeader(locationObj.getName());

  // current Conditions
  const ccArray = createCurrentConditionsDivs(
    weatherJson,
    locationObj.getUnit()
  );
  displayCurrnetConditions(ccArray);
  displaySixDayForecast(weatherJson);
  setFocusSearch();
  fadeDisplay();
};

const fadeDisplay = () => {
  const cc = document.querySelector('#currentForecast');
  cc.classList.toggle('zero-vis');
  cc.classList.toggle('fade-in');
  const sixDay = document.querySelector('#dailyForecast');
  sixDay.classList.toggle('zero-vis');
  sixDay.classList.toggle('fade-in');
};

const clearDisplay = () => {
  const currentConditions = document.querySelector(
    '#currentForecast__conditions'
  );
  deleteContents(currentConditions);
  const sixDayForecast = document.querySelector('#dailyForecast__contents');
  deleteContents(sixDayForecast);
};

const deleteContents = (parentElement) => {
  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
};

const getWeatherClass = (icon) => {
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(-1);
  const weatherLookup = {
    '09': 'snow',
    10: 'rain',
    11: 'rain',
    13: 'snow',
    50: 'fog',
  };

  let weatherClass;
  if (weatherLookup[firstTwoChars]) {
    weatherClass = weatherLookup[firstTwoChars];
  } else if (lastChar === 'd') {
    weatherClass = 'clouds';
  } else {
    weatherClass = 'night';
  }

  return weatherClass;
};

const setBGImage = (weatherClass) => {
  document.documentElement.classList.add(weatherClass);
  document.documentElement.classList.forEach((img) => {
    if (img !== weatherClass) document.documentElement.classList.remove(img);
  });
};

const buildScreenReaderWeather = (weatherJson, locationObj) => {
  const location = locationObj.getName();
  const unit = locationObj.getUnit();
  const tempUnit = unit === 'imperial' ? 'F' : 'C';

  return `${weatherJson.list[0].weather.description} and ${Math.round(
    Number(weatherJson.list[0].main.temp)
  )}°${tempUnit} in ${location}`;
};

const setFocusSearch = () => {
  document.querySelector('#searchBar__text').focus();
};

const createCurrentConditionsDivs = (weatherObj, unit) => {
  const tempUnit = unit === 'imperial' ? 'F' : 'C';
  const winUnit = unit === 'imperial' ? 'mph' : 'm/s';
  const icon = createMainImageDiv(
    weatherObj.list[0].weather[0].icon,
    weatherObj.list[0].weather[0].description
  );

  const temp = createElement(
    'div',
    'temp',
    `${Math.round(Number(weatherObj.list[0].main.temp))}°`
  );
  const captilizeDescription = toCaptalizeCase(
    weatherObj.list[0].weather[0].description
  );
  const description = createElement('div', 'desc', captilizeDescription);
  const feels = createElement(
    'div',
    'feels',
    `Feels Like ${Math.round(Number(weatherObj.list[0].main.feels_like))}°`
  );
  const maxTemp = createElement(
    'div',
    'maxtemp',
    ` High ${Math.round(Number(weatherObj.list[0].main.temp_max))}°`
  );
  const minTemp = createElement(
    'div',
    'mintemp',
    ` Min ${Math.round(Number(weatherObj.list[0].main.temp_min))}°`
  );
  const humidity = createElement(
    'div',
    'humidity',
    `Humidity ${weatherObj.list[0].main.humidity}%`
  );
  console.log(humidity);
  const wind = createElement(
    'div',
    'wind',
    `Wind ${Math.random(Number(weatherObj.list[0].wind.speed)).toFixed(
      3
    )} ${winUnit}`
  );

  return [icon, temp, description, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImageDiv = (icon, altText) => {
  const iconDiv = createElement('div', 'icon');
  iconDiv.id = 'icon';
  const faIcon = translateIconToFontAwesome(icon);
  faIcon.ariaHidden = true;
  faIcon.title = altText;
  iconDiv.appendChild(faIcon);
  return iconDiv;
};

const createElement = (elemType, divClassName, divText, unit) => {
  const div = document.createElement(elemType);
  div.className = divClassName;
  if (divText) {
    div.textContent = divText;
  }
  if (divClassName === 'temp') {
    const unitDiv = document.createElement('div');
    unitDiv.classList.add('unit');
    unitDiv.textContent = unit;
    div.appendChild(unitDiv);
  }

  return div;
};

const translateIconToFontAwesome = (icon) => {
  const i = document.createElement('i');
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(-1);

  switch (firstTwoChars) {
    case '01':
      if (lastChar === 'd') {
        i.classList.add('far', 'fa-sun');
      } else {
        i.classList.add('far', 'fa-moon');
      }
      break;
    case '02':
      if (lastChar === 'd') {
        i.classList.add('fas', 'fa-cloud-sun');
      } else {
        i.classList.add('fas', 'fa-cloud-moon');
      }
      break;
    case '03':
      i.classList.add('fas', 'fa-cloud');
      break;
    case '04':
      i.classList.add('fas', 'fa-cloud-meatball');
      break;
    case '09':
      i.classList.add('fas', 'fa-cloud-rain');
      break;
    case '10':
      if (lastChar === 'd') {
        i.classList.add('fas', 'fa-cloud-sun-rain');
      } else {
        i.classList.add('fas', 'fa-cloud-moon-rain');
      }
      break;
    case '11':
      i.classList.add('fas', 'fa-poo-storm');
      break;
    case '13':
      i.classList.add('far', 'fa-snowflake');
      break;
    case '50':
      i.classList.add('fas', 'fa-smog');
      break;
    default:
      i.classList.add('far', 'fa-question-circle');
      break;
  }
  return i;
};

const displayCurrnetConditions = (currentConditionsArray) => {
  const ccContainer = document.querySelector('#currentForecast__conditions');
  currentConditionsArray.forEach((cc) => {
    ccContainer.appendChild(cc);
  });
};

const displaySixDayForecast = (weatherJson) => {
  for (let i = 0; i < 6; i++) {
    const dfArray = createDailyForecastDivs(weatherJson.list[i]);
    displayDailyForecast(dfArray);
  }
};

const createDailyForecastDivs = (dayWeather) => {
  const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
  const dayAbbreviation = createElement(
    'p',
    ' dayAbbreviation',
    dayAbbreviationText
  );
  const dayIcon = createDailyForecastIcon(
    dayWeather.weather[0].icon,
    dayWeather.weather[0].description
  );
  const dailyHigh = createElement(
    'p',
    'dayHigh',
    `${Math.round(Number(dayWeather.main.temp_max))}°`
  );
  const dailyLow = createElement(
    'p',
    'dayLow',
    `${Math.round(Number(dayWeather.main.temp_min))}°`
  );
  return [dayAbbreviation, dayIcon, dailyHigh, dailyLow];
};

const getDayAbbreviation = (data) => {
  const dateObj = new Date(data * 1000);
  const utcString = dateObj.toUTCString();
  return utcString.slice(0, 3).toUpperCase();
};

const createDailyForecastIcon = (icon, altText) => {
  const img = document.createElement('img');
  if (window.innerWidth < 768 || window.innerHeight < 1025) {
    img.src = `https://openweathermap.org/img/wn/${icon}.png`;
  } else {
    img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
  img.alt = altText;
  return img;
};

const displayDailyForecast = (dfArray) => {
  const dayDiv = createElement('div', 'forecastDay');
  dfArray.forEach((el) => {
    dayDiv.appendChild(el);
  });
  const dailyForecastContainer = document.querySelector(
    '#dailyForecast__contents'
  );
  dailyForecastContainer.appendChild(dayDiv);
};
