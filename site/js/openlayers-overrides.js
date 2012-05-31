OpenLayers.Handler.Feature.prototype.activate = function() {
    var activated = false;
    if (OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
        //this.moveLayerToTop();
        this.map.events.on({
            "removelayer": this.handleMapEvents,
            "changelayer": this.handleMapEvents,
            scope: this
        });
        activated = true;
    }
    return activated;
};

OpenLayers.Handler.Feature.prototype.handleMapEvents = function(evt) {
  if (evt.type == "removelayer" || evt.property == "order") {
    this.moveLayerToTop();
  }
};
