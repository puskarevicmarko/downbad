import React, { useEffect, useRef, useState } from 'react';
import { Tabs, Tab, TabPanel } from '@headlessui/react';

import logo from './assets/logo.png';
import subLogo from './assets/sublogo.svg';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import $ from 'jquery';
import csv2geojson from 'csv2geojson';
import Drawer from './Drawer.js';
import { presentDrawer } from './Drawer.js';
import { destroyDrawer } from './Drawer.js';


function parseButtons(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const buttons = doc.querySelectorAll('button');
  const buttonData = [];

  buttons.forEach(button => {
    buttonData.push({
      latitude: button.dataset.latitude,
      longitude: button.dataset.longitude,
      description: button.dataset.description,
      label: button.textContent.trim(),
    });
  });

  return buttonData;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const MainContent = () => {

        const mapContainer = useRef(null);
        const [map, setMap] = useState(null);
        const [buttonData, setButtonData] = useState([]);
        const mapRef = useRef(null);
        const [activeTab, setActiveTab] = React.useState(0);

        const handleTabClick = (tabIndex) => {
          setActiveTab(tabIndex);
        };
        
        const [selectedIndex, setSelectedIndex] = useState(0);

        const handleCloseTopTen = () => {
          setSelectedIndex(0); // Switch to the Browse tab
        };

        const geocoderContainer = useRef(null);

        // Add handleFlyToButtonClick function
        let handleFlyToButtonClick = (event) => {
            const latitude = parseFloat(event.target.getAttribute('data-latitude'));
            const longitude = parseFloat(event.target.getAttribute('data-longitude'));
            const description = event.target.dataset.description;
            
            if (map) {
              map.flyTo({ center: [longitude, latitude], zoom: 14 });
            }

            destroyDrawer();
            new mapboxgl.Popup({
              closeButton: false,
              })
              .setLngLat([longitude, latitude])
              .setHTML(description)
              .addTo(mapRef.current);
          };

        useEffect(() => {
          if (map) return; // Initialize the map only once

          mapboxgl.accessToken = "pk.eyJ1IjoicHVza2FyZXZpY21hcmtvIiwiYSI6ImNsOGM0ODN2ZzBkaG4zb245MXMyd3o3ZGkifQ.e6UX1du_kGFp5YzHVrnMLw";
      
          const mapInstance = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/puskarevicmarko/cl1v306x6006a14s2064gtpmd",
            center: [-73.991556, 40.744972],
            zoom: 12,
          });

          // disable map rotation using right click + drag
          mapInstance.dragRotate.disable();
          
          // disable map rotation using touch rotation gesture
          mapInstance.touchZoomRotate.disableRotation();
      
          mapInstance.on("load", () => {
            setMap(mapInstance);
            mapRef.current = mapInstance; // Update mapRef with the latest map instance
            mapInstance.resize();
      
            fetch(
              "https://docs.google.com/spreadsheets/d/1TJ30712MKFqUTv-EiLfaFQnJ_Gb7qwJBh5U5unOVkRU/gviz/tq?tqx=out:csv&sheet=Sheet1"
            )
              .then((response) => response.text())
              .then((csvData) => {
                csv2geojson.csv2geojson(
                  csvData,
                  {
                    latfield: "Latitude",
                    lonfield: "Longitude",
                    delimiter: ",",
                  },
                  (err, data) => {
                    data.features.forEach((datum) => {
                      datum.properties.HeinosityIndex = parseInt(
                        datum.properties.HeinosityIndex
                      );
                    });
      
                    mapInstance.addSource("places", {
                      type: "geojson",
                      data: data,
                    });
      
                    mapInstance.addLayer({
                      id: "places",
                      type: "circle",
                      source: "places",
                      paint: {
                        "circle-stroke-color": "#FFCA2A",
                        "circle-opacity": 1,
                        "circle-radius": {
                          stops: [
                            [10, 1],
                            [14, 13],
                          ],
                        },
                        "circle-stroke-width": 0,
                        "circle-color": {
                          property: "HeinosityIndex",
                          stops: [
                            [1, "#f7b731"],
                            [3, "#FD9A01"],
                            [5, "#FF2C05"],
                            [21, "#F00505"],
                          ],
                        },
                      },
                    });
      
                    const popup = new mapboxgl.Popup({
                      closeButton: false,
                      closeOnClick: false,
                    });
      
                    mapInstance.on("mouseenter", "places", (e) => {
                      mapInstance.getCanvas().style.cursor = "pointer";
      
                      const coordinates = e.features[0].geometry.coordinates.slice();
                      const name = e.features[0].properties.Name;
      
                      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] +=
                          e.lngLat.lng > coordinates[0] ? 360 : -360;
                      }
      
                      popup.setLngLat(coordinates).setHTML(name).addTo(mapInstance);
                    });
      
                    mapInstance.on("mouseleave", "places", () => {
                      mapInstance.getCanvas().style.cursor = "";
                      popup.remove();
                    });
                    
                    mapInstance.on("click", "places", (e) => {
                      // You can perform additional actions based on the
   
                    const feature = e.features[0].properties;

                    // Update the UI elements with the feature data
                    document.getElementById("location").innerHTML = feature.Name;
                    //document.getElementById("tags").innerHTML = feature.Tags;
                    const parsedButtons = parseButtons(feature.Tags);
                    setButtonData(parsedButtons);
                    
                   for (let i = 1; i <= 20; i++) {
                      const postEl = document.getElementById(`p${i}`);
                      postEl.innerHTML = feature[`Post${i}`];
                    }

                    presentDrawer();

                    mapInstance.flyTo({
                        center: e.features[0].geometry.coordinates
                        });
          });
        }
      );
    })
    .catch((error) => {
      if (error.name === 'AbortError') {
        // Handle the aborted fetch request
        console.log('Fetch request aborted');
      } else {
        // Handle other errors
        console.error('An error occurred during the fetch request:', error);
      }
    });
    
  });

