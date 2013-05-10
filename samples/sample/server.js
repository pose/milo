var express = require('express'),
    nStore = require('nstore'),
    app = express();

nStore = nStore.extend(require('nstore/query')());

var movies = nStore.new('data/movies.db', function () {
    movies.save(1, {
        name: "The Matrix",
        year: 1999,
        rating: {
            value: 8.5,
            votes: 274
        },
        genres: ['Adventure', 'Action', 'Thriller', 'Science Fiction'],
        cast: [{
            name: 'Keanu Reeves',
            character: 'Neo'
        }, {
            name: 'Carrie-Anne Moss',
            character: 'Trinity'
        }, {
            name: 'Laurence Fishburne',
            character: 'Morpheus'
        }, {
            name: 'Hugo Weaving',
            character: 'Agent Smith'
        }],
        crew: {
            directors: ['Andy Wachowski', 'Lana Wachowski'],
            writers: ['Andy Wachowski', 'Lana Wachowski']
        }
    })
});

app.use('/static', express.static(__dirname + '/public'));
app.use(express.logger());

app.get('/api/movies', function (req, res) {

    movies.all(function (err, results) {
        if (!err) {
            res.send(200, results);
        }
    });
});

app.get('/api/movies/:id', function (req, res) {
    movies.get(req.params.id, function (err, doc, key) {
        if (err) {
            res.send(404, 'Actor not found');
        } else {
            res.send(200, doc);
        }
    });
});


app.listen(3000);