Sandbox for creating [p5.js](p5js.org) sketches. Create sketches, save / load / edit / browse contributed sketches from others. [App is running live here](http://p5js-sandbox.herokuapp.com/).

## Install

First install the required node modules from the package.json file by running:

	npm install
	
Or you can do each module manually...

	npm install express
	npm install socket.io
	npm install mongodb

You then have to setup a [mongodb](https://www.mongodb.com/) database. Easiest way to do this is to use [mongolab for node.js](https://mongolab.com) which creates a database on Amazon EC2 for you. The following instructions are for doing that, or you can setup mongodb on your own machine and run it locally only. 

Deploy the app to [heroku](https://www.heroku.com/) and then add a mongolab db by running:

	heroku create
	heroku addons:create mongolab

Then run the following command to the get the URI of your new mongodb instance.

	heroku config | grep MONGOLAB_URI
	
	// you should see something like this:
	->MONGOLAB_URI => mongodb://heroku_app1234:random_password@ds029017.mongolab.com:29017/heroku_app1234

Copy the address given to you in the previous step, then go to the file `server.js`, and replace the following line with the address above.

	var uri = 'mongodb:....'

Push all the changes to heroku

	git add *
	git commit -m "initial commit"
	git push heroku master

Then deploy and run!

	heroku ps:scale web=1
	heroku open
	
### Running locally

The app can also be run locally.

	node server.js
	
### Bugs/to-do

 * Saving takes too long (5-10 sec), mostly from generating the thumbnail, and doesn't finish if it's interrupted by user clicking another link
 * Sketch versioning trees (possibly hosted as github gists)
 * Users/collections/classrooms



