console.log('index.js loaded');

var static = require('node-static');
var file = new static.Server();
require('http').createServer(function(request, response){
  request.addListener('end', function(){
    file.serve(request, reponse);
  }).resume();
}).listen(process.env.PORT || 3000);
