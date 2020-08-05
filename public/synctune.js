// Exports
/*module.exports = {
    hlc: hlc,
    hlm: hlm
};*/

// Includes
$ = require("jquery");
var SC = require('soundcloud');

// Constants
const MAX_RETRY = 5;      // Maximum number of retries
const RETRY_DELAY = 5000; // Retry delay (ms)
const POLL_DELTA = 1000;  // Poll delta (ms)

// Globals
//var rawList = []; // Current raw list of gallery elements
var widget = {};   // Widget
var playlist = []; // Current playlist
var jn = 0;        // Current request number
var cmdQueue = ['load']; // Queue of commands

// Is an element contained within two index boundaries?
function conT(e, ind, end){
    return ((ind > e.ind) && (end < e.end));
}



// Request link (with retry)
function reqLink(linkName, i){
    $.ajax({
        url: 'https://api.codetabs.com/v1/proxy?quest=' + linkName,
        method: 'GET',
    }).done(function(res){
        // Store and render data
        //rawList = res.match(/[^\r\n]+/g);
        //showGallery(rawList);
    }).fail(function(res){
        // Handle failure to load resource
        if ((i+1) > MAX_RETRY){
            // Error
            console.error("Resource unavailable.");
        }
        else {
            // Retry
            setTimeout(function(){
                reqLink(linkName, i+1);
            }, RETRY_DELAY);
        }
    });
}

function execCmd(cmd){
    if (cmd == "play"){
        console.log("PLAY");
        widget.play();
    }
    else if (cmd == "pause"){
        console.log("PAUSE");
        widget.pause();
    }
    else {
        // Regular expression check
        var pat = /load https*:\/\/soundcloud.com(\/[\S]+)/g;
        //var mat = cmd.match(pat);
        var mat = pat.exec(cmd);
        //console.log(mat);
        //console.log(mat.length);
        if (mat != null){
            if (mat.length == 2){
                console.log("LOAD:" + mat[1]);
                widget.load(mat[1], {
                    callback: function(e){
                        console.log("LOADED");
                        cmdQueue.shift();
                        if (cmdQueue.length > 0){
                            execCmd(cmdQueue[0]);
                        }
                    }
                });
            }
        }
        else {
            pat = /seek ([\d]+)/g;
            mat = pat.exec(cmd);
            console.log(mat);
            if (mat != null){
                if (mat.length == 2){
                    console.log("SEEK: " + mat[1]);
                    widget.seekTo(parseInt(mat[1], 10));
                }
            }
        }
    }
}

function tryCmd(cmd){
    // Enqueue to prevent further execution
    cmdQueue.push(cmd);
    
    // Check if ready to execute
    if (cmdQueue.length == 1){
        execCmd(cmd);
    }
}

// Handle creating jsonp request
function onT(){
	$.ajax({
        dataType: 'jsonp',
        data: JSON.stringify({'rq_type': 1}),
        jsonp: 'callback',
        url: 'rq?callback=?',
        success: function(data) {
            if (!($.isEmptyObject(data))){
                //console.log('success');
                //console.log(JSON.stringify(data));
                
                // Check command
                if (('cmd' in data) && !($.isEmptyObject(widget))){
                    var cmd = data['cmd'];
                    tryCmd(cmd);
                }
            }
        }
    });
}

// Repeatedly poll the server
var si = setInterval(onT, POLL_DELTA);

// On document load, add content
$(document).ready(function(){
    // Initialize player
    SC.initialize({
        client_id: 'Client ID'
    });
    var track_url = '/epromofficial/koummya-1';
    /*SC.oEmbed(track_url, { auto_play: true, element: document.getElementById("con") }).then(function(oEmbed) {
        console.log('oEmbed response: ', oEmbed);
    });*/
    /*SC.stream(track_url).then(function(player){
        player.play();
    });*/
    var ifr = document.querySelector('iframe');
    widget = SC.Widget(ifr);
    
    // Bind player events
    widget.bind(SC.Widget.Events.READY, function(e){
        console.log("READY");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
    
    widget.bind(SC.Widget.Events.PLAY, function(e){
        console.log("PLAYING");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
    
    widget.bind(SC.Widget.Events.PAUSE, function(e){
        console.log("PAUSED");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
    
    widget.bind(SC.Widget.Events.SEEK, function(e){
        console.log("SEEKED");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
    
    widget.bind(SC.Widget.Events.FINISH, function(e){
        console.log("FINISHED");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
});