
rhus = {};

rhus.navigation = new Class({
  activePage: 'map',
  pages:      ['map', 'getInvolved', 'timeline', 'about'],


  initialize: function(){
    document.id('mapButton').addEvent('click', this.menuCallback('map').bind(this));
    document.id('getInvolvedButton').addEvent('click', this.menuCallback('getInvolved').bind(this));
    document.id('timelineButton').addEvent('click', this.menuCallback('timeline').bind(this));
    //document.id('aboutButton').addEvent('click', this.menuCallback('about').bind(this));

    $('aboutButton').addEvent('click', function(e) {
      console.log("In event");
      e.stop();

      //var url = "lipsum.html";
      var url = "/couchdb/squirrels_of_the_earth/_design/design/_view/all";
      //var url = "squirrels_of_the_earth/_design/design/_view/all";

      var myJSONRemote = new Request.JSON({
      url: url,
      method: 'get', 
      onComplete: function(response){console.log(response+"whatever")}}).send();  //this.mapDataRequestCallback});

    });
  },

  mapDataRequestCallback: function(responseJSON, responseText){
    console.log("mapDataRequestCallback");
    console.log(responseTEXT);
  },

  

  addMarkers: function() {

  },

  menuCallback: function(showPage){

    return  function(event){
      event.stop();
      if(this.currentPage == showPage){
        return;
      }

      this.pages.each(function(page){
        $(page).style.display = "none";
        $(page+'Button').removeClass('active');
      });
      $(showPage).style.display = "block";
      this.currentPage = showPage;
      console.log('Adding Class');
      event.target.addClass('active');

    };

  }

});

rhus.contentProvider = new Class({
  database: "squirrels_of_the_earth",

  allMapPoints : function(){
  }
});

rhus.map = new Class({

  map,
  layer,

  initialize: function(){
    map = new OpenLayers.Map( 'map');
    osm = new OpenLayers.Layer.OSM( "OSM Map Layer");
    map.addLayer(osm);
    map.setCenter(
      new OpenLayers.LonLat(-82.913, 42.417).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
      ), 12
    );    
    map.addControl(new OpenLayers.Control.LayerSwitcher());
  }

});

var navigation;
var map;
window.addEvent( "domready", function(){
  console.log('Dom is Ready');
  navigation = new rhus.navigation();
  map = new rhus.map();
});
