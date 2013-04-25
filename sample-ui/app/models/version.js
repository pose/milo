var App = require('app');

App.Version = Milo.Model.extend({
	rootElement: 'versions',
	uriTemplate: Milo.UriTemplate('/versions/%@', {
		namedParams: ['serviceId', 'versionId']
	}),

	tiers: function () {
		return App.VersionTier.find({
			serviceId: this.get('serviceId'),
			versionId: this.get('versionId')
		});
	}.property().volatile() //// Avoiding Ember Cache
});