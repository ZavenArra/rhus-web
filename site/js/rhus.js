
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
  galleryDocumentsViewPath: "_view/galleryDocuments",
  zonesViewPath : "_view/zones",
  update_seq:  -1, //database sequence number
  callerCallback: null,

  /*TODO: we'll want to track update_seq for each view that's being queried later on, 
  * or similar strategy for making sure subsequent request
  * */
  startDateRange: null, //"2012-02-16",
  endDateRange: null, //"2012-03-16", 


  mapPoints : function(callback){

    url = rhusConfiguration.urlPrefix + this.galleryDocumentsViewPath + "?update_seq=true";
    if(this.startDateRange != null){
      url+="&startkey="+JSON.stringify(this.startDateRange);
    }
    if(this.endDateRange != null){
      url+="&endkey="+JSON.stringify(this.endDateRange);
    }
    console.log("CouchDB: "+url);

    console.log(callback);
    this.callerCallback = callback;
    console.log(this.callerCallback);
    this.requeryMapPoints();

    //Set Timeout to update the map
    this.timer = this.requeryMapPoints.bind(this).periodical(rhusConfiguration.refreshRate);
  },

  zones : function(callback){
    zonesUrl = rhusConfiguration.urlPrefix + this.zonesViewPath; 

    var myJSONRemote = new Request.JSON({
      url: zonesUrl,
      method: 'get', 
      onComplete: this.requestCallback(callback).bind(this) }).send();  

  },

  //map.raiseLayer(layer, 1) for up, or map.raiseLayer(layer, -1) for down.

  timeline : function(boundingBox, callback){

    href = "_spatiallist/timeline/documents?bbox="+boundingBox.join(',');
    //    window.open(href, '_blank');
    var myJSONRemote = new Request.JSON(
      {
        url: href,
        method: 'get',
        onComplete: callback
      }
    ).send();

  },

  requestCallback : function(callerCallback){
    return function(responseJSON){
      return callerCallback(responseJSON);
    }
  },

  requestCallbackWithUpdateSeq : function(callerCallback){
    return function(responseJSON){
      if(this.update_seq || (responseJSON.update_seq > this.update_seq)){
        console.log("Got New Data");
        this.update_seq = responseJSON.update_seq;
        return callerCallback(responseJSON);
      }
      // return callback(callerCallback, responseJSON);
    }
  },

  requeryMapPoints : function(){

    console.log("Requery");

    console.log(this.callerCallback);

    var myJSONRemote = new Request.JSON({
      url: url,
      method: 'get', 
      data: {
        json: 'yes'
      },
    onComplete: this.requestCallbackWithUpdateSeq(this.callerCallback).bind(this) }).send();  

  },

  getThumbSrc : function(id){
    console.log(rhusConfiguration.urlPrefix + id +'/thumb.jpg');
    return rhusConfiguration.urlPrefix + id +'/thumb.jpg';
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
  zoneLayer : null,
  timer : null,
	milkbox : null,
  ctrlSelectFeatures : null,
  controls: null,
  

  initialize: function(contentProvider){
  
    this.provider = contentProvider;

    this.map = new OpenLayers.Map( 'map');

    this.osm = new OpenLayers.Layer.OSM( "Open Street Map Layer");

    // defined for javascript.
    if(! (typeof google === 'undefined') ){
      var gmap = new OpenLayers.Layer.Google("Google Streets Layer", {visibility: false});
    }

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

    var styles = rhus.mapStyles.getStudyAreaStyles(); 

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

    //Timeline Areas
    var zoneStyles = rhus.mapStyles.getTimelineStyles();
    this.zoneLayer = new OpenLayers.Layer.Vector('Timeline Zones',
      {
           styleMap: zoneStyles
       }
     );
    //add zones later
   this.map.addLayer(this.zoneLayer);
   this.zoneLayer.events.register('loadend', this.zoneLayer, this.regLoadEnd);
   this.zoneLayer.events.register('featureselected', this.zoneLayer, this.featureSelected.bind(this));
   this.map.layers[1].events.register('loadend', this.map.layers[1], this.regLoadEnd);

   /*
   this.map.setCenter(
      new OpenLayers.LonLat(rhusConfiguration.centerLongitude, rhusConfiguration.centerLatitude).transform(
        new OpenLayers.Projection("EPSG:4326"),
        this.map.getProjectionObject()
      ), 12
    );    
    */

    var proj = new OpenLayers.Projection("EPSG:4326");
    var bounds = new OpenLayers.Bounds(rhusConfiguration.centerLongitude-rhusConfiguration.longitudeSpread,rhusConfiguration.centerLatitude-rhusConfiguration.latitudeSpread, rhusConfiguration.centerLongitude+rhusConfiguration.longitudeSpread, rhusConfiguration.centerLatitude+rhusConfiguration.latitudeSpread); 
    bounds.transform(proj, this.map.getProjectionObject());
    this.map.zoomToExtent(bounds);


    /* Extent Box
    var boxes = new OpenLayers.Layer.Boxes("boxes");
    var box = new OpenLayers.Marker.Box(bounds);
    boxes.addMarker(box);
    this.map.addLayer(boxes);
    */

    this.markers = new OpenLayers.Layer.Markers( "Plants" );
    this.map.addLayer(this.markers);


    //map icons
    var size = new OpenLayers.Size(11,10);
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    this.icon = new OpenLayers.Icon('resources/mapPoint.png', size, offset);

    this.map.addControl(new OpenLayers.Control.LayerSwitcher());
    this.map.addControl(new OpenLayers.Control.MousePosition());


    this.controls = {
      // point: new OpenLayers.Control.DrawFeature(vectors,
        // OpenLayers.Handler.Point),
        //  line: new OpenLayers.Control.DrawFeature(vectors,
          //  OpenLayers.Handler.Path),
          polygon: new OpenLayers.Control.DrawFeature(this.zoneLayer,
          OpenLayers.Handler.Polygon),
          drag: new OpenLayers.Control.DragFeature(this.zoneLayer)
    };

    for(var key in this.controls) {
      this.map.addControl(this.controls[key]);
    }

    document.getElementById('noneToggle').checked = true;

     //Initialize here differet markers the map may need
    console.log("Initialized");

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

  toggleControl : function(element) {
    console.log(this.controls);
    for(key in this.controls) {
      var control = this.controls[key];
      if(element.value == key && element.checked) {
        control.activate();
      } else {
        control.deactivate();
      }
    }
  },



  getAddImages : function(){
    return function (responseJSON){
      $('galleryContainer').set('html',unescape(responseJSON.imagestring));
      //			 alert("Smoov and Bangin!");
      console.log(responseJSON);
      if (this.zoneMilkbox != null){
        console.log("destroying the milkbox");
        this.zoneMilkbox.display.destroy();
      };

      this.zoneMilkbox = new Milkbox({ });
      console.log("started the milkbox");
      this.zoneMilkbox.open('zone',0);
      console.log("opened the milkbox - should see some stuff");
    }
  },



  featureSelected : function(selectedFeature){
    var boundingBox;
      console.log(selectedFeature);
    if(selectedFeature.feature.attributes.boundingBox != null){
      boundingBox = selectedFeature.feature.attributes.boundingBox;
    } else {
      //console.log(selectedFeature);
      var bounds = selectedFeature.feature.geometry.bounds;
      bounds = bounds.transform(
        this.map.getProjectionObject(),
        new OpenLayers.Projection("EPSG:4326")
        );
      boundingBox =[bounds.bottom, bounds.left, bounds.top, bounds.right];
    }
    console.log(boundingBox);

    this.provider.timeline(boundingBox, this.getAddImages().bind(this));
  },



  regLoadEnd : function(){
    //alert('regLoadNed!');
  },

  addMarkers: function(){
    console.log("Called addMarkers");
    callback = this.getMapDataRequestCallback(this);
    this.provider.mapPoints(callback);
  },

  addZones: function(){
    callback = this.getZonesRequestCallback(this);
    this.provider.zones(callback);
  },


  getMapDataRequestCallback: function(receiver){

    return function(responseJSON){

      callout = $('callout');
      callout.inject($('body'));

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

  //This function could go into a customer OL relevant library
  getChangeFeatureVisibilityCallback: function(rhusMap, idx){
    return function(event) {
      var vlyr = rhusMap.zoneLayer;
      var objF = vlyr.features[idx];

      try{
       // if(objF.id == vlyr.selectedFeatures[0].id)
          //Not sure what this is for
          //ctrlSelectFeatures.unselect(vlyr.selectedFeatures[0]);
      }catch(err){
        console.log('ERROR');
        //document.getElementById("featDesc").innerHTML='error'
      };

      if(event.target.checked)
        objF.attributes['visibility'] = "visible";
      else
        objF.attributes['visibility'] = "hidden";
      vlyr.drawFeature(objF);
    }
  },



  getZonesRequestCallback: function(receiver){
    return function(responseJSON){

      //receiver.markers.clearRegions();
      var geoJSONFormat = new OpenLayers.Format.GeoJSON({
        'internalProjection' : receiver.map.getProjectionObject(),
        'externalProjection': new OpenLayers.Projection("EPSG:4326")
      });
      //console.log(responseJSON);

      var features = new Array();
      responseJSON.rows.each(function(zone){
        console.log(zone.value.name);

        console.log(zone.value.geojson);
        var zoneFeatures = geoJSONFormat.read(zone.value.geojson);
        console.log(zoneFeatures);

        feature = zoneFeatures[0]; //only supporting 1 feature per file
        feature.attributes['boundingBox'] = zone.value.boundingBox;
        console.log(zone.value.boundingBox);
        features.push(zoneFeatures[0]);

      });

      receiver.zoneLayer.addFeatures(features);


/* 
 * Turning on this control brings the zones layer to the top.  Need to override openLayers code to change this behavior
 * */
      receiver.ctrlSelectFeatures = new OpenLayers.Control.SelectFeature(
        receiver.zoneLayer,
        {
          clickout: true, toggle: false,
          multiple: false, hover: false,
          toggleKey: "ctrlKey", // ctrl key removes from selection
          multipleKey: "shiftKey", // shift key adds to selection
          onSelect:  function(){} //show feature callout }
        }
      );
      receiver.map.addControl(receiver.ctrlSelectFeatures);
      receiver.ctrlSelectFeatures.activate();
     /* */


      //and add the controls
      var objFs = receiver.zoneLayer.features;
      var featureCheckboxContainer = $("diva");
      for(var i=0;i<objFs.length;i++){
        continue;
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        var callback = receiver.getChangeFeatureVisibilityCallback(receiver, i);
        console.log(checkbox);
        checkbox.addEvent('click', callback );
        checkbox.inject(featureCheckboxContainer, 'bottom');
        var label = document.createElement('label');
        label.innerHTML = objFs[i].attributes.name;
        label.inject(checkbox, 'after');
        var br = document.createElement('br');
        br.inject(label, 'after');
      }
      // theHTML += '<input type="checkbox" checked onclick="this.changeFeatureVisibility(' + i + ',this.checked)"><label>' + objFs[i].attributes.name + '</label><br>';
      // document.getElementById("diva").innerHTML = theHTML;
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
    calloutLightboxLink.href = rhusConfiguration.urlPrefix + id + "/medium.jpg";
	
		//this is to destroy the callout (single image) milkbox
		if (this.milkbox != null){
			console.log("destroying the milkbox");
			this.milkbox.display.destroy();
		}
//this is to destroy the timeline gallery(multiple image) milkbox
		if (this.zoneMilkbox != null){
			console.log("destroying the milkbox");
			this.zoneMilkbox.display.destroy();
		};
    callout.inject(marker, 'before');


    this.milkbox = new Milkbox({ });

    callout.style.display ="block";

  },

  hideCallout: function(marker, lonlat, id){

  }

});


rhus.mapStyles = new Class();
rhus.mapStyles.getStudyAreaStyles = function(){
 
    styles = new OpenLayers.StyleMap({
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

    return styles;

  }

rhus.mapStyles.getTimelineStyles = function(){

    styles = new OpenLayers.StyleMap({
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

    styles.addUniqueValueRules("default", "visibility", {'hidden':{display:"none"}});

    return styles;
}

var rhNavigation;
var rhMap;
window.addEvent( "domready", function(){
  console.log('Dom is Ready');
  rhNavigation = new rhus.navigation();
  rhMap = new rhus.map( new rhus.contentProvider() );
  //Markers can't be clicked when zone layer is selected
  //http://lists.osgeo.org/pipermail/openlayers-users/2007-April/001475.html
  rhMap.addZones();
  rhMap.addMarkers();
});
