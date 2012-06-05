function(doc) { 
  /*TODO: emit keys such that items heading to different social media can be subqueried*/
  if(doc.doctype != 'zone' && doc.latitude != null && doc.longitude!= null && doc.geometry == null){
    emit(doc._id, "");
  }
}
