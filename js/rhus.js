
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
  startKey: null,

  mapPoints : function(callback){

    url = this.urlPrefix + this.database + '/' + this.viewPath + "?update_seq=true&startKey="+this.startKey;
    console.log("CouchDB: "+url);
    var myJSONRemote = new Request.JSON({
      url: url,
      method: 'get', 
    onComplete: this.requestCallback(callback).bind(this) }).send();  

  },

  requestCallback : function(callerCallback){
    return function(responseJSON){
      console.log("Response from couch");
      console.log(responseJSON);
      this.update_seq = responseJSON.update_seq;
      responseJSON.rows.each(function(row){
        this.startKey = row.value.id;   //This assumes a response sorted by startKey, actually no good
                                        //instead this should run the whole query again, or use _changes somehow
      });
      console.log("Calling callback" + callerCallback);
      return callerCallback(responseJSON);
     // return callback(callerCallback, responseJSON);
    }
  },

  getThumbSrc : function(id){
     return 'couchdb/'+this.database+'/'+id+'/thumb.jpg';
  }

});

rhus.map = new Class({

  map : null,
  osm : null, //OSM layer
  provider : null,
  icon : null,
  markers : null,

  initialize: function(contentProvider){
    this.provider = contentProvider;

    this.map = new OpenLayers.Map( 'map');

    this.osm = new OpenLayers.Layer.OSM( "OSM Map Layer");
    this.map.addLayer(this.osm);

    //Add Other Layers
    //topo = new OpenLayers.Layer.OSM( "OSM Map Layer");
    //this.map.addLayer(topo);


    this.map.setCenter(
      new OpenLayers.LonLat(-82.913, 42.417).transform(
        new OpenLayers.Projection("EPSG:4326"),
        this.map.getProjectionObject()
      ), 12
    );    
    this.markers = new OpenLayers.Layer.Markers( "Plants" );
    this.map.addLayer(this.markers);

    //map icons
    var size = new OpenLayers.Size(11,10);
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    this.icon = new OpenLayers.Icon('resources/mapPoint.png', size, offset);

    this.map.addControl(new OpenLayers.Control.LayerSwitcher());

    $('calloutCloseButton').addEvent('click', function(event){
      event.stop();
      event.target.getParent().style.display = "none";
      console.log("Closing Callout");
    });

    //Initialize here differet markers the map may need
    console.log("Initialized");
  },

  addMarkers: function(){
    console.log("Called addMarkers");
    callback = this.getMapDataRequestCallback(this);
    this.provider.mapPoints(callback);
  },

  getMapDataRequestCallback: function(receiver){

    return function(responseJSON){
      //console.log("mapDataRequestCallback");
      //console.log(responseJSON);

      responseJSON.rows.each(function(row){
        longitude = row.value.longitude;
        latitude = row.value.latitude;
        lonlat = new OpenLayers.LonLat(longitude, latitude).transform(
          new OpenLayers.Projection("EPSG:4326"),
          receiver.map.getProjectionObject());

        marker = new OpenLayers.Marker(lonlat,receiver.icon.clone());
        marker.events.register('mousedown', marker, function(evt) { receiver.showCallout(evt.element, lonlat, row.value.id); OpenLayers.Event.stop(evt); });
        receiver.markers.addMarker(marker);
      });
    }
  },

  showCallout: function(mapPointElement, lonlat, id){
     callout = $('callout');
     calloutThumbnail = callout.getElementById('calloutThumbnail');;
     calloutThumbnail.src = this.provider.getThumbSrc(id);
     callout.inject(mapPointElement);
     callout.style.display ="block";

  },

  hideCallout: function(mapPointElement, lonlat, id){

  }




});

var rhNavigation;
var rhMap;
window.addEvent( "domready", function(){
  console.log('Dom is Ready');
  rhNavigation = new rhus.navigation();
  rhMap = new rhus.map( new rhus.contentProvider() );
  //set bounds?
  rhMap.addMarkers();
});
