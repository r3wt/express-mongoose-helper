var _models = {};
var _ = require('lodash');
var _mongoose = require('mongoose');
var _options = {
	connectionString: '',
	connectionOptions: {},
	path: '',
	inject: ['helper','types']
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
		throw new Error('1');
	}
	
	options = _.extend({},_options,options);
	
	if(options.connectionString == ''){
		throw new Error('2');
	}
	
	_mongoose.connect(options.connectionString,options.connectionOptions);
	
	if(options.path == ''){
		throw new Error('3');
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
				var f = require(f);
				
				if(typeof f != 'function'){
					throw new Error('express-mongoose expects required modules to be a function');
				}
				
				f.apply(f,inject);
				
			}
			
		});
		
	});

};

module.exports = function( app ){
	
	app.mongoose = _mongo.bind( app );
	
};