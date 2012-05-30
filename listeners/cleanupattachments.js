var twitter = require('ntwitter');
var cradle = require('cradle');
var configuration = require('./configuration.js');

var cradleConnection =  new(cradle.Connection)(configuration.couchHost, configuration.couchPort, {
  cache: true,
  raw: false,
  auth: { username: configuration.couchUser, password: configuration.couchPassword }
});
var db = cradleConnection.database(configuration.couchDatabase);

var thisdate = new Date();
var testURL = 'http://www.wildflowersofdetroit.org/medium/9725b95f37bf064ed48b21c2f7000cf7.jpg'; 
var testURL2 = 'http://www.wildflowersofdetroit.org/?id=9725b95f37bf064ed48b21c2f7000cf7'; 

db.view('couchapp/cleanupattachments', { include_docs: true}, function (err, res) {
  if(err){
    console.log('Error: ',err,res);
    process.exit(1);
  }
  res.forEach(function (row) {
    console.log(row);

    var doc = row;
    //doc.tweeted = 'true';
    //Cleaning up the data
    //WARNING THIS IS DANGEROUS FOR THE PRODUCTION SITE!

    if(doc.medium!=null && doc.medium!=""){
      var medium = doc.medium;
      var thumb = doc.thumb;
      doc.medium = '';
      doc.thumb = '';

      var attachment = { name:'medium.jpg', body: medium};
      db.saveAttachment( 
        doc, 
        attachment,
        function( err, data ){
          console.log(data);
        }
      );

      attachment = { name:'thumb.jpg', body: thumb};
      db.saveAttachment( 
        doc, 
        attachment,
        function( err, data ){
          console.log(data);
        }
      );

      db.save(doc._id, doc._rev, doc,
        function(err, res){
          if(err){
            console.log('Doc Update Error: ',err,res);
            process.exit(1);
          } else {
            console.log("updated document "+doc._id);
          }
        }
      );
    }

  });
});

