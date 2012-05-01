
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
  viewPath: "_view/galleryDocuments",
  update_seq:  -1, //database sequence number
  callerCallback: null,

  /*TODO: we'll want to track update_seq for each view that's being queried later on, 
  * or similar strategy for making sure subsequent request
  * */
  startKey: null,


  mapPoints : function(callback){

    url = rhusConfiguration.urlPrefix + this.viewPath + "?update_seq=true&startKey="+this.startKey;
    console.log("CouchDB: "+url);

    console.log(callback);
    this.callerCallback = callback;
    console.log(this.callerCallback);
    this.requery();

    //Set Timeout to update the map
    this.timer = this.requery.bind(this).periodical(rhusConfiguration.refreshRate);
  },


  requestCallback : function(callerCallback){
    return function(responseJSON){
      console.log('callback triggered'+this.update_seq);

      if(this.update_seq || (responseJSON.update_seq > this.update_seq)){
        console.log("Got New Data");
        this.update_seq = responseJSON.update_seq;
        return this.callerCallback(responseJSON);
      }
     // return callback(callerCallback, responseJSON);
    }
  },

  requery : function(){

    console.log("Requery");

    console.log(this.callerCallback);

    var myJSONRemote = new Request.JSON({
      url: url,
      method: 'get', 
      data: {
        json: 'yes'
      },
  //  onComplete: this.requestCallback(this.callerCallback).bind(this) }).send();  
    onComplete: this.requestCallback(this.callerCallback).bind(this) }).send();  


  },

  getThumbSrc : function(id){
    console.log(rhusConfiguration.urlPrefix + '_show/thumb/'+id);
    return rhusConfiguration.urlPrefix + '_show/thumb/'+id;
  }

});

