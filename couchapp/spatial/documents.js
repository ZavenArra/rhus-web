function(doc) { if(doc.latitude && doc.longitude){ emit( {"type":"Point", "coordinates":[parseFloat(doc.latitude), parseFloat(doc.longitude)] }, [doc.id, doc.created_at]); } }
