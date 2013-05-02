Milo.property = function (type, options) {
    options = options || {};
    options.type = type || 'string';
    options.defaultValue = (options.defaultValue === undefined) ? null : options.defaultValue;
    options.operations = (options.operations === undefined) ? ['put', 'post'] : options.operations;
    options.validationRules = (options.validationRules === undefined) ? {} : options.validationRules;

    return Ember.computed(function (key, value, oldValue) {
        var temp = this.get('data').findProperty('key', key);

        if (!temp) {
            temp = this.get('data').pushObject(Em.Object.create({
                key: key,
                value: value,
                orig: value
            }));
        } else {
            temp.value = value;
        }

        if (oldValue) {
            this.set('isDirty', true);
        }

        return temp.value;
    }).property().meta(options);
};