const axios = require("axios");

async function geocoding(location) {
  const options = {
    method: "GET",
    url: "https://geoapify-platform.p.rapidapi.com/v1/geocode/search",
    params: {
      apiKey: process.env.GEO_API_KEY,
      text: location,
      lang: "en",
      limit: "1",
    },
    headers: {
      "X-RapidAPI-Key": process.env.X_RapidAPI_Key,
      "X-RapidAPI-Host": process.env.X_RapidAPI_Host,
      "Accept-Encoding": "application/json",
    },
  };
  try {
    const response = await axios.request(options);
    if (response.data.features.length === 0) {
      return -1;
    }
    const geometry = response.data.features[0].geometry;
    return geometry;
  } catch (err) {
    console.log(err);
    return -1;
  }
}

module.exports = {
  geocoding,
};
