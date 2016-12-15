module.exports = function(app, Types){
	
	app.model('Dog',{
		name: { type: String, required: true },
		owner: { type: Types.ObjectId, ref: 'User', index: true, default: null}
	}); //callback is optional.
	
};