// Load the necessary packages
let fs = require('fs');
let Spotify = require("node-spotify-api");
let request = require("request");
let keys = require("./keys.js");
let Twitter = require('twitter');



// Read in the command line arguments
let cmdArgs = process.argv;

// The LIRI command will always be the second command line argument
let liriCommand = cmdArgs[2];



// The parameter to the LIRI command may contain spaces
let liriArg = '';
for (var i = 3; i < cmdArgs.length; i++) {
    liriArg += cmdArgs[i] + ' ';
}


// Function for Twitter Api
function getTwitts() {

    //Appends Command used on log.txt file
    fs.appendFile('./log.txt', '[ User Command: node liri.js my-tweets ]\n\n', (error) => {
        if (error) throw error;
    });

    let client = new Twitter(keys.twitterKeys);

    var params = {
        screen_name: 'liri_mcliri',
        count: 20
    };

    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) {
            let errorMsg = 'ERROR: Retrieving user tweets - ' + error + '\n\n';

            // Appends Error Message to the log.txt file
            fs.appendFile('./log.txt', errorMsg, (err) => {
                if (err) throw err;
                console.log(errorMsg);
            });
        } else {
            for (var i = 0; i < tweets.length; i++) {
                console.log(
                    "Created on: " + tweets[i].created_at + "\n" +
                    "Tweet: " + tweets[i].text + "\n" +
                    "*************************************************\n"
                );
            }
        }

    });
}

// Function for Spotify Api
function spotifySong(song) {

    fs.appendFile('./log.txt', "[ User Command: node liri.js spotify-this-song " + song + "]\n\n", (error) => {
        if (error) throw error;
    });

    let spotify = new Spotify(keys.spotifyKeys);

    spotify.search({
        type: 'track',
        query: song
    }, function(err, data) {
        if (err) {
            let errorMsg = 'ERROR: Retrieving Spotify song - ' + err + '\n\n';

            fs.appendFile('./log.txt', errorMsg, (error) => {
                if (error) throw error;
                console.log(errorMsg);
            });
        } else {
            let songInfo = data.tracks.items;
            for (var i = 0; i < data.tracks.items.length; i++) {
                console.log(
                    "Artist: " + songInfo[i].artists[0].name + "\n" +
                    "Song: " + songInfo[i].name + "\n" +
                    "Album: " + songInfo[i].album.name + "\n" +
                    "Preview URL: " + songInfo[i].preview_url + "\n" +
                    "*************************************************\n"
                )
            }
        }

    });
}

// Function for OMDB Api
function getOMDBInfo(movie) {

    fs.appendFile('./log.txt', '[ User Command: node liri.js movie-this ' + movie + ']\n\n', (error) => {
        if (error) throw error;
    });

    // If search is left empty, it will search and return Mr Nobody's movie info.
    let search;
    if (movie === '') {
        search = 'Mr. Nobody';
    } else {
        search = movie;
    }

    // Query for OMDB's website, which includes the search variable as well as the api key. 
    let query = 'http://www.omdbapi.com/?apikey=trilogy&t=' + search + '&plot=full&tomatoes=true&r=json';

    request(query, function(error, response, body) {
        if (error) {
            let errorMsg = 'ERROR: Retrieving OMDB movie data - ' + error + '\n\n';

            fs.appendFile('./log.txt', errorMsg, (err) => {
                if (err) throw err;
                console.log(errorMsg);
            });

        } else if (!error && response.statusCode === 200) {
            let bod = JSON.parse(body);
            console.log(
                "Title: " + bod.Title + "\n" +
                "Year: " + bod.Year + "\n" +
                "Rating: " + bod.Rated + "\n" +
                "Country: " + bod.Country + "\n" +
                "Language: " + bod.Language + "\n" +
                "Plot: " + bod.Plot + "\n" +
                "Actors: " + bod.Actors + "\n" +
                "Rotten Tomatoes Rating: " + bod.Ratings[1].Value + "\n" +
                "Rotten Tomatoes URL: " + bod.tomatoURL + "\n" +
                "*************************************************\n"
            );
        }
    });

}

// Function for "do-what-it-says"
function getToTheChoppa() {

    fs.appendFile('./log.txt', '\n[ User Command: node liri.js do-what-it-says ]', (error) => {
        if (error) throw error;
    });

    fs.readFile('./random.txt', 'utf8', function(error, data) {
        if (error) {
            let errorMsg = 'ERROR: Reading random.txt - ' + error + '\n\n';

            fs.appendFile('./log.txt', errorMsg, (err) => {
                if (err) throw err;
                console.log(errorMsg);
            });

        } else {
            // Split out the command name and the parameter name at the "," and then trim daata
            var cmdString = data.split(',');
            var command = cmdString[0].trim();
            var parameter = cmdString[1].trim();

            switch (command) {
                case 'my-tweets':
                    getTwitts();
                    break;

                case 'spotify-this-song':
                    spotifySong(parameter);
                    break;

                case 'movie-this':
                    getOMDBInfo(parameter);
                    break;
            }
        }
    });
}

//Liri acceptable commands
if (liriCommand === 'my-tweets') {
    getTwitts();
} 
else if (liriCommand === `spotify-this-song`) {
    spotifySong(liriArg);
} 
else if (liriCommand === `movie-this`) {
    getOMDBInfo(liriArg);
} 
else if (liriCommand === `do-what-it-says`) {
    getToTheChoppa();
} else {
    console.log(
        "Liri doesn't recognize that command :( " + "\n" + "\n" +
        "************************************************* \n" +
        "| Command Menu |: \n" +
        "node liri.js my-tweets \n" +
        "node liri.js spotify-this-song <song name> \n" +
        "node liri.js movie-this <movie name> \n" +
        "node liri.js do-what-it-says \n" +
        "************************************************* \n"
    );

}