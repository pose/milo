Api.Movie = Milo.Model.extend({
	rootElement: 'movies',
	uriTemplate: '/movies/:id',

	id: Milo.property('string'),

	title: Milo.property('string'),

	year: Milo.property('number'),

	mpaa_rating: Milo.property('string'),

	runtime: Milo.property('number'),

	critics_consensus: Milo.property('string'),

	synopsis: Milo.property('string'),

	ratings: Milo.property('Api.Rating'),

	posters: Milo.property('Api.Poster'),

	reviews: Milo.collection('Api.Review')
});

module.exports = Api.Movie;