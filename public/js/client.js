var p5functions = ['preload','setup','draw','keyPressed','keyReleased','keyTyped','mouseMoved','mouseDragged','mousePressed','mouseReleased','mouseClicked','touchStarted','touchMoved','touchEnded'];
// var p5constants = ['ARROW','CROSS','HAND','MOVE','TEXT','WAIT','HALF_PI','PI','QUARTER_PI','TAU','TWO_PI','DEGREES','RADIANS','CORNER','CORNERS','RADIUS','RIGHT','LEFT','CENTER','TOP','BOTTOM','BASELINE','POINTS','LINES','TRIANGLES','TRIANGLE_FAN','TRIANGLE_STRIP','QUADS','QUAD_STRIP','CLOSE','OPEN','CHORD','PIE','PROJECT','SQUARE','ROUND','BEVEL','MITER','RGB','HSB','AUTO','ALT','BACKSPACE','CONTROL','DELETE','DOWN_ARROW','ENTER','ESCAPE','LEFT_ARROW','OPTION','RETURN','RIGHT_ARROW','SHIFT','TAB','UP_ARROW','BLEND','ADD','DARKEST','LIGHTEST','DIFFERENCE','EXCLUSION','MULTIPLY','SCREEN','REPLACE','OVERLAY','HARD_LIGHT','SOFT_LIGHT','DODGE','BURN','THRESHOLD','GRAY','OPAQUE','INVERT','POSTERIZE','DILATE','ERODE','BLUR','NORMAL','ITALIC','BOLD','LINEAR','QUADRATIC','BEZIER','CURVE'];
// var p5values =  ['frameCount','focused','displayWidth','displayHeight','windowWidth','windowHeight','windowResized','width','height','deviceOrientation','accelerationX','accelerationY','accelerationZ','pAccelerationX','pAccelerationY','pAccelerationZ','keyIsPressed','key','keyCode','mouseX','mouseY','pmouseX','pmouseY','winMouseX','winMouseY','pwinMouseX','pwinMouseY','mouseButton','mouseIsPressed','pixels[]','touchX','touchY','ptouchX','ptouchY','touches[]','touchIsDown']
// var p5methods = ['alpha','blue','brightness','color','green','hue','lerpColor','red','saturation','background','clear','colorMode','fill','noFill','noStroke','stroke','remove','noLoop','loop','push','pop','redraw','append','arrayCopy','concat','reverse','shorten','shuffle','sort','splice','subset','float','int','join','match','matchAll','nf','nfc','nfp','nfs','split','splitTokens','trim','save','cursor','frameRate','noCursor','fullscreen','devicePixelScaling','getURL','getURLPath','getURLParams','createImage','loadImage','image','tint','noTint','imageMode','blend','copy','filter','get','loadPixels','set','updatePixels','setMoveThreshold','onDeviceMove','onDeviceTurn','loadJSON','loadStrings','loadTable','loadXML','httpGet','httpPost','httpDo','keyIsDown','mouseWheel','day','hour','minute','millis','month','second','year','createVector','abs','ceil','constrain','dist','exp','floor','lerp','log','mag','map','max','min','norm','pow','sq','sqrt','noise','noiseDetail','noiseSeed','randomSeed','random','randomGaussian','acos','asin','atan','atan2','cos','sin','tan','degrees','radians','angleMode','print','createCanvas','resizeCanvas','noCanvas','createGraphics','blendMode','arc','ellipse','line','point','quad','rect','triangle','ellipseMode','noSmooth','rectMode','smooth','strokeCap','strokeJoin','strokeWeight','bezier','bezierPoint','bezierTangent','curve','curveTightness','curvePoint','curveTangent','beginContour','beginShape','bezierVertex','curveVertex','endContour','endShape','quadraticVertex','vertex','applyMatrix','resetMatrix','rotate','scale','shearX','shearY','translate','textAlign','textLeading','textSize','textStyle','textWidth','text','textFont'];

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
	var socket = io.connect(host);
	socket.emit('saveSketch', { 
		codeText: codeText, 
		thumb: imageText });
	console.log("sent sketch to server!");
	toggleSaving(false);
};

// adapted from p5js.org, originally by Lauren McCarthy
// https://github.com/processing/p5.js-website/blob/master/js/render.js
var playCode = function(code) {
  var runnable = code;
  var _p5 = p5;

  var s = function( p ) {
    if (runnable.indexOf('setup()') === -1 && runnable.indexOf('draw()') === -1){
      p.setup = function() {
        p.createCanvas(100, 100);
        p.background(200);
        with (p) {
          eval(runnable);
        }
      }
    }
    else {

      with (p) {
        eval(runnable);
      }

      var fxns = p5functions;
      fxns.forEach(function(f) { 
        if (runnable.indexOf(f) !== -1) {
          with (p) {
            p[f] = eval(f);
          }
        }
      });

      if (typeof p.setup === 'undefined') {
        p.setup = function() {
          p.createCanvas(100, 100);
          p.background(200);
        }
      }
    }
  };

  // instantiate the p5 instance
  var myp5 = new _p5(s, myP5);

  setTimeout(function() {
    if ( typeof(activeSketch !== 'undefined') ) {
      activeSketch.remove();
    }
    activeSketch = myp5;
  }, 100);

};

function playEditor() {
	playCode(editor.getValue());
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
	activeSketch = new p5('', myP5);

	var socket = io.connect(host);

	// did we receive a sketch?
	socket.on('sketchData', function (data) {
		editor.setValue(data.codeText);	// insert code into ace editor
		playCode(data.codeText);
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
