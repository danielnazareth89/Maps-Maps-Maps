Ext.onReady(function () {
    var el = 'ext-map';
    var from = null;
    var to = null;
    var dirSvc = null;
    var dirDsp = null;
    var dirDspArray = [];
    var travelMethod = null;
    var api = null;
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
            title: 'Directions',
            collapsible: true,
            width: 200,
            items: [{
                xtype: 'textarea',
                id: 'mapWidgetFrom',
                fieldLabel: 'From',
                width: 200
            }, {
                xtype: 'textarea',
                id: 'mapWidgetTo',
                fieldLabel: 'To',
                width: 200
            }, {
                xtype: 'combo',
                fieldLabel: 'Travel Method',
                id: 'mapWidgetTravelMethod',
                value: 'DRIVING',
                name: 'Travel Method',
                queryMode: 'local',
                store: ['DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT'],
                displayField: 'title',
                autoSelect: true,
                forceSelection: true,
                matchFieldWidth: true,
                listConfig: {
                    maxHeight: 150
                }

            }, {

                xtype: 'button',
                text: 'Get Directions',
                handler: findRoute


            }, {

                xtype: 'button',
                text: 'Reset',
                handler: resetDirections


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

    function findRoute() { //renders directions for the Directions Widget with the help of GMaps Directions API. Called by clicking the 'Get Directions' button.

       


        from = Ext.getCmp('mapWidgetFrom').getValue();
        to = Ext.getCmp('mapWidgetTo').getValue();
        dirSvc = new google.maps.DirectionsService();
        dirDsp = new google.maps.DirectionsRenderer();
        travelMethod = Ext.getCmp('mapWidgetTravelMethod').getValue();
        
        var directionsRequest = {
            origin: from,
            destination: to,
            travelMode: google.maps.DirectionsTravelMode[travelMethod],
            unitSystem: google.maps.UnitSystem.IMPERIAL
        };
        api = Ext.getCmp('mygooglemap').gmap;
        


        dirSvc.route(
        directionsRequest,

        function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {

                document.getElementById('textDirections').innerHTML = "";
                dirDsp.setMap(api);
                document.getElementById('textDirections').style.display = 'block';
                dirDsp.setPanel(document.getElementById('textDirections'));
                dirDsp.setDirections(response);
                dirDspArray.push(dirDsp);

            } else {
                alert('unable to retrieve');
            }
        });





    }

    function resetDirections() { //clears all Directions for the Directions Widget. Called by clicking the 'Reset' button

        Ext.getCmp('mapWidgetFrom').reset();
        Ext.getCmp('mapWidgetTo').reset();

        while (dirDspArray.length > 0) {

            dirDsp = dirDspArray.pop();

            dirDsp.setMap(null);
            dirDsp.setPanel(null);
        }
        document.getElementById('textDirections').style.display = 'none';


    }





    w.show();
});