rhus.map = new Class({

  layers : [], //TODO: refactor all layers into array
  map : null,
  osm : null, //OSM layer
  gsta: null,
  provider : null,
  icon : null,
  markers : null,
  timer : null,
	milkbox : null,

  initialize: function(contentProvider){
  
    this.provider = contentProvider;

    this.map = new OpenLayers.Map( 'map');

    this.osm = new OpenLayers.Layer.OSM( "Open Street Map Layer");

    // defined for javascript.
    if(! (typeof google === 'undefined') ){
      var gmap = new OpenLayers.Layer.Google("Google Streets Layer", {visibility: false});
    }

    //Add Other Layers
    //topo = new OpenLayers.Layer.OSM( "OSM Map Layer");
    //this.map.addLayer(topo);
    //
    
    //Topo
    /*
    var drg = new OpenLayers.Layer.WMS("Topo Maps",
      "http://terraservice.net/ogcmap.ashx",
    {layers: "DRG"});
    this.map.addLayer(drg);
    */

    //Shaded Relief
    /*
    shade = new OpenLayers.Layer.WMS("Shaded Relief",
      "http://ims.cr.usgs.gov:80/servlet19/com.esri.wms.Esrimap/USGS_EDC_Elev_NED_3", 
    {layers: "HR-NED.IMAGE", reaspect: "false", transparent: 'true'},
    {
      opacity: 0.5,
      singleTile: true
    }
    );
    this.map.addLayer(shade);
*/
    
    
    /*
    var nasa = new OpenLayers.Layer.WMS("NASA Global Mosaic",
      "http://wms.jpl.nasa.gov/wms.cgi",
    {layers: "modis,global_mosaic"});

    var nasa = new OpenLayers.Layer.WMS("NASA Global Mosaic",
      "http://wms.jpl.nasa.gov/wms.cgi",
      {
        layers: "modis,global_mosaic",
        transparent: true
      }, {
        opacity: 0.5,
        singleTile: true
      });
    */

/*
    var jpl_wms = new OpenLayers.Layer.WMS( "NASA Global Mosaic",
      "http://wms.jpl.nasa.gov/wms.cgi", 
    {layers: "global_mosaic"});
    this.map.addLayer(jpl_wms);
    */

    if(typeof google !== "undefined") {
      this.gsat = new OpenLayers.Layer.Google(
        "Google Satellite",
        {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
        // used to be {type: G_SATELLITE_MAP, numZoomLevels: 22}
      );
      this.map.addLayer(this.gsat);
    }

    //Add Detroit Overlay
    //And also for timelines...
    //These need to be defined in separate files and loaded per implementation
    //Detroit.js, Squirrels.js, etc.
    //

    //TODO: All layers should be added in the order that we want to show them
    this.map.addLayer(this.osm);
    this.map.addLayer(gmap);

    var styles = new OpenLayers.StyleMap({
      "default": new OpenLayers.Style(null, {
        rules: [
          new OpenLayers.Rule({
            symbolizer: {
              "Point": {
                pointRadius: 5,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 0.25,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#3333aa"
              },
              "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#6666aa"
              },
              "Polygon": {
                strokeWidth: 1,
                strokeOpacity: 1,
                fillColor: "#0099aa",
                strokeColor: "#6666aa"
              }
            }
          })
        ]
      }),
      "select": new OpenLayers.Style(null, {
        rules: [
          new OpenLayers.Rule({
            symbolizer: {
              "Point": {
                pointRadius: 5,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 0.25,
                strokeWidth: 2,
                strokeOpacity: 1,
                strokeColor: "#0000ff"
              },
              "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#0000ff"
              },
              "Polygon": {
                strokeWidth: 2,
                strokeOpacity: 1,
                fillColor: "#0000ff",
                strokeColor: "#0000ff"
              }
            }
          })
        ]
      }),
      "temporary": new OpenLayers.Style(null, {
        rules: [
          new OpenLayers.Rule({
            symbolizer: {
              "Point": {
                graphicName: "square",
                pointRadius: 5,
                fillColor: "white",
                fillOpacity: 0.25,
                strokeWidth: 2,
                strokeColor: "#0000ff"
              },
              "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#0000ff"
              },
              "Polygon": {
                strokeWidth: 2,
                strokeOpacity: 1,
                strokeColor: "#0000ff",
                fillColor: "#0000ff"
              }
            }
          })
        ]
      })
    });

 //   var studyAreaGeometry = new OpenLayers.Protocol.HTTP({
   //   url: "data/studyAreaLayer.json",
   //   format: new OpenLayers.Format.GeoJSON(
   //     {
   //       ignoreExtraDims: true
   //     }
   //   )
 //   });

//TODO: Don't reproject in javascript, just reproject the file using proj4, or something else
 //   var statePlaneProjection = new OpenLayers.Projection("EPSG:4269");
   // statePlaneProjection = new OpenLayers.Projection("EPSG:4326");
 //   var studyArea = new OpenLayers.Layer.Vector("Study Area Overlay", {
 //     strategies: [new OpenLayers.Strategy.Fixed()],                
 //     projection: statePlaneProjection,
 //     protocol: ,
 //     styleMap: styles
 //   });

 //   this.map.addLayer(studyArea);



    //Focus Areas
    var focusAreasStyles = new OpenLayers.StyleMap({
      "default": new OpenLayers.Style(null, {
        rules: [
          new OpenLayers.Rule({
            symbolizer: {
              "Point": {
                pointRadius: 5,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 0.25,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#3333aa"
              },
              "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#6666aa"
              },
              "Polygon": {
                strokeWidth: 1,
                strokeOpacity: 1,
                fillColor: "#0099aa",
                strokeColor: "#6666aa"
              }
            }
          })
        ]
      }),
      "select": new OpenLayers.Style(null, {
        rules: [
          new OpenLayers.Rule({
            symbolizer: {
              "Point": {
                pointRadius: 5,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 0.25,
                strokeWidth: 2,
                strokeOpacity: 1,
                strokeColor: "#0000ff"
              },
              "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#0000ff"
              },
              "Polygon": {
                strokeWidth: 2,
                strokeOpacity: 1,
                fillColor: "#0000ff",
                strokeColor: "#0000ff"
              }
            }
          })
        ]
      }),
      "temporary": new OpenLayers.Style(null, {
        rules: [
          new OpenLayers.Rule({
            symbolizer: {
              "Point": {
                graphicName: "square",
                pointRadius: 5,
                fillColor: "white",
                fillOpacity: 0.25,
                strokeWidth: 2,
                strokeColor: "#0000ff"
              },
              "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#0000ff"
              },
              "Polygon": {
                strokeWidth: 2,
                strokeOpacity: 1,
                strokeColor: "#0000ff",
                fillColor: "bbbb00"
              }
            }
          })
        ]
      })
    });


    var focusAreas = new OpenLayers.Layer.Vector("Timeline Zones", {
      strategies: [new OpenLayers.Strategy.Fixed()],                
      protocol: new OpenLayers.Protocol.HTTP({
        url: "data/focusAreasLayer.json",
        format: new OpenLayers.Format.GeoJSON()
      }),
      styleMap: focusAreasStyles
    });

    this.map.addLayer(focusAreas);






    this.map.setCenter(
      new OpenLayers.LonLat(-83.104019, 42.369959).transform(
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

    //Initialize here differet markers the map may need
    console.log("Initialized");
    
		console.log($('callout'));

		that = this;

		$('callout').getElementById('calloutCloseButton').addEvent('click', function(event){
				if (that.milkbox != null){
					console.log("destroying the milkbox");
					that.milkbox.display.destroy();
				}			
			console.log("Closing Callout");
      console.log(event.target);
      event.stop();
      $('callout').style.display = "none";
    });



  },


  addMarkers: function(){
    console.log("Called addMarkers");
    callback = this.getMapDataRequestCallback(this);
    this.provider.mapPoints(callback);
  },


  getMapDataRequestCallback: function(receiver){

    return function(responseJSON){
      //  callout = $('callout');
      // callout.inject($('body'));

      receiver.markers.clearMarkers();

      console.log("adding new markers");
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

  showCallout: function(marker, lonlat, id){
     callout = $('callout');
		 callout.style.top = marker.style.top;
		 callout.style.left = marker.style.left;
     calloutThumbnail = callout.getElements('.calloutThumbnail')[0];
     calloutThumbnail.src = this.provider.getThumbSrc(id);

     calloutLightboxLink = callout.getElements('.calloutLightboxLink')[0];
		 //TODO: provider should supply url
		 calloutLightboxLink.href = rhusConfiguration.urlPrefix + "_show/medium/"+id;
		 if (this.milkbox != null){
			 console.log("destroying the milkbox");
			 this.milkbox.display.destroy();
		 } 
		 callout.inject(marker, 'before');
     
			 
		 this.milkbox = new Milkbox({ });

     callout.style.display ="block";

  },

  hideCallout: function(marker, lonlat, id){

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