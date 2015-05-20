var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongodb = require('mongodb');

//var uri = 'mongodb://heroku_app36983837:ile2eb8oc4c68adg9c8lsh4ug6@ds037252.mongolab.com:37252/heroku_app36983837';
var uri = 'mongodb://heroku_app37049842:dolsgo69sgqu0kupj60kklues5@ds053310.mongolab.com:53310/heroku_app37049842';

var saveSketch = function(codeText, thumbnail) {
 	mongodb.MongoClient.connect(uri, function(err, db) {
  	if(err) throw err;
  	var sketchData = {codeText: codeText, thumbnail: thumbnail};
    db.collection('sketches').insert(sketchData, function(err, result) {
  		if(err) throw err;
      console.log("Saved sketch to sketches collection");
  	});
  });
};

var sendSketchToClient = function(socket, id){
	mongodb.MongoClient.connect(uri, function(err, db) {
    	if(err) throw err;
    	db.collection('sketches').find({_id: mongodb.ObjectId(id)}).toArray(function (err, docs) {
      		if(err) throw err;
      		docs.forEach(function (doc) {
      			socket.emit('sketchData', { _id:doc._id, codeText:doc['codeText'], thumbnail:doc['thumbnail'] });
      		});
    	});
	});
};  

var sendRandomSketchToClient = function(socket){
  mongodb.MongoClient.connect(uri, function(err, db) {
    if(err) throw err;
    db.collection('sketches').find().toArray(function (err, docs) {
      if(err) throw err;
	  if (docs.length > 0) {
      	var idxRandom = Math.floor(docs.length * Math.random(1));
      	socket.emit('sketchData', { _id:docs[idxRandom]._id, codeText:docs[idxRandom]['codeText'], thumbnail:docs[idxRandom]['thumbnail'] });
}
    });
  });
};  

var sendSketchesData = function(socket){
	mongodb.MongoClient.connect(uri, function(err, db) {
  	if(err) throw err;
  	db.collection('sketches').find().toArray(function (err, docs) {
  		if(err) throw err;
  		docs.forEach(function (doc) {
        socket.emit('sketchesData', { _id:doc._id, thumbnail:doc['thumbnail'] });
    	});
    });
  });
};  

app.use(express.static(__dirname + '/public'));
server.listen(5000);

app.get('/', function (request, response) {
	response.sendFile(__dirname + '/index.html');
});

app.get('/browse', function (request, response) {
	response.sendFile(__dirname + '/public/browse.html');
});

io.on('connection', function (socket) {
  	socket.on('saveSketch', function (data) {
    	saveSketch(data.codeText, data.thumb);
  	});
  	socket.on('browseSketches', function (data) {
  		sendSketchesData(socket);
  	});
  	socket.on('requestSketch', function (data) {
    	sendSketchToClient(socket, data._id);
  	});
    socket.on('requestRandomSketch', function () {
      sendRandomSketchToClient(socket);
    });
});

/*
mongodb.MongoClient.connect(uri, function(err, db) {
  db.collection('sketches').drop();
});*/