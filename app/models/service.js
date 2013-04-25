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

	//// TODO: Implement a has-many interface
	versions: function () {
		return App.Version.find({
			serviceId: this.get('id')
		});
	}.property().volatile() //// Avoiding Ember Cache)
});