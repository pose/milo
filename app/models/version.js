App.Version = Milo.Model.extend({
	rootElement: 'versions',
	uriTemplate: Milo.UriTemplate('/services/%@/versions/%@', {
		namedParams: ['serviceId', 'versionId']
	}),

	tiers: function () {
		return App.VersionTier.find({
			serviceId: this.get('serviceId'),
			versionId: this.get('versionId')
		});
	}.property().volatile(), //// Avoiding Ember Cache,

	service: Milo.belongsTo(App.Service, 'serviceId')
});