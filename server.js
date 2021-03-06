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

//database logic
if (process.env.MONGODB_URI || process.env.NODE_ENV === 'production') {
  const promise = mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true,
    /* other options */
  });
}
else {
  const promise = mongoose.connect('mongodb://localhost/scraping-mongoose', {
    useMongoClient: true,
    /* other options */
  });
}
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

app.post("/scrape", function(req, res) {
  request("http://www.bbc.com/news", function(error, response, html) {
    var $ = cheerio.load(html);

    $("a.gs-c-promo-heading").each(function(i, element) {
      console.log(element);

      var result = {};
      var link = $(element).attr("href");

      var fixLink = function (){
        if (link[0] === 'h' && link[1] === 't' && link[2] === 't' && link[3] === 'p') {
          result.link = link
        }
        else result.link = 'http://www.bbc.com' + link;
      };

      result.title = $(element).children().text();
      fixLink();

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) console.log(err);

        else console.log('FROM SCRAPE =====', doc);
      });
    });

    res.redirect('/');

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

  newNote.save(function(error, doc) {
    if (error) throw error;

    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push: {"notes": newNote._id }})
      .exec(function(err, doc) {
        if (error) throw error;

        else {
          res.send(doc);
        }
      });
    }
  });

  // Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {"notes": newNote }})
  // .exec(function(err, doc) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   else {
  //     res.send(newNote);
  //   }
  // });
});

app.delete("/article/notes/delete/:noteid/", function(req, res) {
  //find a way to identify the articleid
  Article.update({ "_id": req.params.id }, {$pull: {"notes": req.params.noteid }})
  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.send('note removed');
    }
  });

});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
