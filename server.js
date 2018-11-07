var express = require("express");
var exphbs = require("express-handlebars");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var app = express();
var router = express.Router();
app.use(express.static("public"));
var databaseUrl = "charlotte";
var collections = ["article"];
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
  console.log("Database Error:", error);
});
// app.get("/", function (req, res) {
//   res.send("Hello world");
// });

app.get("/scrape", function (req, res) {
  axios.get("https://www.charlotteagenda.com/").then(function (response) {
    var $ = cheerio.load(response.data);
    $("div.entry-item").each(function (i, element) {
      // console.log(element)
      var title = $(element).children("h1.entry-title").text();
      var link = $(element).children("h1.entry-title").children("a").attr("href");
      var summary = $(element).children(".excerpt").text()
      if (title && link) {
        db.article.insert({
          title: title,
          link: link,
          summary: summary,
          saved: false
        },
          function (err, inserted) {
            if (err) {
              console.log(err);
            }
            else {
              console.log(inserted);
            }
          });
      }
    });
  });
  res.send("Scrape Complete");
});
app.get("/", function(req, res) {

  db.article.find({ saved: false}, function(error, found) {
      console.log(found)
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
      
      res.render("index", { art: saved });
    }
  });
});

app.listen(8000, function () {
  console.log("App running on port 8000!");
});
