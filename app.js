// useful resources for drawing scatter plots
// http://alignedleft.com/tutorials/d3/making-a-scatterplot
// http://jsfiddle.net/eamonnmag/Q567s/
//
// processed 100020 of 2147565

var SpotifyWebApi = require('spotify-web-api-node');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;

var artistSchema = mongoose.Schema({
    id: String,
    name: String,
    followers: Number,
    genres: [String],
    popularity: Number
});

var Artist = mongoose.model('Artist', artistSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Open");

  Artist.find(function (err, artists) {
    if (err) return console.error(err);
    console.log(artists.length + ' artists in db');
  });

  fetchMore();
});

var limit = 100,
    current = 0,
    spotify = new SpotifyWebApi();

function fetchMore() {
  console.log("Current " + current + " of " + limit);
  spotify.searchArtists('year:2000-2014', {limit: 20, offset: current})
    .then(function(results) {
      limit = results.artists.total;
      var ids = results.artists.items.map(function(artist) { return artist.id});
      spotify.getArtists(ids).then(function(results) {
        results.artists.forEach(function(i) {

          var query  = Artist.where({ id: i.id });
          query.findOne(function (err, artist) {
            if (err) return handleError(err);
            if (!artist) {
              var artist = new Artist({
                id: i.id,
                name: i.name,
                followers: i.followers.total,
                genres: i.genres,
                popularity: i.popularity
              });

              artist.save(function(err) {
                if (err) {
                  console.log('error saving artist');
                } else {
                  console.log('saved ', i.name);
                }
              });
            }
          });
        });
      });

      current += 20;
      if (current < limit) {
        setTimeout(function() {
          fetchMore();
        }, 500);
      }
    });
}

