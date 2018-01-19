var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var api = require('./routes/api');

var port = process.env.PORT || 4000;
var app = express();

var prod = process.env.PROD || false;
if (prod) {
    app.use(require('morgan')('dev'));
}

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use('/api', api);

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/app/index.html'));
});

app.listen(port, 'localhost');

app.on('listening', function() {
    console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});