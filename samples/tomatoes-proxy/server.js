var express = require('express'),
    app = express(),
    request = require('superagent'),
    logger = require('loggy'),
    apikey = 'tee5jtm2eq8b9swx3uhq3qaq',
    allowCrossDomain = function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if ('OPTIONS' == req.method) {
            res.send(200);
        } else {
            next();
        }
    };

app.use('/static', express.static(__dirname + '/public'));
app.use(express.logger());
app.use(express.methodOverride());
app.use(allowCrossDomain);

logger.info('application started on http://localhost:3000/');

//http://visionmedia.github.io/superagent/
app.get('/api/movies', function (req, res) {
    var query = req.query || {};

    query.apikey = apikey;

    if (query.q) {
        request.get('http://api.rottentomatoes.com/api/public/v1.0/movies.json')
            .query(query).end(function (err, result) {
            res.send(200, JSON.parse(result.text));
        });
    } else {
        request.get('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json')
            .query(query).end(function (err, result) {
            res.send(200, JSON.parse(result.text));
        });
    }
});

app.get('/api/movies/:id', function (req, res) {
    var query = req.query || {};

    query.apikey = apikey;

    request.get('http://api.rottentomatoes.com/api/public/v1.0/movies/' + req.params.id)
        .query(query).end(function (err, result) {
        res.send(200, JSON.parse(result.text));
    });
});

app.get('/api/movies/:id/reviews', function (req, res) {
    var query = req.query || {};

    query.apikey = apikey;

    request.get('http://api.rottentomatoes.com/api/public/v1.0/movies/' + req.params.id + '/reviews.json')
        .query(query).end(function (err, result) {
        res.send(200, JSON.parse(result.text));
    });
});

app.listen(3000);