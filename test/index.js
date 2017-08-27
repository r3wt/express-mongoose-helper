var app = require('express')();

require('../index')(app,{
	path: __dirname + '/models/',
	connectionString: 'mongodb://localhost/express-mongoose-helper-testdb',
	debug: true
});

app.on('mongoose.models.ready',function(){
	
	for(var prop in app.model){
		console.log(prop);
	}
	
	app.listen(3000);
	
});

