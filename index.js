var _models = {};
var _ = require('lodash');
var _mongoose = require('mongoose');

var _log = false;

var _options = {
	connectionString: '',
	connectionOptions: {},
	path: '',
	inject: ['helper','types'],
	debug: false,
	log: function(){
		return this.debug && console.log.apply(console,arguments);
	},
};

var helper = require('./helper.js')(_mongoose,_models);

//injectables
var vars = {
	mongoose: _mongoose,
	model: _mongoose.model,
	schema: _mongoose.Schema,
	types: _mongoose.Schema.Types,
	helper: helper
};

var _mongo = function _mongo( options ) {
	
	if(typeof options != 'object'){
		throw new Error('`express-mongoose-helper` expects parameter options to be of type object.');
	}
	
	options = _.extend({},_options,options);
	
	var helper = require('./helper.js')(_mongoose,_models,options);

	//injectables
	var vars = {
		mongoose: _mongoose,
		model: _mongoose.model,
		schema: _mongoose.Schema,
		types: _mongoose.Schema.Types,
		helper: helper
	};
	
	if(options.connectionString == ''){
		throw new Error('`express-mongoose-helper` option `connectionString` cannot be blank.');
	}
	
	_mongoose.connect(options.connectionString,options.connectionOptions);
	
	_mongoose.connection.on('connected', function () {  
	  options.log('`express-mongoose-helper` Mongoose connected.');
	}); 

	// If the connection throws an error
	_mongoose.connection.on('error',function (err) {  
	  var m = '`express-mongoose-helper` error connecting to database with message: '+err;
	  throw new Error( m );
	}); 

	// When the connection is disconnected
	_mongoose.connection.on('disconnected', function () {  
	  options.log('`express-mongoose-helper` Mongoose disconnected.'); 
	});
	
	if(options.path == ''){
		throw new Error('`express-mongoose-helper` option `path` cannot be blank.');
	}
	
	var app = this;
	
	Object.defineProperty(app, 'models', {
	  get: function() { return _models; },
	  set: function( v ) { return false; },
	  writeable: false
	});
	
	var inject = [];
	
	for(var i=0;i<options.inject.length;i++){
		if(vars.hasOwnProperty(options.inject[i])){
			inject.push(vars[options.inject[i]]);
		}
	}
	
	fs.readDir(options.path,function(err,files){
		
		files.forEach(function(file){
			
			if(file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2) == 'js'){
				options.log('`express-mongoose-helper` loading file `'+file+'`');
				var f = require(file);
				
				if(typeof f != 'function'){
					throw new Error('`express-mongoose-helper` expects required modules to be a function');
				}
				
				f.apply(f,inject);
				
			}
			
		});
		
	});

};

module.exports = function( app ){
	
	app.mongoose = _mongo.bind( app );
	
};