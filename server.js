'use strict'
//call packages used
var mongoose = require('mongoose');
var http=require('http');
var https=require('https');
var express = require('express');
var request = require('request');
require('dotenv').load();
var app = express();
var imgsrch = require('./schema.js');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/imgsrch', function(err,connect) {
  if(err) return console.log(err);
  console.log('Mongoose connected ' + process.env.MONGOLAB_URI);
});

mongoose.connection.on('error', function (err) {
    console.log('database error', err)
});

app.use('/', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
    });

app.get('/images/:query', function(req, res) {

var sTermString = encodeURIComponent("'" + req.params.query + "'");
console.log('we are going to search for: ' + sTermString);
var offset=req.params.offset;
var accKey = process.env.BING_API_KEY;

console.log('this is the accKey ' + accKey);

var options = { method: 'GET',
  url: 'http://api.datamarket.azure.com/Bing/Search/Image',
  qs:
   { Query: sTermString,
     '$top': '100',
     '$skip': offset,
     '$format': 'json' },
  headers:
   { authorization: 'Basic ' + accKey } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  var output = JSON.parse(body);

var outputs = output.d.results.map(function(searchReturn) {
  return {
    url: searchReturn.MediaUrl,
    snippet: searchReturn.Title,
    thumbnail: searchReturn.Thumbnail.MediaUrl,
    context: searchReturn.SourceUrl
  };
});

imgsrch.create({query: sTermString, when: new Date()}, function(err,result) {
    console.log('added ' + sTermString + ' from ' + new Date() + ' to the list');
  //probably not the fastest way to do it, but returns the created miniurl from the database and send it to the user
  });
res.json(outputs);
});
});

app.get('/history', function(req, res) {
  imgsrch.find({},{'_id':0, 'query':1, 'when':1}, function(err, results) {
    console.log('returning history of queries');
    res.json(results);
});
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
console.log('Express server listening on port: ' + port);
});
