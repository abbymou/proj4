/* MAIN SCRIPTS */
$( document ).ready(function() {
  loadTweets();
  //loadPhotos();
});

/*** MAPS SCRRIPTS ***/
mapboxgl.accessToken = 'pk.eyJ1IjoiYWJieW1vdSIsImEiOiJjazMxc2syNTQwNHcxM2hvcW5nMnRqa3R6In0.M0g2mCwZs80UWus_NEgW9Q';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v9',
center: [-73.977664, 40.761484], // starting position [lng, lat]
zoom: 15.5, // starting zoom
pitch: 40,
bearing: 210,
antialias: true
});

var size = 150;

// implementation of CustomLayerInterface to draw a pulsing dot icon on the map
// see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
var pulsingDot = {
  width: size,
  height: size,
  data: new Uint8Array(size * size * 4),

  // get rendering context for the map canvas when layer is added to the map
  onAdd: function() {
    var canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d');
},

// called once before every frame where the icon will be used
render: function() {
  var duration = 1000;
  var t = (performance.now() % duration) / duration;

  var radius = size / 2 * 0.3;
  var outerRadius = size / 2 * 0.7 * t + radius;
  var context = this.context;

  // draw outer circle
  context.clearRect(0, 0, this.width, this.height);
  context.beginPath();
  context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
  context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
  context.fill();

  // draw inner circle
  context.beginPath();
  context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
  context.fillStyle = 'rgba(255, 100, 100, 1)';
  context.strokeStyle = 'white';
  context.lineWidth = 2 + 4 * (1 - t);
  context.fill();
  context.stroke();

// update this image's data with data from the canvas
  this.data = context.getImageData(0, 0, this.width, this.height).data;

  // continuously repaint the map, resulting in the smooth animation of the dot
  map.triggerRepaint();

  // return `true` to let the map know that the image was updated
  return true;
  }
};

map.on('load', function () {

  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

  map.addLayer({
    "id": "points",
    "type": "symbol",
    "source": {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [-73.977664, 40.761484]
                }
              }]
            }
          },
        "layout": {
        "icon-image": "pulsing-dot"
      }
    });
    // Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
    labelLayerId = layers[i].id;
    break;
    }
    }

    map.addLayer({
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
    'fill-extrusion-color': '#aaa',

    // use an 'interpolate' expression to add a smooth transition effect to the
    // buildings as the user zooms in
    'fill-extrusion-height': [
    "interpolate", ["linear"], ["zoom"],
    15, 0,
    15.05, ["get", "height"]
    ],
    'fill-extrusion-base': [
    "interpolate", ["linear"], ["zoom"],
    15, 0,
    15.05, ["get", "min_height"]
    ],
    'fill-extrusion-opacity': .6
    }
    }, labelLayerId);
    });

/*** IMAGES SCRIPTS ***/
var APIKey = 'cfc1c3deab010108fdbdbb3f0747211f5e0824bab58c0d235deea3a723e7dc0d';

$.getJSON('https://api.unsplash.com/search/photos?page=1&query=museum-of-modern-art&client_id=cfc1c3deab010108fdbdbb3f0747211f5e0824bab58c0d235deea3a723e7dc0d', function(data) {
  console.log(data);

  var results = data.results;

  $.each(results, function(i, val){
    var image = val;
    var imageURL = val.urls.regular;
    var imageLink = val.links.html;
    var imageWidth = val.width;
    var imageHeight = val.height;
    //console.log(imageURL);

    $('.grid').append('<div class="image"><a href="' + imageLink + '" target="_blank" class="image-effect"><img src="' + imageURL + '"></a></div>')
  });
});

/*** TWITTTER SCRIPTS ***/
function loadTweets(){
    $.ajax({
            type:"GET",
            url: "https://www.googleapis.com/download/storage/v1/b/api-project-am/o/tweets.json?alt=media",
            dataType:"json",
            success: parseTweets
          });
  }

function parseTweets(data){
  var twitterHtml = "";
  for (var i = 0; i < data.length; ++i) {

    var id = data[i].id;
    var user = data[i].userName;
    var handle = data[i].screenName;
    var img = data[i].profileImage;
    var text = data[i].text;

    twitterHtml += '<div class="tweet-feed"><img class="twitter-img" src="' + img + '">';
    twitterHtml += '<h4 class="twitter-handle">' + user + '<h5 class="twitter-name">' + " @" + handle + '</h5>' + '</h4>';
    twitterHtml += '<p>' + text + '</p></div>' + '<br>';
  }

  $("#tweets").html(twitterHtml);

}
