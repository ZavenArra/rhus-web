
rhus = {};

rhus.navigation = new Class({
  activePage: 'map',
  pages:      ['map', 'getInvolved', 'timeline', 'about'],


  initialize: function(){
    document.id('mapButton').addEvent('click', this.menuCallback('map').bind(this));
    document.id('getInvolvedButton').addEvent('click', this.menuCallback('getInvolved').bind(this));
    document.id('timelineButton').addEvent('click', this.menuCallback('timeline').bind(this));
    document.id('aboutButton').addEvent('click', this.menuCallback('about').bind(this));

    $('aboutButton').addEvent('click', function(e) {
      console.log("In event");
      e.stop();

      var url = "lipsum.html";

      var myJSONRemote = new Request.JSON({
      url: url,
      method: 'post', 
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
      event.target.getParent().addClass('active');

    };

  }

});

var navigation;
window.addEvent( "domready", function(){
  navigation = new rhus.navigation();
  console.log('Dom is Ready');
});
