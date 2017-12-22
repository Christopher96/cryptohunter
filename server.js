const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

global.appRoot = path.resolve(__dirname);

const api = require('./routes/api');


const port = 4000;

const app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Set static folder
app.use(express.static(path.join(__dirname, 'client')));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use('/api', api);

app.listen(port, function(){
    console.log("Started server at port ", port);
});
