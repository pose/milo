Milo.property = function (type, options) {
    options = options || {};

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