var movie = require('node-movie');
var elasticsearch = require('elasticsearch');
var all_reviews = require("./reviews.js");

var client = new elasticsearch.Client({
  host: 'localhost:9200'
  //, log: 'trace'
});

var i, L;
var reviewer
var reviews
var review
var index = 'dossiers'
var type = 'attachment'
var lotsOfEntities = false

function augmentRecord(record, callback) {
  movie(record.title, function(err, data){
    if (err) {
      console.error(err)
      throw err
    } else {

      var i, L
      if (data.Director) {
        var directors = data.Director.split(', ')
        for (i = 0, L = directors.length; i < L; i++) {
          record.entity.push({"category":"director", "entity": directors[i]})
        }
      }
      if (data.Actors) {
        var actors = data.Actors.split(', ')
        if (lotsOfEntities) {
          L = actors.length
        } else {
          L = Math.min(actors.length, 2)
        }
        for (i = 0; i < L; i++) {
          record.entity.push({"category":"actor", "entity": actors[i]})
        }
      }
      if (lotsOfEntities) {
        record.entity.push({"category":"rated", "entity": data.Rated})
        record.entity.push({"category":"country", "entity": data.Country})
        if (data.Runtime) {
          record.entity.push({"category":"runtime", "entity": data.Runtime.replace(/ min$/, '')})
        }
      }
      record.entities = JSON.stringify(record.entity)
      record.file = Buffer(record.review + ' all movie ').toString('base64')
      record.owner = record.reviewer
      callback(record)
    }
  })
}

function insertRecord(record) {
  params = {
    "index": index,
    "type": type,
    "body": record
  }
  client.create(params, function(err, response) {
    if (err) {
      console.error(err)
      throw err
    }
    console.log(`Indexed a record ${record.title}`)
  })
}

for (reviewer in all_reviews) {
  var reviews = all_reviews[reviewer]
  for (i = 0, L = reviews.length; i < L; i++) {
    review = reviews[i]
    augmentRecord(review, insertRecord)
  }
}
