var map;

function init() {

	map = new OpenLayers.Map({
div: "map",
allOverlays: true
maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34), maxResolution: 156543, units: 'meters', projection: "EPSG:41001"
});

var osm = new OpenLayers.Layer.OSM("Open Layers");

		var gmap = new OpenLayers.Layer.Google("Google Streets");

// note that first layer must be visible
     map.addLayers([osm,gmap]);

    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();

             }

