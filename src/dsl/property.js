/**
    @namespace Milo
    @module milo-dsl
    @class property
*/
Milo.property = function (type, options) {
    options = options || {};
    options.occurrences = "one";
    options.embedded = true;
    options.type = type || 'string';
    options.defaultValue = (options.defaultValue === undefined) ? null : options.defaultValue;
    options.operations = (options.operations === undefined) ? ['put', 'post'] : options.operations;
    options.validationRules = (options.validationRules === undefined) ? {} : options.validationRules;

    return Milo.Helpers.computedPropery.property().meta(options);
};

/**
    @namespace Milo
    @module milo-dsl
    @class collection
*/
Milo.collection = function (type, options) {
    options = options || {};
    options.occurrences = "many";
    options.embedded = options.embedded || false ? true : false;
    options.type = type || 'string';
    options.defaultValue = (options.defaultValue === undefined) ? null : options.defaultValue;
    options.operations = (options.operations === undefined) ? ['put', 'post'] : options.operations;
    options.validationRules = (options.validationRules === undefined) ? {} : options.validationRules;

    if (options.embedded) {
        return Milo.Helpers.computedPropery.property().meta(options);
    } else {
        return Ember.computed(function (key, value, oldValue) {
            var parentName = this.constructor.toString(),
                param = '%@Id'.fmt(parentName.substring(parentName.indexOf('.') + 1, parentName.length)).camelize(),
                findParams = JSON.parse(JSON.stringify(this.get('anyClause') || {})),
                queryable, uriTemplate;

            findParams[param] = findParams.id || this.get('id');
            delete findParams.id;

            type = (typeof(type) === 'string') ? Em.get(type) : type;
            queryable = type.create();
            uriTemplate = queryable.get('uriTemplate');
            queryable.set('uriTemplate', this.get('uriTemplate').replace(':id', ':' + param) + uriTemplate);

            return queryable.where(findParams);
        }).property().volatile().meta(options);
    }
};
