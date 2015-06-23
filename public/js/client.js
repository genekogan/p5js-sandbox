var host;

var editor;
var lastPlayedCodeText;
var activeSketch;

var settings = {
	"fullScreen" : true,
}

function browseSketches() {
	var socket = io.connect(host);
	socket.emit('browseSketches', {});
};

function showEditor() {
	$("#editor").show();
	$("#showEditor").hide();
	$("#hideEditor").show();
};

function hideEditor() {
	$("#editor").hide();
	$("#showEditor").show();
	$("#hideEditor").hide();
};

function selectSketch(_id) {
	window.location.href = '/?id='+_id;
};

var saveSketchToServer = function(codeText, imageText){
	var socket = io.connect(host);
	socket.emit('saveSketch', { 
		codeText: codeText, 
		thumb: imageText });
	console.log("sent sketch to server!");
	toggleSaving(false);
};

// adapted from p5js.org, originally by Lauren McCarthy
// https://github.com/processing/p5.js-website/blob/master/js/render.js
function initCode() {
  var ed = editor;

  // tell exampleFrame to reset code every time it loads
	document.getElementById('sketchFrame').onload = function() {
		var code = ed.getValue();
		code += '\n new p5();\n'

		if (settings.fullScreen) {
			// to do: check to see if setup exists,
			// and if createCanvas exists,
			// if not make it windowWidth, windowHeight
			code += '\n  function windowResized() {\n' +
							'resizeCanvas(windowWidth, windowHeight);\n'+
							'}';
		}

		var userScript = $('#sketchFrame')[0].contentWindow.document.createElement('script');
		userScript.type = 'text/javascript';
		userScript.text = code;
		userScript.async = false;
		$('#sketchFrame')[0].contentWindow.document.body.appendChild(userScript);
	};

	playCode();

}

var playCode = function() {
	$('#sketchFrame').attr('src', $('#sketchFrame').attr('src'));
};


function toggleSaving(isSaving) {
	if (isSaving) {
		$('#savingNote').show();
	}
	else {
		$('#savingNote').hide();
	}
};

function saveCanvas2() {
	toggleSaving(true);
	var image = new Image();
	image.id = "thumbnail";
	image.src = document.getElementById("defaultCanvas").toDataURL('image/png', 0.8);
    image.onload = function () {
		var canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
			var resized = document.createElement('canvas');
			resized.width = 240;
			resized.height = 240 * image.height / image.width;
			canvasResize(canvas, resized, function(){
				var thumbnail = resized.toDataURL("image/jpeg", 0.75);
				saveSketchToServer(lastPlayedCodeText, thumbnail);
			});
	};
};

function editorWriteDefaultCode() {
	var defaultCode = 'function setup() {\n'+
		'    createCanvas(windowWidth, windowHeight);\n'+
		'};\n'+
		'\n'+
		'function draw() {\n'+
		'    background(0, 0, 255);\n'+
		'    fill(255, 255, 0);\n'+
		'    ellipse(width/2, height/2, 700, 700);\n'+
		'    fill(255, 0, 255);\n'+
		'    ellipse(width/2, height/2, 600, 600);\n'+
		'    fill(0, 255, 255);\n'+
		'    ellipse(width/2, height/2, 500, 500);\n'+
		'    fill(255, 255, 255);\n'+
		'    ellipse(width/2, height/2, 400, 400);\n'+
		'    fill(255, 0, 0);\n'+
		'    ellipse(width/2, height/2, 300, 300);\n'+
		'    fill(0, 255, 0);\n'+
		'    ellipse(width/2, height/2, 200, 200);\n'+
		'    fill(0, 0, 255);\n'+
		'    ellipse(width/2, height/2, 100, 100);\n'+
		'};\n'+
		'\n'+
		'function mousePressed() {\n'+
		'};\n';
	editor.setValue(defaultCode);
};


function startMain() {
	editor = ace.edit("editor");
	editor.setTheme("ace/theme/twilight");
	editor.getSession().setMode("ace/mode/javascript");

	var socket = io.connect(host);
	initCode();

	// did we receive a sketch?
	socket.on('sketchData', function (data) {
		console.log('sketch data');
		editor.setValue(data.codeText);	// insert code into ace editor
		playCode();
	});
	socket.on('setupDefaultSketch', function () {
		editorWriteDefaultCode();
	});
	socket.on('saveSketch', function () {
		toggleSaving(false);
	});

	// is a specific sketch requested?
	id = window.location.href.match(/\?id=([\w-]{24})/);
	if (id != null) {
		socket.emit('requestSketch', {_id: id[1]});
	}	
	else {
		socket.emit('requestRandomSketch');
	}
};

function requestRandomSketch(){
	var socket = io.connect(host);
	socket.emit('requestRandomSketch');
};

function startBrowse() {
	var idx = 0;
	var socket = io.connect(host);
	socket.on('sketchesData', function (data) {
		var image = new Image();
		image.src = data.thumbnail;
		$('#thumbs').append('<div id="sketch_'+idx+'" class="sketchThumb" onclick="selectSketch(\''+data._id+ '\');"></div>');
		$('#sketch_'+idx).append(image);
		idx++;
	});
};

host = location.origin;

window.onload = function() {
	showEditor();
	toggleSaving(false);
};
