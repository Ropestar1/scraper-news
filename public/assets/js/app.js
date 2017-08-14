$(document).on("click", "#btn-scrape", function(event) {
  event.preventDefault();

  console.log('scrape clicked');
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  .done(function(data) {
    console.log(data);
  })
});

$(document).on("click", "#btn-save", function(event) {
  event.preventDefault();

  var thisId = $(this).attr("data-id");

  console.log('saved clicked');
  $.ajax({
    method: "POST",
    url: "saved/" + thisId
  })
  .done(function(data) {
    console.log('data', data);
  })
});

$(document).on("click", "#btn-unsave", function(event) {
  event.preventDefault();

  var thisId = $(this).attr("data-id");

  console.log('unsaved clicked');
  $.ajax({
    method: "POST",
    url: "/unsave/" + thisId
  })
  .done(function(data) {
    console.log(data);
  })
});

$(document).on("click", "#btn-add-note", function(event) {
  event.preventDefault();

  var thisId = $(this).attr("data-id");
  // console.log('thisId Value', thisId);
  // console.log('textarea#' + thisId + 'note-input');
  var noteBody = $('textarea#' + thisId + 'note-input').val().trim();
  console.log('noteBody value', noteBody);

  console.log('add note clicked');
  $.ajax({
    method: "POST",
    url: "/article/notes/" + thisId,
    data: {body: noteBody} //does this line work right????
  })
  .done(function(dataFromServer) {
    console.log(dataFromServer);
  })
});

// $(document).on("click", "#btn-delete-note", function(event) {
//   event.preventDefault();

//   var thisId = $(this).attr("data-id");

//   console.log('unsaved clicked');
//   $.ajax({
//     method: "DELETE",
//     url: "/article/notes/" + thisId
//   })
//   .done(function(data) {
//     console.log(data);
//   })
// });







// // Whenever someone clicks a p tag
// $(document).on("click", "p", function() {
//   // Empty the notes from the note section
//   $("#notes").empty();
//   // Save the id from the p tag
//   var thisId = $(this).attr("data-id");

//   // Now make an ajax call for the Article
//   $.ajax({
//     method: "GET",
//     url: "/articles/" + thisId
//   })
//     // With that done, add the note information to the page
//     .done(function(data) {
//       console.log(data);
//       // The title of the article
//       $("#notes").append("<h2>" + data.title + "</h2>");
//       // An input to enter a new title
//       $("#notes").append("<input id='titleinput' name='title' >");
//       // A textarea to add a new note body
//       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//       // A button to submit a new note, with the id of the article saved to it
//       $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//       // If there's a note in the article
//       if (data.note) {
//         // Place the title of the note in the title input
//         $("#titleinput").val(data.note.title);
//         // Place the body of the note in the body textarea
//         $("#bodyinput").val(data.note.body);
//       }
//     });
// });

// // When you click the savenote button
// $(document).on("click", "#savenote", function() {
//   // Grab the id associated with the article from the submit button
//   var thisId = $(this).attr("data-id");

//   // Run a POST request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: "POST",
//     url: "/articles/" + thisId,
//     data: {
//       // Value taken from title input
//       title: $("#titleinput").val(),
//       // Value taken from note textarea
//       body: $("#bodyinput").val()
//     }
//   })
//     // With that done
//     .done(function(data) {
//       // Log the response
//       console.log(data);
//       // Empty the notes section
//       $("#notes").empty();
//     });

//   // Also, remove the values entered in the input and textarea for note entry
//   $("#titleinput").val("");
//   $("#bodyinput").val("");
// });
