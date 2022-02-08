Spotify Artists Ranking: Most popular, most followed and something else
==========

This is a small project built during the [Music Hack Day London 2014](https://www.hackerleague.org/hackathons/music-hack-day-london-2014).

It uses Node.JS to access the [Spotify Web API](https://developer.spotify.com/web-api/) and stores data about artists' genres, popularity and follower count in a MongoDB database. Then, a script generates the data needed for the UI.

Have a look at the [demo](http://jmperez.github.io/spotify-most-followed-popular-artists-genres).

Note: Not every artist has been processed, but it's very likely that most followed/popular ones are in the dataset. Note that going through all artists involves a ton of requests.
