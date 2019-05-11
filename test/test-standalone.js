const {standalone} = require('../index');

const app = standalone({
	path: __dirname + '/models/',
	connectionString: 'mongodb://localhost/express-mongoose-helper-testdb',
	debug: true
});

app.on('mongoose.models.ready',function(){
	
	for(var prop in app.model){
		console.log(prop);
	}

    console.log('Success! everything is working normally. goodbye');
    process.exit(0);
	
});