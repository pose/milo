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

	alternate_ids: Milo.property('Api.Alternate'),

	reviewCollection: Milo.collection('Api.Review'),

	imdbUrl: function () {
		return "http://www.imdb.com/title/tt" + this.get('alternate_ids.imdb');
	}.property(),

	reviews: function () {
		return this.get('reviewCollection').findMany();
	}.property(),
});

module.exports = Api.Movie;