// Dependencies
// =============================================================
const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");

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
server.use('/public', express.static(__dirname + "/public"));

server.get("/notes", (req, res) =>{
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

server.get("/api/notes", (req, res) =>{
    let jsonFile;
    fs.readFile(path.join(__dirname, "/db/db.json"), (err,data) =>{
        if(err) throw err;

        return res.json(JSON.parse(data));
    });
});

server.post("/api/notes", (req,res) => {
    const newNote = req.body;

    readFileAsync(path.join(__dirname, "/db/db.json"), "utf-8").then(data =>{
        const api = JSON.parse(data);
        api.push(newNote);
        console.log(typeof(api));
        writeFileAsync(path.join(__dirname, "/db/db.json"), JSON.stringify(api)).then(err =>{
            if(err) throw err;
            console.log("value added to file");
        });
        res.json(api);
    });
});

server.delete("/api/notes/:id", (req, res) =>{
    const note = req.params.id;
    readFileAsync(path.join(__dirname, "/db/db.json"), "utf-8").then(data =>{
        const api = JSON.parse(data);
        for(const currentNote of api)
            if(currentNote.title == note)
                api.splice(api.indexOf(currentNote),1);

        writeFileAsync(path.join(__dirname, "/db/db.json"), JSON.stringify(api)).then(err =>{
            if(err) throw err;
            console.log("File Updated");
            res.json(api);
        })

    });
        
});

server.get("*", (req, res) =>{
    res.sendFile(path.join(__dirname, "/public/index.html"));
});



// =============================================================
server.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});