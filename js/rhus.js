
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
      this.pages.each(function(page){
        $(page).style.display = "none";
      });
      $(showPage).style.display = "block";

    };

  }

});

var navigation;
window.addEvent( "domready", function(){
    navigation = new rhus.navigation();
    console.log('Dom is Ready');
});
