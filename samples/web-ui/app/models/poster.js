Api.Poster = Milo.Model.extend({
	thumbnail: Milo.property('string'),
	profile: Milo.property('string'),
	detailed: Milo.property('string'),
	original: Milo.property('string')
});

module.exports = Api.Poster;