var map;

function init() {

    map = new OpenLayers.Map({
        div: "map",
        allOverlays: true
    });

		var osm = new OpenLayers.Layer.OSM("Open Street Map", {visibilty: true},
				{'layers': 'basic'},
				{'maxExtent': new OpenLayers.Bounds(42.385937, -82.946434, 42.379344, -83.266068),
				'maxResolution': "auto"});


		var gmap = new OpenLayers.Layer.Google("Google Streets", {visibility: true});
		
    // note that first layer must be visible
    map.addLayers([ osm, gmap]);

    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();

}
