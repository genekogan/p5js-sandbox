var p5functions = ['preload','setup','draw','keyPressed','keyReleased','keyTyped','mouseMoved','mouseDragged','mousePressed','mouseReleased','mouseClicked','touchStarted','touchMoved','touchEnded'];
var p5constants = ['HALF_PI','PI','QUARTER_PI','TAU','TWO_PI','frameCount','focused','displayWidth','displayHeight','windowWidth','windowHeight','windowResized','width','height','deviceOrientation','accelerationX','accelerationY','accelerationZ','pAccelerationX','pAccelerationY','pAccelerationZ','keyIsPressed','key','keyCode','mouseX','mouseY','pmouseX','pmouseY','winMouseX','winMouseY','pwinMouseX','pwinMouseY','mouseButton','mouseIsPressed','pixels[]','touchX','touchY','ptouchX','ptouchY','touches[]','touchIsDown','RGB','HSB','CLOSE'];
var p5methods = ['alpha','blue','brightness','color','green','hue','lerpColor','red','saturation','background','clear','colorMode','fill','noFill','noStroke','stroke','remove','noLoop','loop','push','pop','redraw','append','arrayCopy','concat','reverse','shorten','shuffle','sort','splice','subset','float','int','join','match','matchAll','nf','nfc','nfp','nfs','split','splitTokens','trim','save','cursor','frameRate','noCursor','fullscreen','devicePixelScaling','getURL','getURLPath','getURLParams','createImage','loadImage','image','tint','noTint','imageMode','blend','copy','filter','get','loadPixels','set','updatePixels','setMoveThreshold','onDeviceMove','onDeviceTurn','loadJSON','loadStrings','loadTable','loadXML','httpGet','httpPost','httpDo','keyIsDown','mouseWheel','day','hour','minute','millis','month','second','year','createVector','abs','ceil','constrain','dist','exp','floor','lerp','log','mag','map','max','min','norm','pow','sq','sqrt','noise','noiseDetail','noiseSeed','randomSeed','random','randomGaussian','acos','asin','atan','atan2','cos','sin','tan','degrees','radians','angleMode','print','createCanvas','resizeCanvas','noCanvas','createGraphics','blendMode','arc','ellipse','line','point','quad','rect','triangle','ellipseMode','noSmooth','rectMode','smooth','strokeCap','strokeJoin','strokeWeight','bezier','bezierPoint','bezierTangent','curve','curveTightness','curvePoint','curveTangent','beginContour','beginShape','bezierVertex','curveVertex','endContour','endShape','quadraticVertex','vertex','applyMatrix','resetMatrix','rotate','scale','shearX','shearY','translate','textAlign','textLeading','textSize','textStyle','textWidth','text','textFont'];

var host;

var editor;
var lastPlayedCodeText;
var activeSketch;


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
	console.log("attempt to save 111!");
	//var socket = io.connect(host);
	var socket = io.connect('http://localhost:5000');
	console.log("attempt to save 222!");
	socket.emit('saveSketch', { 
		codeText: codeText, 
		thumb: imageText });
	console.log("attempt to save 333!");
	
};

// there is almost definitely a better way to instantiate a new p5 script then doing this...
var parseSketchToP5Instance = function(s){
	for (var i=0; i<p5constants.length; i++) {
		s = s.replace(RegExp(p5constants[i], 'g'), 'p.'+p5constants[i]);
	}
	for (var i=0; i<p5methods.length; i++) {
		s = s.replace(RegExp(p5methods[i]+'( )*\\(', 'g'), 'p.'+p5methods[i]+'(');
	}
	for (var i=0; i<p5functions.length; i++) {
		s = s.replace(RegExp("function( )+"+p5functions[i]+"( )*\\(", 'g'), 'p.'+p5functions[i]+' = function (');
	}
	s = 'var sketch = function (p) {\n'+s+'\n};\nactiveSketch.remove();\nactiveSketch = new p5(sketch, myP5);\n';
	return s;
};

function playCode(code) {
	lastPlayedCodeText = code;
	var instructions = parseSketchToP5Instance(code);
	var F = new Function (instructions);
	F();
};

var playEditor = function() {
	playCode(editor.getValue());
};

function saveCanvas2() {
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
	        console.log("attempt to save!");
	        saveSketchToServer(lastPlayedCodeText, thumbnail);
	        console.log("attempt to save DONE!");
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
	activeSketch = new p5('', myP5);


	var socket = io.connect(host);

	console.log("conencted to " + host);

	// did we receive a sketch?
	socket.on('sketchData', function (data) {
		editor.setValue(data.codeText);	// insert code into ace editor
		playCode(data.codeText);
	});

	// is a specific sketch requested?
	id = window.location.href.match(/\?id=([\w-]{24})/);
	if (id != null) {
		socket.emit('requestSketch', {_id: id[1]});
	}	
	else {
		socket.emit('requestRandomSketch');
	}

	console.log("made it to the end");
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

host = location.origin;	//'http://localhost:5000';

window.onload = function() {
	showEditor();
};
