//Grab html items to be used throughout the script
var $noteTitle = $(".note-title")
var $noteText = $(".note-textarea");
var $saveNoteBtn = $(".save-note");
var $newNoteBtn = $(".new-note");
var $noteList = $(".list-container .list-group");

// activeNote is used to keep track of the note in the textarea
var activeNote = {};

/**
 * getNotes()
 * Purpose:  A function for getting all notes from the db
 * Parameters: None
 * Return: Ajax call with the notes API
 */
var getNotes = function() {
  return $.ajax({
    url: "/api/notes",
    method: "GET"
  });
};//End getNotes()

/**
 * saveNote()
 * Purpose:  A function for saving a note to the db
 * Parameters: note - New Note to be added
 * Return: Ajax POST method adding Notes to the API
 */
var saveNote = function(note) {
  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST"
  });
};//end saveNote()

// A function for deleting a note from the db
/**
 * deleteNote()
 * Purpose:  A function for deleting a note to the db
 * Parameters: id - id of the note to be deleted
 * Return: Ajax DELETE method to remove the desired note 
 */
var deleteNote = function(id) {
  return $.ajax({
    url: "api/notes/" + id,
    method: "DELETE"
  });
};//End deleteNote()

/**
 * renderActiveNote()
 * Purpose:  Display Active note or empty Inputs
 * Parameters: None
 * Return: None
 */
var renderActiveNote = function() {
  $saveNoteBtn.hide();
  //There is a active note id
  if (activeNote.id) 
  {
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } 
  //?there isnt a active note clicked
  else 
  {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    $noteTitle.val("");
    $noteText.val("");
  }
};//End renderActiveNote()

/**
 * handleNoteSave()
 * Purpose:  get note data from the inputs, save it to the db and update the view
 * Parameters: None
 * Return: None
 */
var handleNoteSave = function() {
  //Create New Note Object
  var newNote = {
    title: $noteTitle.val(),
    text: $noteText.val()
  };

  //Save Note, render notes and render active note
  saveNote(newNote).then(function(data) {
    getAndRenderNotes();
    renderActiveNote();
  });
};//end handleNoteSave()

/**
 * handleNoteDelete()
 * Purpose:  Delete the clicked note
 * Parameters: event - item clicked for note deletion
 * Return: None
 */
var handleNoteDelete = function(event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  //Create the note object
  var note = $(this)
    .parent(".list-group-item")
    .data();

  //If there is no note id then you grab active note ID
  if (activeNote.id === note.id) {
    activeNote = {};
  }

  //Delete note and re render the note while setting active note
  deleteNote(note.id).then(function() {
    getAndRenderNotes();
    renderActiveNote();
  });
};//end handleNoteDelete

/**
 * handleNoteView()
 * Purpose:  Set the activeNote and displays it
 * Parameters: None
 * Return: None
 */
var handleNoteView = function() {
  activeNote = $(this).data();
  renderActiveNote();
};//end handleNoteView

/**
 * handleNewNoteView()
 * Purpose:  Sets the activeNote to and empty object and allows the user to enter a new note
 * Parameters: None
 * Return: None
 */
var handleNewNoteView = function() {
  activeNote = {};
  renderActiveNote();
};//End handlenoteView()

/**
 * handleRenderSaveBtn()
 * Purpose:  Checks if title and text are empty(hide save button) if not (show save button)
 * Parameters: None
 * Return: None
 */
var handleRenderSaveBtn = function() {
  //Title and text are empty
  if (!$noteTitle.val().trim() || !$noteText.val().trim()) 
  {
    $saveNoteBtn.hide();
  } 
  //title and Tetx are not empty
  else 
  {
    $saveNoteBtn.show();
  }
};//End handleRenderSaveBtn()

/**
 * renderNoteList()
 * Purpose:  Render the list of the note titles
 * Parameters: notes - array of note objects for note rendering
 * Return: None
 */
var renderNoteList = function(notes) {
  //Empty current List
  $noteList.empty();
  //Create local array of note list items
  var noteListItems = [];
  //Go through list items
  for (var i = 0; i < notes.length; i++) {
    //Grab current note
    var note = notes[i];
    //Create new list item with button
    var $li = $("<li class='list-group-item'>").data(note);
    var $span = $("<span>").text(note.title);
    var $delBtn = $(
      "<i class='fas fa-trash-alt float-right text-danger delete-note'>"
    );
    //Append text and button to the list item
    $li.append($span, $delBtn);
    noteListItems.push($li);
  }
  //Append list item to page list
  $noteList.append(noteListItems);
};//End renderNoteList()

/**
 * getAndRenderNotes()
 * Purpose:  Get notes from the db and renders them to the sidebar
 * Parameters: None
 * Return: None
 */
var getAndRenderNotes = function() {
  return getNotes().then(function(data) {
    renderNoteList(data);
  });
};//End gerAndRenderNotes()

//Click events for key components of the page
$saveNoteBtn.on("click", handleNoteSave);
$noteList.on("click", ".list-group-item", handleNoteView);
$newNoteBtn.on("click", handleNewNoteView);
$noteList.on("click", ".delete-note", handleNoteDelete);
$noteTitle.on("keyup", handleRenderSaveBtn);
$noteText.on("keyup", handleRenderSaveBtn);

// Gets and renders the initial list of notes
getAndRenderNotes();
