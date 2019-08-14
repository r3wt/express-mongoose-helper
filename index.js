const mongoose = require('mongoose');
const {EventEmitter} = require('events');
const fs = require('fs');
const defaultOptions = {
    connectionString: '',
    connectionOptions: {},
    path: '',
    inject: [],//inject additional options
    debug: false,
    log: function(){
        return this.debug && console.log.apply(console,arguments);
    },
    extend: function(mongoose){} //extend mongoose with global plugins, custom types, etc.
};
    
// taken from https://stackoverflow.com/a/55390173/2401804
const semverGreaterThan = function(versionA, versionB){
  var versionsA = versionA.split(/\./g),
    versionsB = versionB.split(/\./g)
  while (versionsA.length || versionsB.length) {
    var a = Number(versionsA.shift()), b = Number(versionsB.shift())
    if (a == b)
      continue
    return (a > b || isNaN(b))
  }
  return false
}

module.exports = helper;

function helper(app,userOptions){
    
    if(typeof userOptions != 'object'){
        throw new Error('`express-mongoose-helper` expects parameter options to be of type object.');
    }
    
    const options = {...defaultOptions,...userOptions};
    
    if(typeof options.extend == 'function'){
        options.extend(mongoose);
    }
    
    function model(name,schema,schemaOptions,callback){
        
        // to keep backwards compatibility accept schemaOptions/callback in either order
        switch(true){
            case (typeof schemaOptions == 'object' && typeof callback == 'function'):
            break;
            case (typeof schemaOptions == 'function' && typeof callback == 'object'):
                var tmp = schemaOptions;
                schemaOptions = callback;
                callback = tmp;
            break;
            case (typeof schemaOptions != 'function' && !schemaOptions):
                schemaOptions = {};//could break if internal implementation of option handling changes (unlikely)
            break;
            case (typeof schemaOptions == 'function' && typeof callback == 'undefined'):
                callback = schemaOptions;
                schemaOptions = {};
            break;
        }
    
        var schema = new mongoose.Schema(schema,schemaOptions);
        
        if(typeof callback === 'function'){
            callback(schema,mongoose);
        }

        if(model.hasOwnProperty(name)){
            throw new Error(`\`express-mongoose-helper\` \`app.model.${name}\` already exists.`);
        }
        
        model[name] = mongoose.model(name,schema);

        model[name].mongoose = ()=> mongoose;//give em a function to retrieve the mongoose instance
        
        options.log('`express-mongoose-helper` created model `app.model.'+name+'`');
        
        return model[name];// in case they need to do something with the model
    };
	
	model.exists = function( modelName ){
		return model.hasOwnProperty( modelName ) && model[modelName] instanceof mongoose.model;
	};
    
    Object.defineProperty(app,'model',{
        get: function(){ return model; },
        set: function(){ return false; }
    });

    if(semverGreaterThan(mongoose.version,'4.11.0') && !semverGreaterThan(mongoose.version,'5.0.0')){
        options.connectionOptions.useMongoClient = true;// opt into mongoose >4.11 new connection logic, but wait, it can't be over version 5  
    }
    if(semverGreaterThan(mongoose.version,'5.5.5')){
        options.connectionOptions.useFindAndModify = false;
    }
    
    options.connectionOptions.useNewUrlParser = true;
    
    if(semverGreaterThan(mongoose.version,'5.2.9')){
        mongoose.set('useCreateIndex', true);
    }

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
    
    const inject = [
        app,
        mongoose.Schema.Types
    ];
    
    for(var i=0;i<options.inject.length;i++){
        inject.push(options.inject[i]);//now allow user supplied variables to be injected. 
    }

    options.log('`express-mongoose-helper` is loading files from '+options.path);
    
    fs.readdir(options.path,(err,files)=>{

        options.log(files);

        if(err) {
            throw err;// throw it up throw it up
        }

        if(!Array.isArray(files)) {
            options.log('`express-mongoose-helper` no models to load');
        }else{
            files.forEach((file)=>{

                const ext = file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2);

                if(ext=='js'){
                    options.log('`express-mongoose-helper` loading file `'+file+'`');
                    var f = require(options.path+file);
                    if(typeof f !== 'function'){
                        throw new Error('`express-mongoose-helper` expects required modules to be a function');
                    }
                    
                    f(...inject);
                }

                if(ext==='mjs'){
                    //var f = import(()=>options.path+file);
                    options.log('`express-mongoose-helper` does not support loading EcmaScript Modules at this time. file `'+file+'` is ignored and not loaded.');
                }
                
            });    
        }
        
        app.emit('mongoose.models.ready');
        
    });

    return app;

}

helper.standalone = function(options){
    const app = new EventEmitter;
    return helper(app,options);
}