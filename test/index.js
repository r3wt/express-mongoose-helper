var app = require('express')();

require('../index')(app,{
	path: __dirname + '/models/',
	connectionString: 'mongodb://localhost/test',
	debug: true
});

app.on('mongoose.models.ready',function(){
	
	for(var prop in app.model){
		console.log(prop);
	}
	
	app.listen(3000);
	
});

