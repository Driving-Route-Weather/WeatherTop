let map;
var directionsService;
var directionsRenderer;
var geocoder;
var API_KEY = '753ad43c3b0a6502b5b443cab998a11e';
const weatherIntervals = {
    CURRENT: "current",
    MINUTELY: "minutely",
    HOURLY: "hourly",
    DAILY: "daily"
}


function initMap() {
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    });
    directionsRenderer.setMap(map);

    getWeather(0,0,weatherIntervals.CURRENT);
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
            console.log(result);
            directionsRenderer.setDirections(result);
        }
    });
}

function getWeather(lat, lon, interval) {
    var intervalsToExclude = [weatherIntervals.CURRENT, weatherIntervals.MINUTELY, weatherIntervals.HOURLY, weatherIntervals.DAILY]

    const index = intervalsToExclude.indexOf(interval);
    if (index > -1) {
        intervalsToExclude.splice(index, 1);
    }

    var fullURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=${intervalsToExclude}&appid=${API_KEY}`;
    //console.log(fullURL);
    fetch(fullURL)
    .then(function(response) {
      return response.json();
    }).then(function(json) {
      //console.log(json);
      return json;
    });
}

window.onload = () => {
    document.getElementById('travel-form').addEventListener('submit', calcRoute);
}