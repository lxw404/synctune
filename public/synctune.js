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
const WATCHDOG_DELAY = 10000; // Delay for anti-locking mechanism

// Globals
//var rawList = []; // Current raw list of gallery elements
var widget_sc = {}; // Soundcloud widget
var widget_yt = {}; // YouTube widget
var wt = '';        // Current widget type
var playlist = [];  // Current playlist
var jn = 0;         // Current request number
var cmdQueue = ['load']; // Queue of commands
window.cmdQueue = cmdQueue;

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
    var valid = false;
    
    if (cmd == "play"){
        valid = true;
        console.log("PLAY");
        if (wt == 'yt'){
            var st = widget_yt.getPlayerState();
            if (st == 1){
                console.log("Already playing.");
                cmdQueue.shift();
            }
            else {
                console.log("TRY PLAY");
                widget_yt.playVideo();
            }
        }
        else if (wt == 'sc'){
            widget_sc.play();
        }
        else {
            console.error("No player to play.");
            cmdQueue.shift();
        }
    }
    else if (cmd == "pause"){
        valid = true;
        console.log("PAUSE");
        if (wt == 'yt'){
            var st = widget_yt.getPlayerState();
            if (st != 1){
                console.log("Already paused.");
                cmdQueue.shift();
            }
            else {
                widget_yt.pauseVideo();
            }
        }
        else if (wt == 'sc'){
            widget_sc.isPaused(function(res){
                if (res){
                    console.log("Already paused.");
                    cmdQueue.shift();
                }
                else {
                    widget_sc.pause();
                }
            });
        }
        else {
            console.error("No player to pause.");
            cmdQueue.shift();
        }
    }
    else {
        // Regular expression check
        var pat1 = /load https?:\/\/(?:www\.)?soundcloud\.com(\/[\S]+)/g;
        var pat2 = /load https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\S]{11})/g;
        var mat1 = pat1.exec(cmd);
        var mat2 = pat2.exec(cmd);
        if (mat1 != null){
            if (mat1.length == 2){
                valid = true;
                console.log("LOAD SC: " + mat1[1]);
                if (wt == 'yt'){
                    widget_yt.stopVideo();
                }
                wt = 'sc'; // Switch widget type
                widget_sc.load(mat1[1], {
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
        else if (mat2 != null){
            if (mat2.length == 2){
                valid = true;
                console.log("LOAD YT: " + mat2[1]);
                if (wt == 'sc'){
                    widget_sc.pause();
                }
                wt = 'yt'; // Switch widget type
                widget_yt.cueVideoById(mat2[1]);
            }
        }
        else {
            var pat = /seek ([\d]+)/g;
            mat = pat.exec(cmd);
            //console.log(mat);
            if (mat != null){
                if (mat.length == 2){
                    valid = true;
                    console.log("SEEK: " + mat[1]);
                    if (wt == 'yt'){
                        widget_yt.seekTo(parseFloat(mat[1], 10)/1000.0);
                    }
                    else if (wt == 'sc'){
                        widget_sc.seekTo(parseInt(mat[1], 10));
                    }
                    else {
                        console.error("No player to seek.");
                        cmdQueue.shift();
                    }
                }
            }
        }
    }
    
    // Remove command from queue if invalid
    if (!valid){
        cmdQueue.shift();
        console.error("INVALID COMMAND");
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
                if (('cmd' in data) && !($.isEmptyObject(widget_sc)) && !($.isEmptyObject(widget_yt))){
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
    // Create iframes
    var ifr_sc = document.createElement('iframe');
    ifr_sc.setAttribute('id', 'player-sc');
    ifr_sc.setAttribute('type', 'text/html');
    ifr_sc.setAttribute('width', '0%');
    ifr_sc.setAttribute('height', '0');
    ifr_sc.setAttribute('scrolling', 'no');
    ifr_sc.setAttribute('frameborder', 'no');
    ifr_sc.setAttribute('allow', 'autoplay');
    ifr_sc.setAttribute('style', 'visibility: hidden;');
    ifr_sc.setAttribute('src', 'https://w.soundcloud.com/player/?url=');
    var ifr_yt = document.createElement('iframe');
    ifr_yt.setAttribute('id', 'player-yt');
    ifr_yt.setAttribute('type', 'text/html');
    ifr_yt.setAttribute('width', '0%');
    ifr_yt.setAttribute('height', '0');
    ifr_yt.setAttribute('scrolling', 'no');
    ifr_yt.setAttribute('frameborder', 'no');
    ifr_yt.setAttribute('allow', 'autoplay');
    ifr_yt.setAttribute('style', 'visibility: hidden;');
    ifr_yt.setAttribute('src', 'http://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1');
    var ifr = document.getElementById('ifr');
    ifr.appendChild(ifr_sc);
    ifr.appendChild(ifr_yt);
    
    // Initialize YT player
    var tag = document.createElement('script');
    tag.id = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = function() {
        widget_yt = new YT.Player('player-yt', {
            events: {
                'onReady': function(e){
                    console.log("READY YT");
                    console.log(e.target == widget_yt);
                },
                'onStateChange': function(e){
                    console.log(e);
                    if ([0,1,2,5].indexOf(e.data) > -1){
                        if (e.data == 0){
                            // Finished
                            console.log("FINISHED YT");
                        }
                        else if (e.data == 1){
                            // Playing
                            console.log("PLAYING YT");
                        }
                        else if (e.data == 2){
                            // Paused
                            console.log("PAUSED YT");
                        }
                        else if (e.data == 5){
                            // Cued
                            console.log("CUED YT");
                        }
                        cmdQueue.shift();
                        if (cmdQueue.length > 0){
                            execCmd(cmdQueue[0]);
                        }
                    }
                }
            }
        });
    }
    
    // Initialize SC player
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
    var ifr_sc = document.querySelector('#player-sc');
    widget_sc = SC.Widget(ifr_sc);
    
    // Bind SC player events
    widget_sc.bind(SC.Widget.Events.READY, function(e){
        console.log("READY SC");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
    
    widget_sc.bind(SC.Widget.Events.PLAY, function(e){
        console.log("PLAYING SC");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
    
    widget_sc.bind(SC.Widget.Events.PAUSE, function(e){
        console.log("PAUSED SC");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
    
    widget_sc.bind(SC.Widget.Events.SEEK, function(e){
        console.log("SEEKED SC");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
    
    widget_sc.bind(SC.Widget.Events.FINISH, function(e){
        console.log("FINISHED SC");
        cmdQueue.shift();
        if (cmdQueue.length > 0){
            execCmd(cmdQueue[0]);
        }
    });
});