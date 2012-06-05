function(doc) { 
  /*TODO: emit keys such that items heading to different social media can be subqueried*/
  if(doc.doctype != 'zone' && doc.thumb != null && doc.thumb!=""){
    emit(doc._id, "");
  }
}
