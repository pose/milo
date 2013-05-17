Api.Thumbnail = Milo.Model.extend({
    rootElement: 'clips',
    uriTemplate: '/clips',

    thumbnail: Milo.property('string')
});

module.exports = Api.Thumbnail;