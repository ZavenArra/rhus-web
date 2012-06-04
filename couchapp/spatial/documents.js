function(doc) { if(doc.geometry && doc.docType != "zone"){ emit( doc.geometry, { "id" : doc._id,  "created_at" : doc.created_at, "comment" : doc.comment, "reporter" : doc.reporter } ); } }
