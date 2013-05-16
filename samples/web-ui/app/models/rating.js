Api.Rating = Milo.Model.extend({
	critics_rating: Milo.property('string'),
	critics_score: Milo.property('number'),
	audience_rating: Milo.property('string'),
	audience_score: Milo.property('number')
});

module.exports = Api.Rating;