# express-mongoose-helper 

adds app.model() function and app.model[ModelName] to express.

# install
---

` npm install --save express-mongoose-helper`

# basic info
---
module signature
```js
	function( 
		Express.Application app, //the express application
		Object options //options for usage with the library. see options below.
	)
```

app.model function signature
> for legacy reasons, schemaOptions and callback may be given in either order, or not at all. 
```js
	app.model( 
		String name, //name of the model
		Object schema, //plain object defining a mongoose schema.
		Object schemaOptions, // optional schemaOptions to pass to the mongoose schema constructor
		Function callback //optional a function callback that receives the generated mongoose schema. for adding indexes, static methods, instance methods, plugins to model.
	)
```

model file signature (Note: you can edit what is injected to the required module, these are the defaults.)
> each model file should export a function of the following signature.
```js
	function(
		Express.Application app, //the Express app
		mongoose.Schema.Types Types,//the mongoose.Schema.Types object for convenience/brevity.
	)
```

# basic usage


**app.js**
```js

var app = require('express')(); // 1. include express

require('express-mongoose-helper')(app,{
	path: __dirname + '/models/',
	connectionString: 'mongodb://localhost/test',
	debug: true
});

//if you want to load your controllers,start your app, any other action requiring the models to be loaded/defined
// you may listen for the 'mongoose.models.ready' event like so:
app.on('mongoose.models.ready',function(){

    // your models are now available on the express app
    const dog = new app.model.Dog({
        name: 'Rowdy',
        owner: null
    });

    dog.save().then(dog=>{
        console.log(dog.name); // Rowdy
    })
	
	//load your controllers here, so that models are available.
	
	app.listen(3000);//start up our server
	
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

**new in version 1.0.7:**
- module exports a function called `standalone` for creating a standalone instance without express, useful for background scripts or with other server environments
- when constructing models with `app.model()` the model will now be returned. the model will also contain a function you can use to get the mongoose instance.
- callback to `app.model()` will now receive `mongoose` as a second argument in addition to `schema`.

**new standalone feature**
```js

const {standalone} = require('express-mongoose-helper');

const app = standalone({
	path: __dirname + '/models/',
	connectionString: 'mongodb://localhost/your-db',
	debug: true
});

app.on('mongoose.models.ready',function(){
	
	// your backend code here
	
});

```

**changes to app.model**
```js
const model = app.model('Test',{foo:String},(schema,mongoose)=>{
    //modify the schema here
    //you can use mongoose here too
});
const mongoose = model.mongoose();// do something with mongoose
```

**new in version 1.0.2, app.model supports a 4th parameter, schemaOptions**
> please note, to avoid breaking backwards compatability schemaOptions and callback can be given in either order. both are optional.
```js
module.exports = function( app, Types ){
	
	app.model('UploadedFile',{
		path: String,
		owner: { type: Types.ObjectId, ref: 'User' },
		mimetype: String,
		filesize: Number,
	}, { timestamps: true },function(schema){
	
		schema.index({ filesize: 1 });
	
	});

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
	extend: function(mongoose){} //extend mongoose with global plugins, custom types, etc.
};
```


# events
---
several events are emitted. they are listed below.
- `mongoose.models.ready` = emitted when all the model files have been loaded and added to the app.
- `mongoose.connected` = emitted when database connection is established.
- `mongoose.disconnected` = emitted when database is disconnected.
- `mongoose.error` = emitted when an error occurs establishing connection to mongodb.




# testing
---

No testing is done yet.

