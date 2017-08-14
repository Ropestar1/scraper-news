var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var logger = require("morgan");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static("public"));

// CHANGE BELOW CODE WHEN DEPLOYING TO HEROKU??????
mongoose.connect("mongodb://localhost/scraping-mongoose");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});


app.get("/", function(req, res) {
  var articleArray = {
    articles: [],
  };

  Article.find({}, function(error, doc) {
    if (error) console.log(error);

    else {
      for (var i =0; i < doc.length; i++) {
        articleArray.articles.push(doc[i]);
      };
      res.render('index', articleArray);
    }
  });
});

app.get("/saved", function(req, res) {
  var savedArticleArray = {
    savedArticles: [],
  };

  Article.find({saved: true}, function(error, doc) {
    if (error) console.log(error);

    else {
      for (var i =0; i < doc.length; i++) {
        savedArticleArray.savedArticles.push(doc[i]);
      };
      res.render('saved', savedArticleArray);
    }
  });
});

app.get("/scrape", function(req, res) {
  request("http://www.echojs.com/", function(error, response, html) {

    var $ = cheerio.load(html);

    $("article h2").each(function(i, element) {

      var result = {};
      
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });
    });

    // WHY DOESN'T THE REDIRECT WORK??????
    res.redirect('/');
    // ???????????
    
  });
});

app.post("/saved/:id", function(req, res) {
  Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": true})
  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.send(doc);
    }
  });
});

app.post("/unsave/:id", function(req, res) {
  Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": false})
  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.send('removed');
    }
  });
});

app.post("/article/notes/:id", function(req, res) {
  var newNote = new Note(req.body);

  // console.log('req.body', req.body);
  Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {"notes": newNote }})
  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.send('note added');
    }
  });

  // newNote.save(function(error, doc) {
  //   if (error) res.send(error);
  //   else {
  //     // Find our user and push the new note id into the User's notes array
  //     User.findOneAndUpdate({"_id": req.params.id}, { $push: { "notes": doc._id } }, { new: true }, function(err, newdoc) {
  //       // Send any errors to the browser
  //       if (err) {
  //         res.send(err);
  //       }
  //       // Or send the newdoc to the browser
  //       else {
  //         res.send(newdoc);
  //       }
  //     });
  //   }
  // });
});



// // Create a new note or replace an existing note
// app.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   var newNote = new Note(req.body);

//   // And save the new note the db
//   newNote.save(function(error, doc) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     }
//     // Otherwise
//     else {
//       // Use the article id to find and update it's note
//       Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
//       // Execute the above query
//       .exec(function(err, doc) {
//         // Log any errors
//         if (err) {
//           console.log(err);
//         }
//         else {
//           // Or send the document to the browser
//           res.send(doc);
//         }
//       });
//     }
//   });
// });


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
