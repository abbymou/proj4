/* MAIN SCRIPTS */
$( document ).ready(function() {
    loadData();
    loadTweets();
});

/*** MAPS SCRRIPTS ***/
function initMap() {
        var home = {lat: 35.014170, lng: -80.813050};
        var map = new google.maps.Map(document.getElementById('map'), {
          center: home,
          zoom: 14
        });
        var marker = new google.maps.Marker({position: home, map: map, title: 'My Home'});
        var contentString =
        '<h1>Charlotte Home</h1>'+
        '<p>My home in Charlotte, the house I have lived in most of my life, is <b>2.5 hours</b> from Chapel Hill.</p>'
        + '<p>On the map, you can see my house sits very close to the South Carolina border.</p>';
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });

      }


/*** NEWS SCRRIPTS ***/
function loadData(){
    $.ajax({
            type:"GET",
            url:"https://newsapi.org/v1/sources",
            dataType:"json",
            success: parseData
          });
  }

function parseData(data){

  var sources = [];
  var tempPath = data["sources"];
  var html = "";

  for (var i = 0, len = tempPath.length; i < len; ++i) {
    //sets data to arrays
    sources.push(tempPath[i]);
    console.log(sources[0]["name"]);

    html += '<li><a href="#" onclick="loadArticles(\'' + sources[i]["id"] + '\')">' + sources[i]["name"] + '</a></li>';
  }

  $("#sources-area").html(html);

}

function loadArticles(source) {

    $.ajax({
            type:"GET",
            url:"https://newsapi.org/v1/articles?source=" + source + "&sortBy=top&apiKey=849f3699b61843678554e9fbd5e27c96",
            dataType:"json",
            success: parseArticles
          });
        }

function parseArticles(data){

  var articles = [];
  var tempPath = data["articles"];
  var html = "";

  for (var i = 0, len = tempPath.length; i < len; ++i){
    articles.push(tempPath[i]);

    html += '<div><h3><a href="' + articles[i]["url"] + '">' + articles[i]["title"] + '</a></h3></div>'
    html += '<p>' + articles[i]["description"] + '</p>'
  }

$("#feed-area").html(html);

}


/*** VIDEOS SCRRIPTS ***/
      function authenticate() {
        return gapi.auth2.getAuthInstance()
            .signIn({scope: "https://www.googleapis.com/auth/youtube.force-ssl"})
            .then(function() { console.log("Sign-in successful"); },
                  function(err) { console.error("Error signing in", err); });
      }
      function loadClient() {
        gapi.client.setApiKey("AIzaSyBprZvKxEac1K923yWnV6hzkY71ekaoDRE");
        return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
            .then(function() { console.log("GAPI client loaded for API"); },
                  function(err) { console.error("Error loading GAPI client for API", err); });
      }
      // Make sure the client is loaded and sign-in is complete before calling this method.
      function execute() {
        return gapi.client.youtube.search.list({
          "part": "snippet",
          "q": "halloween"
        })
            .then(function(response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                    parseVideos(response);
                  },
                  function(err) { console.error("Execute error", err); });
      }
      gapi.load("client:auth2", function() {
        gapi.auth2.init({client_id: "1012442286337-2uaqp2i29soln9cikhd0n02j7k0mta51.apps.googleusercontent.com"});
      });

      function parseVideos(response){
        var tempPath2 = response.result;
        var videoHtml = "";

        for (var i = 0, len2 = tempPath2.items.length; i < len2; ++i) {
          console.log(tempPath2.items[i].id.videoId);
          videoHtml += "<h2>" + tempPath2.items[i].snippet.title + "</h2>";
          videoHtml += '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + tempPath2.items[i].id.videoId + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
        }
        $("#videos").html(videoHtml);
      }

/*** TWITTER SCRIPTS ***/
  function loadTweets(){
      $.ajax({
              type:"GET",
              url: "tweets.json",
              dataType:"json",
              success: parseTweets
            });
    }

  function parseTweets(data){
    var twitterHtml = "";
    for (var i = 0; i < data.length; ++i) {

      var id = data[i].id;
      var user = data[i].screenName;
      var img = data[i].profileImage;
      var text = data[i].text;

      twitterHtml += '<div><img src="' + img + '">';
      twitterHtml += '<h4>' + user + '</h4>';
      twitterHtml += '<p>' + text + '</p></div>';
    }

    $("#tweets").html(twitterHtml);

  }
