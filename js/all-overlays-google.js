var map;

function init() {

	map = new OpenLayers.Map({
div: "map",
allOverlays: true
});

var osm = new OpenLayers.Layer.OSM("Open Layers",                                            
		null,
		{'layers':'basic'},
		{'maxExtent': new OpenLayers.Bounds(-83.266068,42.379344,-82.913132,42.417881), 
		'maxResolution': "auto"});

var gmap = new OpenLayers.Layer.Google("Google Streets", {visibility: false});

// note that first layer must be visible
     map.addLayers([osm, gmap]);

    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();

             }

