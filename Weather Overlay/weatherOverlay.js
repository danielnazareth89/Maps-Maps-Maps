Ext.onReady(function () {
    var api = null;
    var el = 'ext-map';
    var geoCoder = null;
    var address = null;
    var geoJSON = null;
    var request = null;
    var gettingData = false;
    var openWeatherMapKey = "7ed572618bbd74ffc436306f2ed23c18";
    var listener = null;
    var marker = null;
    var w = Ext.create('Ext.Panel', {
        renderTo: el,
        title: 'Gmap',
        height: 600,
        width: 800,
        layout: 'border',
        items: [{
            title: 'Message List',
            region: 'south',
            height: 50,

            split: true,
            collapsible: true,
            margins: '0 5 5 5',
            collapsed: true
        }, {
            region: 'west',
            title: 'Weather',
            collapsible: true,
            width: 200,
            items: [{
                xtype: 'textarea',
                id: 'location',
                fieldLabel: 'Location:',

                 
            }, {
                xtype: 'button',
                id: 'geolocate',
                text: 'Overlay Weather',
                handler: overlayWeather // reference to event handler function 
            }, {
                xtype: 'button',
                id: 'weather',
                text: 'Clear',
                handler: clear // reference to event handler function 
            }]
        }, {
            xtype: 'gmappanel',
            id: 'mygooglemap',
            region: 'center',
            cls: 'reset-box-sizing',
            center: new google.maps.LatLng(25, 25),
            mapOptions: {
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }

        }]
    });





    function overlayWeather() {

        address = Ext.getCmp('location').getValue();

        geoCoder = new google.maps.Geocoder();
        api = Ext.getCmp('mygooglemap').gmap;

        geoCoder.geocode({
            'address': address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                api.setCenter(results[0].geometry.location);
                marker = new google.maps.Marker({
                    map: api,
                    position: results[0].geometry.location
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });


        api = Ext.getCmp('mygooglemap').gmap;
        if (listener) {
            listener.remove();
        }
        listener = google.maps.event.addListener(Ext.getCmp('mygooglemap').gmap, 'idle', function (event) {


            // Stop extra requests being sent
            while (gettingData === true) {
                request.abort();
                gettingData = false;
            }
            getCoords();

        });
        //   checkIfDataRequested();
       
        api.data.addListener('click', function (event) {
            
            infowindow.setContent(
                "<img src=" + event.feature.getProperty("icon") + ">" + "<br /><strong>" + event.feature.getProperty("city") + "</strong>" + "<br />" + event.feature.getProperty("temperature") + "&deg;C" + "<br />" + event.feature.getProperty("weather"));
            infowindow.setOptions({
                position: {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                },
                pixelOffset: {
                    width: 0,
                    height: -15
                }
            });
            infowindow.open(api);
        });

        // Get the coordinates from the Map bounds
        var getCoords = function () {

            var bounds = api.getBounds();
            var NE = bounds.getNorthEast();
            var SW = bounds.getSouthWest();
            getWeather(NE.lat(), NE.lng(), SW.lat(), SW.lng());
        };

        var getWeather = function (northLat, eastLng, southLat, westLng) {

            gettingData = true;
            var requestString = "http://api.openweathermap.org/data/2.5/box/city?bbox=" + westLng + "," + northLat + "," //left top
            +
            eastLng + "," + southLat + "," //right bottom
            +
            api.getZoom() + "&cluster=yes&format=json" + "&APPID=" + openWeatherMapKey;

            request = new XMLHttpRequest();
            request.onload = proccessResults;
            request.open("get", requestString, true);
            request.send();
        };
        // Take the JSON results and proccess them
        var proccessResults = function () {

            console.log(this);
            var results = JSON.parse(this.responseText);
            if (results.list.length > 0) {
                resetData();
                for (var i = 0; i < results.list.length; i++) {
                    geoJSON.features.push(jsonToGeoJson(results.list[i]));
                }
                drawIcons(geoJSON);
            }
        };

        var infowindow = new google.maps.InfoWindow();
        // For each result that comes back, convert the data to geoJSON
        var jsonToGeoJson = function (weatherItem) {

            var feature = {
                type: "Feature",
                properties: {
                    city: weatherItem.name,
                    weather: weatherItem.weather[0].main,
                    temperature: weatherItem.main.temp,
                    min: weatherItem.main.temp_min,
                    max: weatherItem.main.temp_max,
                    humidity: weatherItem.main.humidity,
                    pressure: weatherItem.main.pressure,
                    windSpeed: weatherItem.wind.speed,
                    windDegrees: weatherItem.wind.deg,
                    windGust: weatherItem.wind.gust,
                    icon: "http://openweathermap.org/img/w/" + weatherItem.weather[0].icon + ".png",
                    coordinates: [weatherItem.coord.lon, weatherItem.coord.lat]
                },
                geometry: {
                    type: "Point",
                    coordinates: [weatherItem.coord.lon, weatherItem.coord.lat]
                }
            };
            // Set the custom marker icon
            api.data.setStyle(function (feature) {
                return {
                    icon: {
                        url: feature.getProperty('icon'),
                        anchor: new google.maps.Point(25, 25)
                    }
                };
            });
            return feature;
        };

        // Add the markers to the map
        var drawIcons = function (weather) {
            api.data.addGeoJson(geoJSON);
            // Set the flag to finished
            gettingData = false;
        };
        // Clear data layer and geoJSON
        var resetData = function () {
            geoJSON = {
                type: "FeatureCollection",
                features: []
            };
            api.data.forEach(function (feature) {
                api.data.remove(feature);
            });
        };
    }

    function clear() {

        Ext.getCmp('location').reset();
        listener.remove();
        marker.setMap(null);
        api.data.forEach(function (feature) {
            api.data.remove(feature);
        });




    }

    w.show();
});
