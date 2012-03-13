var map;

function init() {

    map = new OpenLayers.Map({
        div: "map",
        allOverlays: true
    });

	
		var gmap = new OpenLayers.Layer.Google("Google Streets", {visibility: true},
				{'layers': 'basic'},
				{'maxExtent': new OpenLayers.Bounds(-83.1,42.4,-83,42), 
				'maxResolution': 156543,
				units: 'meters'});
		
		var osm = new OpenLayers.Layer.OSM("Open Street Map", {visibilty:false});
    // note that first layer must be visible
    map.addLayers([gmap, osm]);

    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();

}
