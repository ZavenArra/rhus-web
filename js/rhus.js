
rhus = {};

rhus.navigation = new Class({
  activePage: 'map',
  pages:      ['map', 'getInvolved', 'timeline', 'about'],


  initialize: function(){
    document.id('mapButton').addEvent('click', this.menuCallback('map').bind(this));
    document.id('getInvolvedButton').addEvent('click', this.menuCallback('getInvolved').bind(this));
    document.id('timelineButton').addEvent('click', this.menuCallback('timeline').bind(this));
    document.id('aboutButton').addEvent('click', this.menuCallback('about').bind(this));

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
      event.target.getParent().addClass('active');

    };

  }

});

rhus.contentProvider = new Class({
  database: "squirrels_of_the_earth",
  urlPrefix: "/couchdb/",
  viewPath: "_design/design/_view/all",
  update_seq:  0, //database sequence number
  /*TODO: we'll want to track update_seq for each view that's being queried later on, 
   * or similar strategy for making sure subsequent request
   * */

  mapPoints : function(callback){

      var myJSONRemote = new Request.JSON({
      url: urlPrefix+database+viewPath,
      method: 'get', 
      onComplete: callback}).send();  

  }

});

rhus.map = new Class({

  map : null,
  osm : null, //OSM layer

  initialize: function(){
    this.map = new OpenLayers.Map( 'map');
    this.osm = new OpenLayers.Layer.OSM( "OSM Map Layer");
    this.map.addLayer(this.osm);
    this.map.setCenter(
      new OpenLayers.LonLat(-82.913, 42.417).transform(
        new OpenLayers.Projection("EPSG:4326"),
        this.map.getProjectionObject()
      ), 12
    );    
    this.map.addControl(new OpenLayers.Control.LayerSwitcher());
  },

  addMarkers: function(){


  },

  mapDataRequestCallback: function(responseJSON, responseText){
    console.log("mapDataRequestCallback");
    console.log(responseTEXT);
  }

});

var rhNavigation;
var rhMap;
window.addEvent( "domready", function(){
  console.log('Dom is Ready');
  rhNavigation = new rhus.navigation();
  rhMap = new rhus.map();
  //set bounds?
  rhMap.addMarkers();
});
