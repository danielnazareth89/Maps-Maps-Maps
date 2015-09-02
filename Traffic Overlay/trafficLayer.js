Ext.onReady(function () {
    var el = 'ext-map';
    var trafficLayerArray = [];
    var api = null;
    var address = null;
    var trafficLayer = null;
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
            title: 'Traffic',
            collapsible: true,
            width: 200,
            items: [{
                xtype: 'textarea',
                id: 'location',
                fieldLabel: 'Location'
            }, {
                xtype: 'button',
                text: 'Show Traffic!',
                handler: showTraffic // reference to event handler function 
            }, {
                xtype: 'button',
                text: 'Clear',
                handler: Clear // reference to event handler function 
            }]
        }, {
            xtype: 'gmappanel',
            region: 'center',
            id: 'mygooglemap',
            cls: 'reset-box-sizing',
            center: new google.maps.LatLng(53.5267, -1.13330),
            mapOptions: {
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
        }]
    });


    function showTraffic() {

        address = Ext.getCmp('location').getValue();

        geoCoder = new google.maps.Geocoder();
        api = Ext.getCmp('mygooglemap').gmap;

        geoCoder.geocode({
            'address': address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                api.setCenter(results[0].geometry.location);
                if (marker) {
                    marker.setMap(null);
                }
                marker = new google.maps.Marker({
                    map: api,
                    position: results[0].geometry.location
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });

        trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(api);
        trafficLayerArray.push(trafficLayer);

    }

    function Clear() {

        Ext.getCmp('location').reset();
        marker.setMap(null);
        while (trafficLayerArray.length > 0) {
            trafficLayer = trafficLayerArray.pop();
            trafficLayer.setMap(null);
        }

    }

    w.show();
});
