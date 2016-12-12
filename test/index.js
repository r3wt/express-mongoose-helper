var app = require('express')();

require('../index')(app);

app.mongoose({
	path: __dirname + '/models/',
	connectionString: 'mongodb://localhost/test',
	debug: true
});

app.listen(3000);