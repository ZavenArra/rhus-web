var cradle = require('cradle');
var configuration = require('./configuration.js');

var cradleConnection =  new(cradle.Connection)(configuration.couchHost, configuration.couchPort, {
  cache: true,
  raw: false,
  auth: { username: configuration.couchUser, password: configuration.couchPassword }
});
var db = cradleConnection.database(configuration.couchDatabase);

db.view('rh-fixes/wrongGeoJson', { include_docs: true }, function (err, res) {

  if(err){
    console.warn('Error: ',err,res);
    process.exit(1);
  }
  res.forEach(function (row) {
    //console.warn(row);

    var doc = row;

    if(!doc.geometry && doc.latitude && doc.longitude){

      doc.geometry = {
        "type" : "Point",
        "coordinates" : [parseFloat(doc.latitude), parseFloat(doc.longitude)]
      };


      console.warn('Updating document '+doc._id+" "+doc._rev);

      db.save(doc._id, doc._rev, doc,
        function(err, res){
          if(err){
            console.warn('Doc Update Error: ',err,res);
            process.exit(1);
          } else {
            console.warn("updated document "+doc._id);
          }
        }
      );
    }
  });
});

