
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

var fs = require('fs');
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

var exported = {};

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

  var todo = 5; // should be Promise.all

  Artist.find({}).sort({followers: -1})
    .limit(20)
    .exec(function(err, artists) {
      exported.mostFollowed = artists.map(function(a) {
        return {
          id: a.id,
          name: a.name,
          followers: a.followers
        };
      });

      spotifyApi.getArtists(artists.map(function(a) { return a.id; }))
      .then(function(results) {
        results.artists.forEach(function(r, i) {
          exported.mostFollowed[i].images = r.images;
        });

        todo--;
        if (todo === 0) {
          saveFile();
        }
      });

    });

  Artist.find({}).sort({popularity: -1})
    .limit(20)
    .exec(function(err, artists) {
      exported.mostPopular = artists.map(function(a) {
        return {
          id: a.id,
          name: a.name,
          popularity: a.popularity
        };
      });

      spotifyApi.getArtists(artists.map(function(a) { return a.id; }))
      .then(function(results) {
        results.artists.forEach(function(r, i) {
          exported.mostPopular[i].images = r.images;
        });

        todo--;
        if (todo === 0) {
          saveFile();
        }
      });

    });

  // popularity by genre
  var genres = {};
  Artist.find({}).exec(function(err, artists) {
    artists.forEach(function(artist) {
      if (artist.genres.length) {
        artist.genres.forEach(function(genre) {
          genres[genre] = genres[genre] || {};
          genres[genre].values = genres[genre].values || [];
          genres[genre].values.push(artist.popularity);
        });
      }
    });

    var toSort = [];
    for (var i in genres) {
      var total = 0;
      genres[i].total = 0;
      for (var j = 0; j < genres[i].values.length; j++) {
        genres[i].total += genres[i].values[j];
      }

      genres[i].total = genres[i].total / genres[i].values.length;

      toSort.push({genre: i, value: genres[i].total});
    }

    exported.mostPopularGenre = toSort.sort(function(a, b) {
      return b.value - a.value;
    }).slice(0, 20);

    todo--;
    if (todo === 0) {
      saveFile();
    }
  });

  // followers by genre
  var genres = {};
  Artist.find({}).exec(function(err, artists) {
    artists.forEach(function(artist) {
      if (artist.genres.length) {
        artist.genres.forEach(function(genre) {
          genres[genre] = genres[genre] || {};
          genres[genre].values = genres[genre].values || [];
          genres[genre].values.push(artist.followers);
        });
      }
    });


    var toSort = [];
    for (var i in genres) {
      var total = 0;
      genres[i].total = 0;
      for (var j = 0; j < genres[i].values.length; j++) {
        genres[i].total += genres[i].values[j];
      }

      genres[i].total = genres[i].total / genres[i].values.length;

      toSort.push({genre: i, value: genres[i].total});
    }

    exported.mostFollowedGenre = toSort.sort(function(a, b) {
      return b.value - a.value;
    }).slice(0, 20);

    todo--;
    if (todo === 0) {
      saveFile();
    }
  });

  // todo: export data in a way we can plot it
  Artist.find({})
    .exec(function(err, artists) {
      // find out max
      exported.scatter = [];

      artists.forEach(function(artist) {
        var groupName = 'Other';
        if (artist.genres.length) {
          var concat = artist.genres.join(' ');
          if (concat.indexOf('pop') !== -1) {
            groupName = 'Pop';
          } else if (concat.indexOf('rock') !== -1) {
            groupName = 'Rock';
          } else if (concat.indexOf('house') !== -1) {
            groupName = 'House';
          } else if (concat.indexOf('edm') !== -1) {
            groupName = 'EDM';
          } else if (concat.indexOf('r&b') !== -1) {
            groupName = 'R&B';
          } else if (concat.indexOf('hip hop') !== -1) {
            groupName = 'Hip Hop';
          } else if (concat.indexOf('jazz') !== -1) {
            groupName = 'Jazz';
          }
        }

        var filtered = exported.scatter.filter(function(s) {
          return s.key == groupName;
        });

        if (filtered.length) {
          filtered[0].values.push({
              x: artist.popularity,
              y: artist.followers,
            })
        } else {
          exported.scatter.push({
            key: groupName,
            values: [{
              x: artist.popularity,
              y: artist.followers,
            }]
          });
        }
      });

      todo--;
      if (todo === 0) {
        saveFile();
      }
    });
});

function saveFile() {
  fs.writeFile('data.json', JSON.stringify(exported), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved");
    }
  });
}

