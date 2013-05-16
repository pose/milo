Api.Review = Milo.Model.extend({
	rootElement: 'reviews',
	uriTemplate: '/reviews',

	critic: Milo.property('string'),
	date: Milo.property('string'),
	freshness: Milo.property('string'),
	publication: Milo.property('string'),
	quote: Milo.property('string')
});

module.exports = Api.Review;