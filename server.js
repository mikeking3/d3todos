var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));

var compression = require('compression');
app.use(compression());

app.get('/', function(req, res){
    res.redirect(301, '/todos.htm');
});

app.listen(3000);
