function(doc) { 
  /*TODO: emit keys such that items heading to different social media can be subqueried*/
  if(doc.doctype != 'zone' && doc.tweeted == null){
    emit('twitter', {id:doc._id, reporter:doc.reporter, comment:doc.comment, coordinates:[doc.latitude, doc.longitude]});
  }
}
