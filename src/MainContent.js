import React, { useEffect, useRef, useState } from 'react';
import { Tab } from '@headlessui/react';

import logo from './assets/logo.png';
import subLogo from './assets/sublogo.svg';
import closeIcon from './assets/close-svgrepo-com.svg';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import csv2geojson from 'csv2geojson';
import Drawer from './Drawer.js';
import { presentDrawer } from './Drawer.js';
import { destroyDrawer } from './Drawer.js';
import { setBottomDrawer } from './Drawer.js';
import { setTopDrawer } from './Drawer.js';


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
      heinosity: button.dataset.heinosity,
      label: button.textContent.trim(),
    });
  });

  return buttonData;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const MainContent = (props) => {
        const mapContainer = useRef(null);
        const [map, setMap] = useState(null);
        const [buttonData, setButtonData] = useState([]);
        const mapRef = useRef(null);
        const [activeTab, setActiveTab] = React.useState(0);
        const [top10Locations, setTop10Locations] = useState([]);
        const [data, setData] = useState(null);

        const [selectedIndex, setSelectedIndex] = useState(1);
        const [postsData, setPostsData] = useState([]);


        const handleCloseTopTen = () => {

          setSelectedIndex(0); // Switch to the Browse tab
          map.flyTo({
            center: [-73.991344, 40.728110],
            zoom: 14,
        });

        };

        const geocoderContainer = useRef(null);
          

        useEffect(() => {
          console.log("Test");
          setTop10Locations(top10HeinousPlaces);

          setActiveTab(1);

          mapboxgl.accessToken = "pk.eyJ1IjoicHVza2FyZXZpY21hcmtvIiwiYSI6ImNsOGM0ODN2ZzBkaG4zb245MXMyd3o3ZGkifQ.e6UX1du_kGFp5YzHVrnMLw";
      
          /*const width = window.innerWidth;
          const height = window.innerHeight;

          console.log(width);
          console.log(height);*/

          const mapInstance = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/puskarevicmarko/cl1v306x6006a14s2064gtpmd",
            center: [-73.993516, 40.750513],
            zoom: 12,
            /*width: width,
            height: height,      */
          });

          // disable map rotation using right click + drag
          mapInstance.dragRotate.disable();
          
          // disable map rotation using touch rotation gesture
          mapInstance.touchZoomRotate.disableRotation();
      
          mapInstance.on("load", () => {
            setMap(mapInstance);
            mapRef.current = mapInstance; // Update mapRef with the latest map instance
            mapInstance.resize();
            console.log("resized");

            fetch(process.env.REACT_APP_API_KEY)
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
      
                    setData(data);
                    //const locations = getTop10HeinosityLocations(data);

                    /*
                    setTop10Locations(locations);
                    saveTop10HeinousPlacesToFile(locations);
                    */
                                
                    mapInstance.on("mouseenter", "places", (e) => {

                      mapInstance.getCanvas().style.cursor = "pointer";
      
                      const coordinates = e.features[0].geometry.coordinates.slice();
                      const name = e.features[0].properties.Name;
                      const heinosity = e.features[0].properties.HeinosityIndex;
                      
                      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] +=
                          e.lngLat.lng > coordinates[0] ? 360 : -360;
                      }
      
                      popup.setLngLat(coordinates)
                      .setHTML(`
                          <div class="popup-content">
                            <p class="text-sm font-sans font-medium pr-2 ">${name}</p>
                            <div class="heinosity-indicator" style="background-color: ${getColor(heinosity)};">${heinosity}</div>
                          </div>
                        `).addTo(mapInstance);
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
                    

                    // Store posts in an array
                    let posts = [];
                    for (let i = 1; i <= 20; i++) {
                      const postContent = feature[`Post${i}`];
                      if (postContent) {
                        posts.push(postContent);
                      } else {
                        break;
                      }
                    }

                    // Update state with posts data
                    setPostsData(posts);

                    /*
                   for (let i = 1; i <= 20; i++) {
                      const postEl = document.getElementById(`p${i}`);
                      postEl.innerHTML = feature[`Post${i}`];
                    }*/

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

// Query all buttons with the 'flex-shrink-0' class inside the 'tags' element
const buttons = document.querySelectorAll("#tags .flex-shrink-0");

// Attach the event listener to each button
buttons.forEach(button => {
  button.addEventListener("click", handleFlyToButtonClick);
});
}, []);


/*const fetchTop10HeinosityLocations = () => {
    setTop10Locations(top10HeinousPlaces);
};
*/
/*
const getTop10HeinosityLocations = (data) => {
  const top10Locations = data.features
    .sort((a, b) => b.properties.HeinosityIndex - a.properties.HeinosityIndex)
    .slice(0, 10)
    .map((feature) => ({
      id: feature.properties.id,
      name: feature.properties.Name,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      score: feature.properties.HeinosityIndex,
    }));

  return top10Locations;
};*/
/*
const saveTop10HeinousPlacesToFile = (top10Locations) => {
  const jsonString = JSON.stringify(top10Locations, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'top10HeinousPlaces.json';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};  
*/

 // Add handleFlyToButtonClick function
 let handleFlyToButtonClick = (event) => {
  const latitude = parseFloat(event.target.getAttribute('data-latitude'));
  const longitude = parseFloat(event.target.getAttribute('data-longitude'));
  const name = event.target.dataset.description;
  const heinosity =  parseFloat(event.target.getAttribute('data-heinosity'));

  console.log("heinous: ", heinosity);

  if (map) {
    map.flyTo({ center: [longitude, latitude], zoom: 14 });
  }

  destroyDrawer();
  new mapboxgl.Popup({
    closeButton: false,
    })
    .setLngLat([longitude, latitude])
    .setHTML(`
    <div class="popup-content">
      <h3 class="font-sans">${name}</h3>
      <div class="heinosity-indicator" style="background-color: ${getColor(heinosity)};">${heinosity}</div>
      </div>
  `)    
  .addTo(mapRef.current);
};

const geocoderRef = (element) => {
  if (element) {
    geocoderContainer.current = element;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false, 
      countries: 'us',
      types: 'poi',
      proximity: [-73.986, 40.755],
      localGeocoder: (query) => {
        const matchingFeatures = data.features.filter(feature => {
          return feature.properties.Name.toLowerCase().includes(query.toLowerCase());
        });
        return matchingFeatures.map(feature => ({
          center: feature.geometry.coordinates,
          place_name: feature.properties.Name,
          bbox: feature.bbox
        }));
      },
      render: (item) => {
        const isDarkRed = data.features.some(feature => feature.properties.Name === item.place_name);
        const color = isDarkRed ? '#F00505' : 'gray';
        const downBadText = isDarkRed ? ' is Down Bad ⚠️' : '';
        return `
          <div class="mapboxgl-ctrl-geocoder--suggestion">
            <div class="mapboxgl-ctrl-geocoder--suggestion-title" style="color: ${color};">${item.place_name}${downBadText}</div>
          </div>
        `;
      },      
    });

    geocoder.on('result', (e) => {
      const name = e.result.place_name;
      const isDarkRed = data.features.some(feature => feature.properties.Name === name);
      
      setActiveTab(0);
      setSelectedIndex(0);

      if (isDarkRed) {
        new mapboxgl.Popup({
          closeButton: false,
        })
          .setHTML(name)
          .setLngLat(e.result.center)
          .addTo(map);
      }
    });
    
    
    
    
    while (geocoderContainer.current.firstChild) {
      geocoderContainer.current.removeChild(geocoderContainer.current.firstChild);
    }

    geocoderContainer.current.appendChild(geocoder.onAdd(map));
  }
};

