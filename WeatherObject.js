class WeatherObject {
    constructor(jsonObject, durationInt, departTime) {
        this.durationInt = durationInt;
        this.jsonObject = jsonObject;
        this.departTime = departTime;
        this.locationTime = new Date(departTime.getTime() + (durationInt * 60000));
    }

    formatTime() {
        var hours = this.locationTime.getHours();
        var minutes = this.locationTime.getMinutes();
        var ampm = hours >= 12 ? "pm" : "am";
        hours %= 12;
        // The hour 0 should be 12
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ":" + minutes + ' ' + ampm;
    }

    // TODO: grab weather things from the correct time frame. It is only
    // grabbing the current weather data
    getHTMLObject() {
        // Create the city tile
        var cityTile = document.createElement("div");
        cityTile.className = "city-tile";

        // Create the tile header
        var tileHeader = document.createElement("div");
        tileHeader.className = "tile-header";

        // Create the city name
        var toAppend = document.createElement("div");
        toAppend.className = "city";
        toAppend.appendChild(document.createTextNode(this.jsonObject.city));
        tileHeader.appendChild(toAppend);

        // Create the time
        toAppend = document.createElement("div");
        toAppend.className = "time";
        toAppend.appendChild(document.createTextNode(this.formatTime()));
        tileHeader.appendChild(toAppend);

        // Create the temp and weather icon
        toAppend = document.createElement("div");
        toAppend.className = "temp";
        var temp = parseInt(this.jsonObject.current.temp);
        // The char code for the degree symbol is 176
        toAppend.appendChild(document.createTextNode(temp.toString() + String.fromCharCode(176)));
        var weatherIcon = document.createElement("img");
        weatherIcon.src = "http://openweathermap.org/img/wn/" + this.jsonObject.current.weather[0].icon + "@2x.png";
        toAppend.appendChild(weatherIcon);
        tileHeader.appendChild(toAppend);

        // Create the arrow icon
        toAppend = document.createElement("div");
        toAppend.className = "arrow";
        var arrowIcon = document.createElement("img");
        arrowIcon.className = "expand-arrow-icon";
        arrowIcon.src = "expand-arrow.svg";
        arrowIcon.alt = "Expand arrow";
        toAppend.appendChild(arrowIcon);
        tileHeader.appendChild(toAppend);

        // Add the tile header
        cityTile.appendChild(tileHeader);

        // Create the tile contents
        var tileContents = document.createElement("div");
        tileContents.className = "tile-contents";

        //Create wind speed
        toAppend = document.createElement("p");
        var description = (this.jsonObject.current.weather[0].description);
        description = description.charAt(0).toUpperCase() + description.substring(1);
        toAppend.appendChild(document.createTextNode(description));
        tileContents.appendChild(toAppend);

        //Create wind speed
        toAppend = document.createElement("p");
        toAppend.appendChild(document.createTextNode("Wind speed: " + this.jsonObject.current.wind_speed + " mph"));
        tileContents.appendChild(toAppend);

        //Create humidity
        toAppend = document.createElement("p");
        toAppend.appendChild(document.createTextNode("Humidity: " + this.jsonObject.current.humidity + "%"));
        tileContents.appendChild(toAppend);

        //Create visibility
        toAppend = document.createElement("p");
        var visibility = parseFloat(this.jsonObject.current.visibility);
        visibility /= 1000;
        toAppend.appendChild(document.createTextNode("Visibility: " + visibility.toString() + " km"));
        tileContents.appendChild(toAppend);

        // Add the tile contents
        cityTile.appendChild(tileContents);

        // Add the event listener for the arrow icon
        tileHeader.addEventListener("click", function () {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
            let arrow = this.getElementsByClassName("arrow")[0];
            if (arrow.style.transform) {
                arrow.style.transform = null;
            } else {
                arrow.style.transform = "rotate(0.5turn)";
            }
        });

        return cityTile;
    }
}