setMap(mapInstance);


// Add event listener to the button
// Query all buttons with the 'flex-shrink-0' class inside the 'tags' element
const buttons = document.querySelectorAll("#tags .flex-shrink-0");

// Attach the event listener to each button
buttons.forEach(button => {
  button.addEventListener("click", handleFlyToButtonClick);
});
}, [map]);


const geocoderRef = (element) => {
  if (element) {
    geocoderContainer.current = element;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });

    geocoder.on("result", (e) => {
      map.flyTo({ center: e.result.geometry.coordinates, zoom: 14 });
    });

    while (geocoderContainer.current.firstChild) {
      geocoderContainer.current.removeChild(geocoderContainer.current.firstChild);
    }

    geocoderContainer.current.appendChild(geocoder.onAdd(map));
  }
};

return (
    <>
      <section>

        <div className="container px-6 pt-6 mx-auto flex justify-center overflow-auto">
          
          <div className="w-full md:w-2/3 lg:w-1/2 full bg-stone-900/80 backdrop-blur-sm rounded-2xl flex flex-col relative z-10 shadow-2xl overflow-hidden">
            <div className="flex items-center bg-yellow-500 rounded-t-2xl flex-col items-start px-6 py-5">
              <img src={logo} className="object-contain md:h-12" alt="Down Bad" />
              <img src={subLogo} className="object-contain md:h-5" alt="Manhattan's Most Memed" />
            </div>
            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex space-x-1 p-3">
              {['Browse 📍', 
              'Top 10 🤡', 
              'Search 🔎'].map((category, index) => (
                  <Tab
                  key={category}
                  onClick={() => setActiveTab(index)}
                  className={classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    activeTab === index ? 'text-yellow-700' : 'text-yellow-100',
                    'ring-yellow-400 ring-opacity-60 ring-offset-2 ring-offset-yellow-400 focus:outline-none focus:ring-2',
                    activeTab === index
                      ? 'bg-white shadow'
                      : 'text-yellow-100 hover:bg-white/[0.12] hover:text-white'
                  )}
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="">
              <Tab.Panel
                className={classNames(
                             )}
              >
              </Tab.Panel>
              <Tab.Panel
                className={classNames(
                  'rounded-xl bg-gray bg-opacity-50 backdrop-blur-sm p-3 tab-panel-transition',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
                )}
              >
                <ul className="w-full text-left p-5 max-h-72 overflow-y-auto">
                    {[
                      { name: 'Lucien', score: 10 },
                      { name: 'Clandestino', score: 7.619047619 },
                      { name: 'Carbone', score: 6.666666667 },
                      { name: "Fanelli's", score: 5.714285714 },
                      { name: 'Dimes', score: 5.238095238 },
                      { name: 'Cipriani', score: 4.761904762 },
                      { name: 'Balthazar', score: 4.285714286 },
                      { name: 'Lola Taverna', score: 4.285714286 },
                      { name: "Ray's", score: 3.80952381 },
                      { name: "Paul's Baby Grand", score: 3.333333333 },
                    ].map((restaurant, index) => {
                      const emojiCount = Math.round(restaurant.score/2);
                      return (
                        <li
                          key={index}
                          className="mb-2 py-3 text-yellow-500 font-black text uppercase flex justify-between items-center"
                        >
                          <span>#{index + 1}: {restaurant.name}</span>
                          <span>
                            {Array(emojiCount)
                              .fill('🤮')
                              .join('')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                <button
                  onClick={handleCloseTopTen}
                  className="bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg shadow-md  mx-auto mb-4"
                >
                  Reveal all Down Bad establishments
                </button>
              </Tab.Panel>
              <Tab.Panel
                className={classNames(
                  'rounded-xl bg-gray bg-opacity-50 backdrop-blur-sm p-3 tab-panel-transition',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none'
                )}
              >
                <div ref={geocoderRef} className="flex justify-center geocoder-container p-3 relative w-full" alt="Search" />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
              
          </div>
        </div>
        <div className="absolute inset-0 map-container" ref={mapContainer} id="map" />
      </section>
      <Drawer buttonData={buttonData} onFlyToButtonClick={handleFlyToButtonClick} />
    </>
    
  );
};

export default MainContent;