const triggerMapClick = (name, data) => {
 

  if (!map) return;

  const targetFeature = data.features.find((feature) => feature.properties.Name === name);

  if (targetFeature) {
    map.flyTo({
      center: targetFeature.geometry.coordinates,
      zoom: 16,
    });

    setActiveTab(0);
    setSelectedIndex(0); 

    const popup = new mapboxgl.Popup({
      closeButton: false,
    }).setLngLat(targetFeature.geometry.coordinates)
      .setHTML(targetFeature.properties.Name)
      .addTo(map);

    const feature = targetFeature.properties;
    document.getElementById("location").innerHTML = feature.Name;
    const parsedButtons = parseButtons(feature.Tags);
    setButtonData(parsedButtons);

    // Store posts in an array
    let posts = [];
    for (let i = 1; i <= 20; i++) {
      const postContent = feature[`Post${i}`];
      if (postContent) {
        posts.push(postContent);
      } else {
        break;
      }
    }
    // Update state with posts data
    setPostsData(posts);

    map.on("mouseleave", "places", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });
  }
};

function getColor(heinosity) {
  if (heinosity <= 1) {
    return "#f7b731";
  } else if (heinosity <= 3) {
    return "#FD9A01";
  } else if (heinosity <= 5) {
    return "#FF2C05";
  } else {
    return "#F00505";
  }
}

