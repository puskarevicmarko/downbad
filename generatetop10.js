const fetch = require('node-fetch');
const fs = require('fs').promises;
const csvtojson = require('csvtojson'); // Add this line
const { getTop10HeinosityLocations } = require('./src/utils');

const dataUrl = 'https://api.example.com/data';

const saveTop10HeinosityLocations = (top10Locations) => {
  const outputPath = './src/top10HeinosityLocations.json';
  const jsonData = JSON.stringify(top10Locations, null, 2);
  fs.writeFile(outputPath, jsonData, 'utf8')
    .then(() => console.log('Top 10 Heinosity locations saved.'))
    .catch((error) => console.error('Error saving data:', error));
};

const fetchTop10HeinosityLocations = async () => {
  try {
    const response = await fetch(dataUrl);
    const csvData = await response.text();
    const jsonData = await csvtojson().fromString(csvData); // Convert CSV data to JSON
    const top10Locations = getTop10HeinosityLocations(jsonData);
    saveTop10HeinosityLocations(top10Locations);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

fetchTop10HeinosityLocations();
