var mongoose = require('mongoose'),
	_ = require('lodash'),
	fs = require('fs'),
	_options = {
		connectionString: '',
		connectionOptions: {},
		path: '',
		inject: ['app','types'],
		debug: false,
		log: function(){
			return this.debug && console.log.apply(console,arguments);
		},
		extend: function(mongoose){} //extend mongoose with global plugins, custom types, etc.
	};

module.exports = function(app,options){
	
	if(typeof options != 'object'){
		throw new Error('`express-mongoose-helper` expects parameter options to be of type object.');
	}
	
	options = _.extend({},_options,options);
	
	if(typeof options.extend == 'function'){
		options.extend(mongoose);
	}
	
	var model = function model(name,schema,callback){
	
		var schema = new mongoose.Schema(schema);
		
		if(typeof callback == 'function'){
			callback(schema);
		}
		
		model[name] = mongoose.model(name,schema);
		
		options.log('`express-mongoose-helper` created model `app.model.'+name+'`');
		
	};
	
	Object.defineProperty(app,'model',{
		get: function(){ return model; },
		set: function(){ return false; }
	});
	
	mongoose.connect(options.connectionString,options.connectionOptions);
	
	mongoose.connection.on('connected', function () {  
	  options.log('`express-mongoose-helper` Mongoose connected.');
	  app.emit('mongoose.connected');
	}); 

	// If the connection throws an error
	mongoose.connection.on('error',function (err) { 
	  options.log('`express-mongoose-helper` error'+err);
	  app.emit('mongoose.error',err);
	}); 

	// When the connection is disconnected
	mongoose.connection.on('disconnected', function () {  
	  app.emit('mongoose.disconnected');
	});
	
	if(options.path == ''){
		throw new Error('`express-mongoose-helper` option `path` cannot be blank.');
	}
	
	//injectables
	var vars = {
		mongoose: mongoose,
		model: mongoose.model,
		schema: mongoose.Schema,
		types: mongoose.Schema.Types,
		app: app
	};
	
	var inject = [];
	
	for(var i=0;i<options.inject.length;i++){
		if(vars.hasOwnProperty(options.inject[i])){
			inject.push(vars[options.inject[i]]);
		}
	}
	
	fs.readdir(options.path,function(err,files){
		
		files.forEach(function(file){
			
			if(file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2) == 'js'){
				options.log('`express-mongoose-helper` loading file `'+file+'`');
				var f = require(options.path+file);
				
				if(typeof f != 'function'){
					throw new Error('`express-mongoose-helper` expects required modules to be a function');
				}
				
				f.apply(f,inject);
				
			}
			
		});
		
		app.emit('mongoose.models.ready');
		
	});
	
};