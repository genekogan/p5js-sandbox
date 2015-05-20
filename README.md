
First install the required node modules:

	npm install
	
Or you can do it manually...

	npm install express
	npm install socket.io
	npm install mongodb


You then have to setup a [mongodb](https://www.mongodb.com/) database. Easiest way to do this is to deploy the app to [heroku](https://www.heroku.com/) and create a free instance of [mongolab for node.js](https://mongolab.com).

	heroku create
	heroku addons:create mongolab

Then run the following command to the get the URI of your new mongodb instance.

	heroku config | grep MONGOLAB_URI
	
	// you should see something like this:
	->MONGOLAB_URI => mongodb://heroku_app1234:random_password@ds029017.mongolab.com:29017/heroku_app1234

Copy the address given to you in the previous step, then go to the file index.js, and replace the following line with the address above.

	var uri = 'mongodb:....'

Then push all the changes to heroku

	git add *
	git commit -m "initial commit"
	git push heroku master

Then deploy and run!

	heroku ps:scale web=1
	heroku open
	
You can also 


