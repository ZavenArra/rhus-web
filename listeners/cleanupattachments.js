var cradle = require('cradle');
var configuration = require('./configuration.js');

var cradleConnection =  new(cradle.Connection)(configuration.couchHost, configuration.couchPort, {
  cache: true,
  raw: false,
  auth: { username: configuration.couchUser, password: configuration.couchPassword }
});
var db = cradleConnection.database(configuration.couchDatabase);

db.view('couchapp/cleanupattachments', { include_docs: true, limit: 10 }, function (err, res) {

  if(err){
    console.warn('Error: ',err,res);
    process.exit(1);
  }
  res.forEach(function (row) {
    //console.warn(row);

    var doc = row;
    //Cleaning up the data
    //WARNING THIS IS DANGEROUS FOR THE PRODUCTION SITE!

    if(doc.medium!=null && doc.medium!=""){
      var medium = new Buffer(doc.medium, 'base64');
      var thumb = new Buffer(doc.thumb, 'base64');

      console.warn('Uploading thumb.jpg');
      console.warn(thumb.toString());
      var attachment = { name:'thumb.jpg', body: thumb, contentType:"image/jpeg"};
      db.saveAttachment( 
        doc, 
        attachment,
        function( err, data ){
          if(err){
            console.warn('Doc Update Error: ',err,data);
            process.exit(1);
          } else {
            console.warn('Uploaded thumb.jpg');
            console.warn('Uploading medium.jpg');
            console.log(data);
            attachment = { name:'medium.jpg', body: medium, contentType:"image/jpeg"};
            db.saveAttachment( 
              data, 
              attachment,
              function( err, data ){
                if(err){
                  console.warn('Doc Update Error: ',err,data);
                  process.exit(1);
                } else {
                  console.warn('Uploaded medium.jpg');

                  
                  db.get(data.id, function(err, updateDoc) {
                    if(updateDoc.medium) {
                      delete updateDoc.medium;
                    }
                    if(updateDoc.thumb){
                      delete updateDoc.thumb;
                    }

                    console.warn('Updating updateDocument '+updateDoc.id+" "+updateDoc.rev);
                    db.save(updateDoc._id, updateDoc._rev, updateDoc,
                      function(err, res){
                        if(err){
                          console.warn('Doc Update Error: ',err,res);
                          process.exit(1);
                        } else {
                          console.warn("updated updateDocument "+updateDoc._id);
                        }
                      }
                    );
                   });
                }
              });
          }
        }
      );
    }
  }
  );


});

