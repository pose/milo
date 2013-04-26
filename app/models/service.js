App.Service = Milo.Model.extend({
	rootElement: 'services',
	uriTemplate: Milo.UriTemplate('/services/%@'),

	name: Milo.property('string', {
		defaultValue: '',
		operations: ['put', 'post'],
		validationRules: {
			required: true
		}
	}),

	versions: Milo.collection(App.Version)
});