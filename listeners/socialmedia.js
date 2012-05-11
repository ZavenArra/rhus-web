var twitter = require('ntwitter');
var cradle = require('cradle');
var configuration = require('./configuration.js');

var cradleConnection =  new(cradle.Connection)(configuration.couchHost, configuration.couchPort, {
  cache: true,
  raw: false
});
var db = cradleConnection.database(configuration.couchDatabase);

var twit = new twitter({
  consumer_key: '62w2KIynw7GoRPa8RHMhQA',
  consumer_secret: 'tT9BOdAES9EM4MYPdmBMygvASgvWUBHXhYHFkqgHATc',
  access_token_key: '575615263-QSjsjaTX6dAGp4Xi79eXcrVwOtWU05OlTajvr6Ot',
  access_token_secret: 'pJ8yAqQ92EazJsDIeJaSqSUjbwpxPo3vezzloaA4'
});

twit.verifyCredentials(function (err, data) {
  if (err) {
    console.log("Error verifying credentials: " + err);
    process.exit(1);
  }
});

var thisdate = new Date();
var testURL = 'http://www.wildflowersofdetroit.org/medium/9725b95f37bf064ed48b21c2f7000cf7.jpg'; 
var testURL2 = 'http://www.wildflowersofdetroit.org/?id=9725b95f37bf064ed48b21c2f7000cf7'; 

db.view('couchapp/socialmedia', { include_docs: true}, function (err, res) {
  if(err){
    console.log('Error: ',err,res);
    process.exit(1);
  }
  res.forEach(function (row) {
    //console.log(row);

    var twitterMessage = thisdate.toTimeString()+"New Data! ";
    var couchPath = configuration.couchHost+':'+configuration.couchPort+"/"+configuration.couchDatabase
    twitterMessage += couchPath+"/medium/"+row._id+".jpg ";
    twitterMessage += couchPath+"/?id="+row._id;

    twit.updateStatus(twitterMessage,
    function (err, data) {
      if (err) {
        console.log(twitterMessage);
        console.log('Tweeting failed: ' + err);
        process.exit(1);
      } else {
        console.log('Success!');
        var doc = row;
        doc.tweeted = 'true';
        //Cleaning up the data
        //WARNING THIS IS DANGEROUS FOR THE PRODUCTION SITE!
        doc.medium = '';
        doc.thumb = '';
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
    }
    );

  });
});

