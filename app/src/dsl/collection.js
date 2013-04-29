Milo.collection = function (type, options) {
    options = options || {};

    return Ember.computed(function (key, value, oldValue) {
        var parentName = this.constructor.toString(),
            periodIndex = parentName.indexOf('.'),
            param = '%@Id'.fmt(parentName.substring(periodIndex + 1, parentName.length)).camelize(),
            findParams = {};

        findParams[param] = this.get('id');

        return type.find(findParams).toArray();
    }).property().volatile().meta(options);
};