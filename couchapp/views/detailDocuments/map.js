function(doc) { emit(doc.created_at, [doc._id, doc.reporter, doc.comment, doc.medium, doc.created_at] );}
