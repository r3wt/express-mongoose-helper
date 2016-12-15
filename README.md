# express-mongoose-helper 

adds app.model() function and app.model[ModelName] to express.

# install
---

` npm install --save express-mongoose-helper`

# basic usage


**app.js**
```js

var app = require('express')(); // 1. include express

require('express-mongoose-helper')(app,{
	path: __dirname + '/models/',
	connectionString: 'mongodb://localhost/test',
	debug: true
});

//if you want to load your models/start your app only after the models are ready you can do this.
app.on('mongoose.models.ready',function(){
	
	for(var prop in app.model){
		console.log(prop);//model is a function, but also a k/v store of the models of your app.
	}
	
	app.listen(3000);
	
});
```
**models/User.js**
```js
//an example mongoose model in express-mongoose-helper
//your module should export a function like so.
//you can customize which arguments are injected, the defaults are shown below.
module.exports = function( app, Types ){

	//creates a mongoose model named user and adds it to the express app.
	app.model('User',{
		name: {
			first: String,
			middle: String,
			last: String,
		},
		email: String,
		referredBy: { type: Types.ObjectId, ref: 'User', default: null }
	},function(schema){
		//here you can add indexes, static methods, instance methods, plugins etc to the schema.
		schema.index({ email: 1},{unique: true});
	});
	
	// now you can access the model like `app.model.User` from your controllers.

};
```

# options
---

```js 
//default options
options = {
	connectionString: '',// mongodb connection string
	connectionOptions: {},// mongodb connection options
	path: '',// path to folder containing models
	inject: ['app','types'], //arguments to inject into each required model
	debug: false, //show log messages
	log: function(){
		return this.debug && console.log.apply(console,arguments);
	}, //default logging function, can be changed
};
```


# events
---
several events are emitted. they are listed below.
`mongoose.models.ready` = emitted when all the model files have been loaded and added to the app.
`mongoose.connected` = emitted when database connection is established.
`mongoose.disconnected` = emitted when database is disconnected.
`mongoose.error` = emitted when an error occurs establishing connection to mongodb.




# testing
---

No testing is done yet.

