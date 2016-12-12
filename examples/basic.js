//an example mongoose model in express-mongoose-helper

module.exports = function( Helper, Types ){

	//creates a mongoose model named user and adds it to the express app.
	Helper.model('User',{
		name: {
			first: String,
			middle: String,
			last: String,
		},
		email: String,
		referredBy: { type: types.ObjectId, ref: 'User',, default: null }
	},function(schema){
		//here you can add indexes, static methods, instance methods, plugins etc to the schema.
		schema.index({ email: 1},{unique: true});
	});
	
	// now you can access the model like `app.models.User` from your controllers.

};