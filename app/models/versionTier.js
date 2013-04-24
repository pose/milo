App.VersionTier = App.Milo.extend({
	rootElement: 'tiers',
	uriTemplate: App.UriTemplate('/services/%@/versions/%@/tiers/%@', {
		namedParams: ['serviceId', 'versionId', 'tierId']
	})
});