var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongodb = require('mongodb');

var uri = 'mongodb://heroku_app37049842:dolsgo69sgqu0kupj60kklues5@ds053310.mongolab.com:53310/heroku_app37049842';

var saveSketch = function(codeText, thumbnail) {
  mongodb.MongoClient.connect(uri, function(err, db) {
    if(err) {
      console.log( 'Error: ' + err.message );
      return;
    }
    var sketchData = {codeText: codeText, thumbnail: thumbnail};
    db.collection('sketches').insert(sketchData, function(err, result) {
      if(err) throw err;
        console.log("Saved sketch to sketches collection");
    });
  });
};

var sendSketchToClient = function(socket, id){
  mongodb.MongoClient.connect(uri, function(err, db) {
    if(err) {
      console.log( 'Error: ' + err.message );
      return;
    }
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
    if(err) {
      console.log( 'Error: ' + err.message );
      return;
    }
    db.collection('sketches').find().toArray(function (err, docs) {
      if(err) throw err;
      if (docs.length > 0) {
          var idxRandom = Math.floor(docs.length * Math.random(1));
          socket.emit('sketchData', { _id:docs[idxRandom]._id, codeText:docs[idxRandom]['codeText'], thumbnail:docs[idxRandom]['thumbnail'] });
    } else {
      socket.emit('setupDefaultSketch');
    }
    });
  });
};

var sendSketchesData = function(socket){
  mongodb.MongoClient.connect(uri, function(err, db) {
    if(err) {
      console.log( 'Error: ' + err.message );
      return;
    }
    db.collection('sketches').find().toArray(function (err, docs) {
      if(err) throw err;
      docs.forEach(function (doc) {
          socket.emit('sketchesData', { _id:doc._id, thumbnail:doc['thumbnail'] });
      });
    });
  });
};

//app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
server.listen(process.env.PORT || 5000);

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.get('/browse', function(request, response) {
  response.sendFile(__dirname + '/public/browse.html');
});

io.on('connection', function (socket) {

    // keep track of previous errors
    var prevErr = '';

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

    // when code is changed, log it
    socket.on('editMade', function (data) {
      socket.broadcast.emit('codechange', data);
    });

    // error handling
    socket.on('err', function (data) {
      // only do something with error if it is different from previous error.
      // Otherwise, assume it is an error in draw loop.
      if (data.msg === prevErr.msg && data.num === prevErr.num) {
        // do nothing
      } else {
        socket.broadcast.emit('err', data);
        prevErr = data;
      }

    });

});


console.log("node running on port "+(process.env.PORT || 5000));

/*
// for deleting the sketches table
mongodb.MongoClient.connect(uri, function(err, db) {
  	if(err) throw err;
  	db.collection('sketches').drop();
});
*/