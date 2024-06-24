const WEATHER_API_KEY = 'e187921e7338fa6c8180a6cadd3bcae3';
// const WEATHER_API_KEY = 'c28783f26272b6395a0e33c30627d6c0';
// const WEATHER_API_KEY2 = '2114e3957a7443a49a1121400242106';

export const setLocationObject = (locationObj, coordsObj) => {
  const { lat, lng, name, unit } = coordsObj;
  locationObj.setLat(lat);
  locationObj.setLng(lng);
  locationObj.setName(name);
  if (unit) locationObj.setUnit(unit);
};

export const getHomeLocation = () => {
  return localStorage.getItem('defaultWeatherLocation');
};

export const getWeatherFromCoords = async (locationObj) => {
  const lat = locationObj.getLat();
  const lng = locationObj.getLng();
  const units = locationObj.getUnit();

  // https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
  // const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&cnt=7&units=${units}&appid=${WEATHER_API_KEY}`;
  try {
    const weatherStream = await fetch(url);
    const weatherJson = await weatherStream.json();
    return weatherJson;
  } catch (err) {
    console.error(err);
  }
};

export const getCoordsFromApi = async (entryText, units) => {
  // only digits
  const regex = /^\d+$/g;
  const flag = regex.test(entryText) ? 'zip' : 'q';
  const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATHER_API_KEY}`;
  const encodedUrl = encodeURI(url);
  try {
    const dataStream = await fetch(encodedUrl);
    const jsonData = await dataStream.json();
    console.log(jsonData);
    return jsonData;
  } catch (err) {
    console.error(err.stack);
  }
};

export const cleanText = (text) => {
  const regex = / {2,}/g;
  const entryText = text.replaceAll(regex, ' ').trim();
  return entryText;
};
