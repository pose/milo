var express = require('express');

var app = express();

var actors = {
    42: {
        id: 42,
        name: 'Charles Chaplin'
    }
};

app.use('/static', express.static(__dirname + '/public'));
app.use(express.logger());
app.get('/api/actor/:id', function (req, res) {
    var actor = actors[req.params.id];

    if (actor) {
        res.send(200, actor);
    } else {
        res.send(404, 'Actor not found');
    }
});


app.listen(3000);
