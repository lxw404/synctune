# SyncTune
*SyncTune* allows for synchronized media playing across different instances.  It provides controls for multiple media APIs including YouTube and SoundCloud.

This project contains both the front-end and back-end test benching utility.

## Requirements
The following are required to use the testbench:

* [Node.js](https://nodejs.org/)
* [Browserify](http://browserify.org/)

## Setup
Navigate to the base folder and run:

```bash
$ npm install
```

This will install all requirements for the local project.  Then to start the server, run:

```bash
$ npm start
```

This will first compile and compress the client javascript and then begin an interactive session.

You will be prompted with:
```bash
Command>
```

Navigate to the page: [http://localhost:8081](http://localhost:8081) and you will see the client wherein the link will be requested, interpreted, and rendered.

## Commands
The following commands are currently supported:

* `load <url>` - Loads a specified URL (doesn't autoplay)
* `play` - Plays the currently loaded media
* `pause` - Pauses the currently loaded media
* `seek <time>` - Seeks to the time specified in milliseconds