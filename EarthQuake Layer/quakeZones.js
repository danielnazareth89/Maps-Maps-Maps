 Ext.onReady(function () {
     var el = 'ext-map';
     var api = null;
     var storeZoom = null;
     var panLefter = null;
     var quakeZoneLayer = null;
     var w = Ext.create('Ext.Panel', {
         renderTo: el,
         title: 'Gmap',
         height: 600,
         width: 800,
         layout: 'border',
         items: [{
             region: 'west',
             title: 'QuakeZones',
             collapsible: true,
             width: 200,
             items: [{
                 xtype: 'button',
                 text: 'Show QuakeZones',
                 handler: showQuakeZones // reference to event handler function 
             }, {
                 xtype: 'button',
                 text: 'Clear QuakeZones',
                 handler: clearQuakeZones // reference to event handler function 
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

     function showQuakeZones() {


         api = Ext.getCmp('mygooglemap').gmap;
         storeZoom = api.getZoom();

         if (quakeZoneLayer) {
             quakeZoneLayer.setMap(null);
         }
         quakeZoneLayer = new google.maps.KmlLayer({

             url: 'http://services.google.com/earth/kmz/realtime_earthquakes_n.kmz',

         });

         quakeZoneLayer.setMap(api);

         /*NOTE ON panLefter: When Kml Layers are overlayed(shipping or timezone), the layers are autoloaded to the left of the viewport, out-of-sight to the user. The panLefter listener listens for when the 
       layer has finished loading('tilesloaded' event), then pans left so that the layer is well within the viewport of the user.*/

         panLefter = new google.maps.event.addListenerOnce(api, 'tilesloaded', function (event) {


             api.panBy(-1600, 0);




         });


     }

     function clearQuakeZones() {


         panLefter.remove();
         quakeZoneLayer.setMap(null);

         api.setZoom(3);

     }


     w.show();
 });
