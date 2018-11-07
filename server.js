var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var app = express();
var axios = require("axios");
var cheerio = require("cheerio");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger("dev"));
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
var db = require("./models");
// db.on("error", function (error) {
//   console.log("Database Error:", error);
// });
// app.get("/", function (req, res) {
//   res.send("Hello world");
// });
//var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
} else {
  mongoose.connect("mongodb://localhost/Charlotte", { useNewUrlParser: true });
  //mongoose.connect(MONGODB_URI);
}
app.get("/scrape", function (req, res) {
  axios.get("https://www.charlotteagenda.com/")
    .then(function (response) {

      var $ = cheerio.load(response.data);
      $("div.entry-item").each(function (i, element) {


        // console.log(element)

        result = {}
        result.title = $(element).children("h1.entry-title").text();
        result.link = $(element).children("h1.entry-title").children("a").attr("href");
        result.summary = $(element).children(".excerpt").text()
        result.saved = false
   //db.article.findOne({title: result.title})
       // .then(function(find) {
         // console.log(find)
          //if (find === null){
         //   console.log(find)
         db.article.create(result)
        
         .catch(function (err) {
           //console.log(err)
           //return res.json(err);
         })
       //}
      // })
     })
   

   })
        .then(function (dbArticle) {
          db.article.find({ saved: false }, function (error, found) {
            //console.log(found)
            res.render("index", { art: found });

          });
        })
    });

  app.get("/", function (req, res) {

    db.article.find({ saved: false }, function (error, found) {
      //console.log(found)
      res.render("index", { art: found });

    });

  });
  app.get("/api/all", function (req, res) {
    // Query: In our database, go to the animals collection, then "find" everything
    db.article.find({}, function (error, found) {
      // Log any errors if the server encounters one
      if (error) {
        console.log(error);
      }
      // Otherwise, send the result of this query to the browser
      else {
        res.json(found);
      }
    });
  });

  app.get("/saved", function (req, res) {

    db.article.find({ saved: true }, function (error, saved) {
      if (error) {
        console.log(error);
      }
      else {

        res.render("saved", { art: saved });
      }
    });
  });
  app.get("/save/:id", function (req, res) {
    console.log("we made it", req.params.id)
    db.article.find({ _id: req.params.id })
      .update({ saved: true })
      .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.send(dbArticle)
      })


  })
  app.listen(8000, function () {
    console.log("App running on port 8000!");
  });
  app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function (dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
