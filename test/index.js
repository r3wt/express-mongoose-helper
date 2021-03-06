var app = require('express')();

const helper = require('../index');

helper(app,{
	path: __dirname + '/models/',
	connectionString: 'mongodb://localhost/express-mongoose-helper-testdb',
	debug: true
});

app.on('mongoose.models.ready',function(){
	
	for(var prop in app.model){
		console.log(prop);
	}
	
	app.listen(3000);

    console.log('Success! everything is working normally. goodbye');
    process.exit(0);
	
});