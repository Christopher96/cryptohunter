/*
 * Main file for starting server
 */

// Gets required plugins
var express = require('express');
var app = express();

var path = require('path');
var bodyParser = require('body-parser');

// Serves on public PORT or 4000
var port = process.env.PORT || 4000;

// Enables logging if developin 
var prod = process.env.PROD || false;
if (!prod) {
    app.use(require('morgan')('dev'));
}

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Attaches the API routes to the app
var api = require('./routes/api');
app.use('/api', api);

// Use static paths for public and node_modules
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

// All public URL calls gets redirected to angular router
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/app/index.html'));
});

// Start listening to given port
app.listen(port);
app.on('listening', function() {
    console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});