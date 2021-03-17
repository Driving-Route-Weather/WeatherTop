let map;
var directionsService;
var directionsRenderer;
var geocoder;

// change this to adjust the number of cities/locations sampled for weather data
var CITIES_LENGTH = 5;
var WEATHER_API_KEY = '753ad43c3b0a6502b5b443cab998a11e';
const weatherIntervals = {
    CURRENT: "current",
    MINUTELY: "minutely",
    HOURLY: "hourly",
    DAILY: "daily"
}
var locationWeatherObjects = [];
var beginTime = 0;


function initMap() {
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    });
    directionsRenderer.setMap(map);
}

function calcRoute(event) {
    event.preventDefault();
    var origin = document.getElementById('origin').value;
    var destination = document.getElementById('destination').value;
    var departTime = document.getElementById('start-time').value;
    if (departTime) {
        departTime = new Date(departTime);
    } else {
        departTime = new Date();
    }
    beginTime = departTime;
    var request = {
        origin: origin,
        destination: destination,
        drivingOptions: {
            departureTime: departTime,
        },
        travelMode: 'DRIVING',
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            locationWeatherObjects = [];
            document.getElementsByClassName("city-list")[0].innerHTML = "";
            console.log(result);
            directionsRenderer.setDirections(result);
            step = Math.floor(result.routes[0].overview_path.length / CITIES_LENGTH);
            for (i = 1; i < CITIES_LENGTH; i++) {
                latlon = result.routes[0].overview_path[i * step];
                duration = getWeatherFromLatLon(event, latlon);
            }
            console.log(result.routes[0].legs[0].end_location);
            getWeatherPrep(result, result.routes[0].legs[0].end_location);
        }
    });
}

function getWeatherFromLatLon(event, latlon) {
    event.preventDefault();
    var origin = document.getElementById('origin').value;
    var destination = latlon;
    var departTime = document.getElementById('start-time').value;
    if (departTime) {
        departTime = new Date(departTime);
    } else {
        departTime = new Date();
    }
    var request = {
        origin: origin,
        destination: destination,
        drivingOptions: {
            departureTime: departTime,
        },
        travelMode: 'DRIVING',
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            getWeatherPrep(result, latlon);
        }
    });
}

function getPoliticalTypes(address) {
    return address.types.includes("political");
}

// this is not working because it is not free (╯°□°）╯︵ ┻━┻
// this could have been a better way to turn latlon objects into city names
function getReverseGeocoding(latlon) {
    var fullURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlon.lat()},${latlon.lng()}&key=AIzaSyBIwzALxUPNbatRBj3Xi1Uhp0fFzwWNBkE`;
    fetch(fullURL)
        .then(function (response) {
            return response.json();
        }).then(function (json) {
            console.log(json);
            location = json.address_components.filter(getPoliticalTypes)[0];
            return location;
        });
}

function getWeatherPrep(routeResult, latlon) {
    var duration_result = routeResult.routes[0].legs[0].duration.text;
    var city_result = routeResult.routes[0].legs[0].end_address;
    //the following comment is an option if we can figure out a free version
    //work around is calling directionsService.route multiple times 
    //to get duration times and end addresses
    //city = getReverseGeocoding(latlon);
    getWeather(latlon, duration_result, city_result);
}

function getWeather(latlon, duration, city) {
    var intervalsToExclude = []
    // Uncomment to exclude intervals
    // var intervalsToExclude = [weatherIntervals.CURRENT, weatherIntervals.MINUTELY, weatherIntervals.HOURLY, weatherIntervals.DAILY]
    // const index = intervalsToExclude.indexOf(interval);
    // if (index > -1) {
    //     intervalsToExclude.splice(index, 1);
    // }

    var fullURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latlon.lat()}&lon=${latlon.lng()}&units=imperial&exclude=${intervalsToExclude}&appid=${WEATHER_API_KEY}`;
    fetch(fullURL)
        .then(function (response) {
            return response.json();
        }).then(function (json) {
            json["duration"] = duration;
            json["city"] = city;
            onWeatherRecieved(json);
        });
}

function convertDurationToMinutes(duration) {
    var words = duration.split(" ");
    var totalTime = 0;
    if (words[1] == "day") {
        totalTime += parseInt(words[0]) * 1440;
        if (words.length > 2) {
            totalTime += parseInt(words[2]) * 60;
        }
    } else if (words[1] == "hours") {
        totalTime += parseInt(words[0]) * 60;
        if (words.length > 2) {
            totalTime += parseInt(words[2]);
        }
    } else {
        totalTime += parseInt(words[0]);
    }
    return totalTime;
}

// Parses weather API json response. See here for more details
// https://openweathermap.org/current#current_JSON
function parseWeatherResponse(response) {
    var minutes = convertDurationToMinutes(response.duration);
    var weatherObject = new WeatherObject(response, minutes, beginTime);
    locationWeatherObjects.push(weatherObject);
}

// callback for each individual weather api call
function onWeatherRecieved(response) {
    parseWeatherResponse(response);
    if (locationWeatherObjects.length == CITIES_LENGTH) {
        locationWeatherObjects.sort(function (a, b) {
            if (a.durationInt > b.durationInt) {
                return 1;
            } else if (a.durationInt < b.durationInt) {
                return -1;
            } else {
                return 0;
            }
        });
        locationWeatherObjects.forEach(function (item, index) {
            document.getElementsByClassName("city-list")[0].appendChild(item.getHTMLObject());
        });
        console.log(locationWeatherObjects);
    }
}

window.onload = () => {
    document.getElementById('travel-form').addEventListener('submit', calcRoute);
}
