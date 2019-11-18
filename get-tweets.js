const Twitter = require('twitter');
const config = require('./config.js');
const fs = require('fs');
const T = new Twitter(config);
const path = require('path');

const {Storage} = require('@google-cloud/storage');
const gc = new Storage({
  keyFilename: path.join(__dirname, '487gmAM-b6274e4d192d.json'),
  projectId: '487gmAM-b6274e4d192d'
});

//gc.getBuckets().then(x => console.log(x));

// saving file to GCS
const stream     = require('stream'),
      dataStream = new stream.PassThrough(),
      gcFile     = gc.bucket('api-project-am').file('tweets.json')

// name of GCS bucket
const storageBucket = gc.bucket('api-project-am');
//console.log(storageBucket);


// Set up your search parameters
const params = {
  q: '#MoMA',
  count: 10,
  result_type: 'recent',
  lang: 'en'
}

// Initiate your search using the above paramaters
T.get('search/tweets', params, (err, data, response) => {
  // If there is no error, proceed
  if(err){
    return console.log(err);
  }

  // Loop through the returned tweets
  const tweetsId = data.statuses
    .map(tweet => ({ id: tweet.id_str }));

  var tweets = [];
  for(var i = 0; i < data.statuses.length; i++){
    // Get the tweet Id from the returned data
    tweets.push({ id: data.statuses[i].id_str, userName : data.statuses[i].user.name, screenName : data.statuses[i].user.screen_name, profileImage: data.statuses[i].user.profile_image_url_https, text: data.statuses[i].text });
    // var id = { id: data.statuses[i].id_str }
  };

  console.log(tweets);
  var completeData = JSON.stringify(tweets);
  var thePath = __dirname;
  console.log(__dirname);
  console.log(thePath);
  var theFile = __dirname + '/tweetsVar.json'
  //fs.writeFileSync('tweets.json', completeData);
  console.log(completeData);
  console.log('----- saved as tweets.json -----');

  //saving file to GCS
  dataStream.push(completeData)
  dataStream.push(null)

  function saveFile(){
    console.log('saving file...');
  return new Promise((resolve, reject) => {
    dataStream.pipe(gcFile.createWriteStream({
      resumable  : false,
      validation : false,
      metadata   : {'Cache-Control': 'public, max-age=31536000'}
    }))
  })
  }

  saveFile();
  console.log("saved to GCS");
  console.log("https://storage.cloud.google.com/api-project-am/tweets.json");

})
