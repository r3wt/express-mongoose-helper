module.exports = function( mongoose, models, options ){
	
	var helper = function helper(){};
	
	helper.prototype.clean = function(){
		delete this._name;
		delete this._schema;
	};
	
	helper.prototype.name = function(n){
		this._name = n;
	};
	
	helper.prototype.schema = function(s,cb){
		this._schema = new mongoose.Schema(s);
		
		if(typeof cb == 'function'){
			cb(this._schema);
		}
	};
	
	helper.prototype.save = function(){
		models[this._name] = mongoose.model(this._name,this._schema);
		options.log('`express-mongoose-helper` created model `'+this_name'`');
		this.clean();
	};
	
	helper.prototype.model = function(name,schema,cb){
		this.name(name);
		this.schema(schema,cb);
		this.save();
	};
	
	return new helper();
};