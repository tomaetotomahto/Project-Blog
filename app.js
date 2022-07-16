// Initializing frameworks

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const https = require("https");
const request = require('request');
const app = express();
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
app.set('view engine', 'ejs');

//Setting up Mongoose
mongoose.connect("mongodb+srv://admin-parth:TSRjDLXpJp4cM0tJ@cluster0.f5uqr.mongodb.net/blogDB", {
  useNewUrlParser: true
});

const blogSchema = {

  title: String,

  content: String,

  author: String

};

const Blog = mongoose.model("Blog", blogSchema);


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const date = new Date().toISOString();
const currentDate = date.slice(0, 10);
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    res.render("blogs", {
      blogs: blogs
    });
  });
});

let imgUrl; //Holds weather icon
let temp; //Holds temperature
let quote; //Holds quote
let unsplashImageUrl; //Holds picture's URL

app.get("/", function(req, res) {

  // Weather API

  const weatherEndPoint = "https://api.openweathermap.org/data/2.5/weather";
  const weatherAPIKey = "024785371745c05476e0058dfd892e6d";
  const city = "Delhi";
  const units = "metric";
  const weatherUrl = weatherEndPoint + "?appid=" + weatherAPIKey + "&q=" + city + "&units=" + units;
  https.get(weatherUrl, function(response) {
    response.on("data", function(data) {
      const weatherData = JSON.parse(data);
      temp = weatherData.main.temp;
      const icon = weatherData.weather[0].icon;
      imgUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
    })
  });

  //Quote API

  quoteUrl = "https://goquotes-api.herokuapp.com/api/v1/random?count=1";

  https.get(quoteUrl, function(response) {
    response.on("data", function(data) {
      const quoteData = JSON.parse(data);
      quote = quoteData.quotes[0].text;
    })
  });

  //Unsplash API

  const unsplashEndPoint = "https://api.unsplash.com/photos/random";
  const unsplashAPIKey = "sJ7AGPasGbFSnO0m8Oxnz9TuqTSw7zZYx32eNNoxPiI";
  const unsplashOrientation = "landscape";
  const unsplashUrl = unsplashEndPoint + "?" + "client_id=" + unsplashAPIKey + "&orientation=" + unsplashOrientation;
  request(unsplashUrl, {
    json: true
  }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    unsplashImageUrl = body.urls.small;
  });
  // https.get(unsplashUrl,function(response){
  //   response.on("data",function(data){
  //     const unsplashData = JSON.parse(data);
  //     // console.log(unsplashData);
  //     unsplashImageUrl = unsplashData.urls.small;
  //   })
  // });

  res.render("home", {
    imgUrl: imgUrl,
    currentDate: currentDate,
    temp: temp,
    quote: quote,
    unsplashImageUrl: unsplashImageUrl
  });
})

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.post("/compose", function(req, res) {
  const blog = new Blog({
    title: req.body.blogTitle,
    content: req.body.blogContent,
    author: req.body.blogAuthor
  });

  blog.save(function(err){

   if (!err){

     res.redirect("/blogs");

   }

 });




});

app.get("/blogs/:blogId", function(req, res) {
  const requestedBlogId = req.params.blogId;
  Blog.findOne({_id: requestedBlogId}, function(err, blog) {
      res.render("blog", {
        title: blog.title,
        content: blog.content,
        author: blog.author
      });
    });
});

// Initializing server on port 'port'
const port = 3000;
app.listen(3000, function() {
  console.log("Server started on port " + port);
});
