var readline = require('readline');
var express = require('express');
var app = express();

// Local variables
var linkURL = '';
var gTitle = '';
var msgQueue = [];

app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});


app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/synctune.css', function (req, res) {
    res.sendFile( __dirname + "/" + "synctune.css" );
});

app.get('/synctune.js', function (req, res) {
    res.sendFile( __dirname + "/" + "synctune.js" );
});

app.get('/*.js', function (req, res) {
    // Send data
    
});

app.get('/*.rq', function(req, res){
    // Send data
    //var id = req.url.split('.')[0];
    //id = id.replace(/\/+/g, '');
});

app.get('/rq', function(req, res){
    // Send data
    //console.log("Got a request.");
    //console.log(req.url);
    /*var obj = {"link": linkURL};
    if (gTitle != ''){
        obj['title'] = gTitle;
    }*/
    var obj = {};
    if (msgQueue.length > 0){
        obj = {'cmd': msgQueue[0]};
        
        // Dequeue
        msgQueue.shift();
    }
    res.jsonp(obj);  // Send JSON wrapped with callback
});

/*app.get('/gq', function(req, res){
    // Show link
    console.log("Got a link: " + req.url);
    res.jsonp({});
});*/

// Listen on port
var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
   
    console.log("SyncTune server listening at http://localhost:%s", port);
    
    // Read input from user
    var rl = readline.createInterface({input: process.stdin, output: process.stdout});
    var recLoop = function(){
        rl.question('Command> ', function (answer) {
            // Queue command
            msgQueue.push(answer);
            
            // Loop
            recLoop();
        });
    };
    recLoop();
});