const top10HeinousPlaces = [
  {
    name: 'Lucien',
    latitude: 40.7233331,
    longitude: -73.9880763,
    score: 21,
  },
  {
    name: 'Aime Leon Dore',
    latitude: 40.7222039,
    longitude: -73.9980452,
    score: 16,
  },
  {
    name: 'Clandestino',
    latitude: 40.7147533,
    longitude: -73.9907809,
    score: 14,
  },
  {
    name: 'Carbone',
    latitude: 40.7279895,
    longitude: -74.0002182,
    score: 12,
  },
  {
    name: "Fanelli's",
    latitude: 40.7246254,
    longitude: -73.9987757,
    score: 11,
  },
  {
    name: 'Dimes',
    latitude: 40.7149708,
    longitude: -73.991567,
    score: 10,
  },
  {
    name: 'Cipriani',
    latitude: 40.7235595,
    longitude: -74.0029556,
    score: 9,
  },
  {
    name: 'Balthazar',
    latitude: 40.722668,
    longitude: -73.9982298,
    score: 9,
  },
  {
    name: 'Lola Taverna',
    latitude: 40.7270494,
    longitude: -74.0031992,
    score: 7,
  },
  {
    name: "Ray's",
    latitude: 40.721182,
    longitude: -73.992504,
    score: 7,
  },
];



return (
    <>
      <section>

        <div className="container px-6 pt-6 mx-auto flex justify-center overflow-auto">
          
          <div className="w-full md:w-2/3 lg:w-1/2 full bg-stone-900/50 backdrop-blur-sm rounded-2xl flex flex-col relative z-10 shadow-2xl overflow-hidden">
            <div className="flex items-center bg-yellow-500 rounded-t-2xl flex-col items-start px-6 py-5">
              <img src={logo} className="object-contain h-12 md:h-12" alt="Down Bad" />
              <img src={subLogo} className="object-contain h-5 md:h-5" alt="Manhattan's Most Memed" />
            </div>
            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex space-x-1 p-3">
              {['Browse 📍', 
              'Top 10 🤡', 
              'Search 🔎'].map((category, index) => (
                  <Tab
                  key={category}
                  onClick={() => {
                    setActiveTab(index);
                        map.flyTo({
                            center: [-73.991344, 40.728110],
                            zoom: 14,
                        });
                }}
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
            <Tab.Panels
              className={classNames(
                
              )}
            >              
            <Tab.Panel
                className={classNames()}
              ></Tab.Panel>
              <Tab.Panel
                  locations={top10Locations}
                  className={classNames(
                    'rounded-xl bg-gray bg-opacity-20 tab-panel-transition',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
                  )}
                  map={map}
                  data={data}

                  >
                  <ul className="w-full text-left p-2 max-h-48 overflow-y-auto">
                    {top10Locations.map((restaurant, index) => {
                      const emojiCount = Math.round(restaurant.score / 5);
                      return (
                        <li
                          key={index}
                          className="mb-2 py-2 text-yellow-500 font-black text uppercase flex justify-between items-center border-b border-yellow-200 border-opacity-20 cursor-pointer hover:bg-yellow-500 hover:bg-opacity-30 hover:border-opacity-100"
                          onClick={() => {
                            triggerMapClick(restaurant.name, data);
                            presentDrawer();
                          }}                                    >
                          <span className="ml-2">#{index + 1}: {restaurant.name}</span>
                          <span className="mr-2">
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
                  className="relative bottom-0 w-full bg-yellow-500 hover:bg-yellow-600 py-4 px-4 text-black font-medium flex items-center justify-center"
                >
                  <span>Dive into the Down Bad 📍</span>
                  <img src={closeIcon} className="absolute right-3 h-6 w-6 fill-current text-gray-500" alt="Close" />
                </button>
                </Tab.Panel>

              <Tab.Panel
                className={classNames(
                  'rounded-xl p-3 tab-panel-transition',
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
      <Drawer buttonData={buttonData} onFlyToButtonClick={handleFlyToButtonClick} posts={postsData} />
    </>
  );
};

export default MainContent;