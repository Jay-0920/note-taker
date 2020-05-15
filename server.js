// Dependencies
// =============================================================
const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");

//Use util to create promise with read and write files
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// Sets up the Express App
// =============================================================
const server = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// Declare folder to be able to access from files
server.use(express.static("public"));

//File path for the user to input notes
server.get("/notes", (req, res) =>{
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

//get json file db
server.get("/api/notes", (req, res) =>{
    //Read JSON file
    fs.readFile(path.join(__dirname, "/db/db.json"), (err,data) =>{
        if(err) throw err;

        // return parsed JSON
        return res.json(JSON.parse(data));
    });
});

//Add to the JSON file db
server.post("/api/notes", (req,res) => {
    //Grab the request
    const newNote = req.body;

    //Read current state of JSON file
    readFileAsync(path.join(__dirname, "/db/db.json"), "utf-8").then(data =>{
        //Parse the returned data
        const api = JSON.parse(data);
        //add an ID number to the note
        newNote.id = api.length + 1;
        //Add new note to the API
        api.push(newNote);
        //Write new API to the db file
        writeFileAsync(path.join(__dirname, "/db/db.json"), JSON.stringify(api)).then(err =>{
            if(err) throw err;
            console.log("value added to file");
        });
        //Return api to post
        res.json(api);
    });
});

//delete item from the API
server.delete("/api/notes/:id", (req, res) =>{
    //Grab the id for the note to be deleted
    const note = req.params.id;
    //read current db file
    readFileAsync(path.join(__dirname, "/db/db.json"), "utf-8").then(data =>{
        //Parse the data to usable api
        const api = JSON.parse(data);
        //Go through API and look for note
        for(const currentNote of api)
            if(currentNote.id == note)
                api.splice(api.indexOf(currentNote),1);//Remove the API value 
        //Go through the newly altered api to regive them IDs
        for(let i = 0; i < api.length; i++)
            api[i].id = i + 1;
        //Rewrite API to the file db
        writeFileAsync(path.join(__dirname, "/db/db.json"), JSON.stringify(api)).then(err =>{
            if(err) throw err;
            console.log("File Updated");
        });
        //Return api for postman use
        return res.json(api);
    });
});

// Default route to the index page
server.get("*", (req, res) =>{
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

// =============================================================
server.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});