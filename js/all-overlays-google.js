var map;

function init() {

  var map, layer;
  function init(){
    map = new OpenLayers.Map( 'map');
    layer = new OpenLayers.Layer.OSM( "Simple OSM Map");
    map.addLayer(layer);
    map.setCenter(
      new OpenLayers.LonLat(-83, 42.472).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
      ), 12
    );    
  }
}

init();
