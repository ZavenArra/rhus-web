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

