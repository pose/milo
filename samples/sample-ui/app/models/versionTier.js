var App = require('app');

App.VersionTier = Milo.Model.extend({
	rootElement: 'tiers',
	uriTemplate: Milo.UriTemplate('/services/%@/versions/%@/tiers/%@', {
		namedParams: ['serviceId', 'versionId', 'tierId']
	})
});

module.exports = App.VersionTier;