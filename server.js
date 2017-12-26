var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var api = require('./routes/api');

var port = 4000;
var app = express();

app.use(morgan('dev'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '/public/app/index.html'));
});

app.use('/api', api);

app.listen(port, function(){
    console.log("Started server at port ", port);
});
