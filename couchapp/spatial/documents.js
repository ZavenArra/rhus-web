function(doc) { if(doc.latitude && doc.longitude){ emit( { doc.geometry }, { "id" : doc._id,  "created_at" : doc.created_at, "comment" : doc.comment, "reporter" : doc.reporter } ); } }
