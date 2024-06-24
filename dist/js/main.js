import {
  setLocationObject,
  getHomeLocation,
  getWeatherFromCoords,
  getCoordsFromApi,
  cleanText,
} from './dataFunctions.js';
import {
  setPlaceHolderText,
  addSpinner,
  displayError,
  displayApiError,
  updateScreenReaderConfirmation,
  updateDisplay,
} from './domFunctions.js';
import CurrentLocation from './CurrentLocation.js';
const currentLoc = new CurrentLocation();

const initApp = () => {
  // add listeners
  const geoBtn = document.querySelector('#getLocation');
  geoBtn.addEventListener('click', getGeoWeather);

  const homeBtn = document.querySelector('#home');
  homeBtn.addEventListener('click', loadWeather);

  const saveBtn = document.querySelector('#saveLocation');
  saveBtn.addEventListener('click', saveLocation);

  const unitBtn = document.querySelector('#unit');
  unitBtn.addEventListener('click', setUnit);

  const refreshBtn = document.querySelector('#refresh');
  refreshBtn.addEventListener('click', refreshWeather);

  const locationSearch = document.querySelector('.searchBar__form');
  locationSearch.addEventListener('submit', submitNewLocation);
  // set up
  setPlaceHolderText();
  // load weather
  loadWeather();
};

document.addEventListener('DOMContentLoaded', initApp);

const getGeoWeather = function (e) {
  if (e) {
    if (e.type === 'click') {
      // add spinner
      const mapIcon = document.querySelector('.fa-map-marker-alt');
      addSpinner(mapIcon);
    }
  }

  // if the geolocation not supported
  if (!navigator.geolocation) geoError();

  navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

const geoError = (err) => {
  const errMsg = err ? err.message : 'Geolocation not supported';
  displayError(errMsg, errMsg);
};

const geoSuccess = (position) => {
  const myCoords = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    name: `Lat: ${position.coords.latitude} Long: ${position.coords.longitude}`,
  };
  // set location object
  setLocationObject(currentLoc, myCoords);

  // update data and display
  updateDataAndDisplay(currentLoc);
};

const loadWeather = (e) => {
  const savedLocation = getHomeLocation();
  if (!savedLocation && !e) return getGeoWeather();
  if (!savedLocation && e.type === 'click') {
    displayError(
      'No Home Location Saved',
      'Sorry. Please save your home location first.'
    );
  } else if (savedLocation && !e) {
    displayHomeLocationWeather(savedLocation);
  } else {
    const homeIcon = document.querySelector('.fa-home');
    addSpinner(homeIcon);
    displayHomeLocationWeather(savedLocation);
  }
};

const displayHomeLocationWeather = (home) => {
  if (typeof home === 'string') {
    const locationJson = JSON.parse(home);
    const myCoordsObj = {
      lat: locationJson.lat,
      lng: locationJson.lng,
      name: locationJson.name,
      unit: locationJson.unit,
    };
    setLocationObject(currentLoc, myCoordsObj);
    updateDataAndDisplay(currentLoc);
  }
};

const saveLocation = () => {
  if (currentLoc.getLat() && currentLoc.getLng()) {
    const saveIcon = document.querySelector('.fa-save');
    addSpinner(saveIcon);
    const location = {
      lat: currentLoc.getLat(),
      lng: currentLoc.getLng(),
      name: currentLoc.getName(),
      unit: currentLoc.getUnit(),
    };

    localStorage.setItem('defaultWeatherLocation', JSON.stringify(location));
    updateScreenReaderConfirmation(
      `Saved ${currentLoc.getName()} as home location`
    );
  }
};

const setUnit = () => {
  const unitIcon = document.querySelector('.fa-chart-bar');
  addSpinner(unitIcon);
  currentLoc.toggleUnit();
  updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
  const refreshIcon = document.querySelector('.fa-refresh');
  addSpinner(refreshIcon);
  updateDataAndDisplay(currentLoc);
};

const submitNewLocation = async (e) => {
  e.preventDefault();
  const text = document.querySelector('#searchBar__text').value;
  const entryText = cleanText(text);
  if (!entryText.length) return;
  const locationIcon = document.querySelector('.fa-search');
  addSpinner(locationIcon);
  const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());

  if (coordsData) {
    if (coordsData.cod === 200) {
      const myCoordsObj = {
        lat: coordsData.coord.lat,
        lng: coordsData.coord.lon,
        name: coordsData.sys.country
          ? `${coordsData.name}, ${coordsData.sys.country}`
          : coordsData.name,
      };
      setLocationObject(currentLoc, myCoordsObj);
      updateDataAndDisplay(currentLoc);
    } else {
      displayApiError(coordsData);
    }
  } else {
    displayError('Connection Error', 'Connection Error');
  }
};

const updateDataAndDisplay = async (locationObj) => {
  const weatherJson = await getWeatherFromCoords(locationObj);
  console.log(weatherJson);
  if (weatherJson) updateDisplay(weatherJson, locationObj);
};
