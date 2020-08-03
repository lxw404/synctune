# InstaGallery
*InstaGallery* is a simple gallery based front-end for displaying a list of images and associated text/links.  The easiest source of these image lists can come from [Pastebin](https://pastebin.com/) or similarly hosted raw text files.

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
Input pastebin link>
```

wherein a link to the raw text should be inputted.

Navigate to the page: [http://localhost:8081](http://localhost:8081) and you will see the client wherein the link will be requested, interpreted, and rendered.
