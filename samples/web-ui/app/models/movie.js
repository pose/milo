Api.Movie = Milo.Model.extend({
	rootElement: 'movies',
	uriTemplate: '/movies',

	title: Milo.property('string'),

	year: Milo.property('number')
});

module.exports = Api.Movie;