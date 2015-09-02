Ext.onReady(function () {
    var el = 'ext-map';
    var api = null;
    var marker = null;
    var address = null;
    var boundedBox = null;
    var bboxArray = [];
    var boxBoundaries = null;
    var w = Ext.create('Ext.Panel', {
        renderTo: el,
        title: 'Gmap',
        height: 600,
        width: 800,
        layout: 'border',
        items: [{
            region: 'west',
            title: 'Geofencing',
            collapsible: true,
            width: 200,
            items: [{
                xtype: 'textarea',
                id: 'location',
                fieldLabel: 'Location:',

                handler: addInfoWindow // reference to event handler function 
            }, {
                xtype: 'button',
                text: 'Draw Fence',
                handler: drawFence // reference to event handler function 
            }, {
                xtype: 'button',
                text: 'Clear Fence',
                handler: clearFence // reference to event handler function 
            }]
        }, {
            xtype: 'gmappanel',
            id: 'mygooglemap',
            region: 'center',
            cls: 'reset-box-sizing',
            center: new google.maps.LatLng(53.5267, -1.13330),
            mapOptions: {
                zoom: 6,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
        }]
    });



    // get the map reference
    var map = w.down('gmappanel');

    function openInfoWindow(content, marker) {
        // create a info window
        var infowindow = new google.maps.InfoWindow({
            content: content,
            size: new google.maps.Size(50, 50)
        });

        infoBubble = new InfoBubble({
            content: '<div class="example">Some label</div>',
            //position: new google.maps.LatLng(53.5267, newlong),
            shadowStyle: 1,
            padding: 10,
            borderRadius: 5,
            minWidth: 200,
            borderWidth: 1,
            //borderColor: '#2c2c2c',
            disableAutoPan: true,
            hideCloseButton: false,
            backgroundClassName: 'example',
            //arrowSize: 0,
            //arrowPosition:7,
            //arrowStyle:3
        });

        infoBubble.open(map.gmap, marker);

        var div = document.createElement('DIV');
        div.innerHTML = 'Hello';
        infoBubble.addTab('A Tab', div);
        infoBubble.addTab('A Tab', div);
        // All GMapPanel instances has the reference to the underlying googlemap object
        // porperty name `gmap`.        
        //infowindow.open(map.gmap, marker);        
    }

    function addInfoWindow() {
        // uses GMapPanel `addMarker` method to create a marker and attached it to tree.
        // Detailes - look at the source code of GMapPanel
        var marker = map.addMarker({
            lat: 53.5267,
            lng: -1.13330,
            title: 'Marker',
            // listeners can be added via configuration or after create 
            // using standard google maps API, i.e.
            // google.maps.event.addListener(marker, 'click', function() {...})            
            listeners: {
                click: function () {
                    openInfoWindow('hello', marker);
                }
            }
        });

    }

    function drawFence() {

        address = Ext.getCmp('location').getValue();

        geoCoder = new google.maps.Geocoder();
        api = Ext.getCmp('mygooglemap').gmap;

        geoCoder.geocode({
            'address': address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                api.setCenter(results[0].geometry.location);

                if (boundedBox) {
                    boundedBox.setMap(null);
                }
                var southWestBound = results[0].geometry.bounds.getSouthWest();
                var northEastBound = results[0].geometry.bounds.getNorthEast();

                boxBoundaries = [
                new google.maps.LatLng(northEastBound.lat(), northEastBound.lng()),
                new google.maps.LatLng(northEastBound.lat(), southWestBound.lng()),
                new google.maps.LatLng(southWestBound.lat(), southWestBound.lng()),
                new google.maps.LatLng(southWestBound.lat(), northEastBound.lng()),
                new google.maps.LatLng(northEastBound.lat(), northEastBound.lng())];

                boundedBox = new google.maps.Polygon({
                    path: boxBoundaries,
                    strokeColor: '#BBD8E9',
                    strokeOpacity: 1,
                    strokeWeight: 3,
                    fillColor: '#BBD8E9',
                    fillOpacity: 0.6
                });

                boundedBox.setMap(api);

                marker = new google.maps.Marker({
                    map: api,
                    position: results[0].geometry.location,
                    draggable: true
                });

                var position = marker.getPosition();
                var bounds = results[0].geometry.bounds;

                google.maps.event.addListener(marker, 'dragend', function (event) {


                    if (bounds.contains(marker.getPosition()) === false) {
                        alert('marker out of bounds!');
                    }

                });


                if (results[0].geometry.bounds) {
                    api.fitBounds(results[0].geometry.bounds);
                } else {
                    api.setCenter(results[0].geometry.location).setZoom(15);
                }

            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });

    }

    function clearFence() {

        Ext.getCmp('location').reset();
        boundedBox.setMap(null);
        marker.setMap(null);

    }

    w.show();
});
