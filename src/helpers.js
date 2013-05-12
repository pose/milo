Milo.Helpers = {};

Milo.Helpers.apiFromModelClass = function (modelClass) {
    var modelClassName = modelClass.toString();
    return Em.get(modelClassName.substring(0, modelClassName.indexOf('.')));
};

Milo.Helpers.computedPropery = Ember.computed(function (key, value, oldValue) {
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
});

Milo.Helpers.validateNumber = function (count) {
    if (typeof count !== 'number' || count < 0) {
        throw 'Invalid index "' + count + '"';
    }
};

Milo.Helpers.validateString = function (fieldName) {
    if (typeof fieldName !== 'string' || fieldName === '') {
        throw 'Ordering field must be a valid string';
    }
};

Milo.Helpers.baseUrlValidation = function (value) {
    var validScheme = ['http://', 'https://'].map(function (e) {
            if (value) {
                return value.indexOf(e) === 0;
            }
            return false;
        }).reduce(function (x,y) {
            return x || y;
        }, false);

    if (value && typeof value === 'string' && validScheme) {
        return value;
    }

    throw 'Protocol "' + value + '" not supported.';
};

Milo.Helpers.mapProperty = function (property, key, value) {
    if ('undefined' === typeof key) {
        return this.get(property);
    } else if ('undefined' === typeof value && 'string' === typeof key) {
        return this.get(property)[key];
    } else if ('undefined' === typeof value && 'object' === typeof key) {
        if (key.baseUrl) {
            Milo.Helpers.baseUrlValidation(key.baseUrl);
        }
        this.set(property, $.extend({}, this.get(property), key));
    } else {
        if ('baseUrl' === key) {
            Milo.Helpers.baseUrlValidation(value);
        }
        this.get(property)[key] = value;
        return value;
    }
};

Milo.Helpers.propertyWrapper = function (property, value) {
    if ('undefined' === typeof value) {
        return this.get(property);
    } else {
      this.set(property, value);
      return value;
    }
};

Milo.Helpers.defaultSerializer = {
    serialize: function (value) {
        return value;
    },

    deserialize: function (value) {
        return value;
    }
};

Milo.Helpers.booleanSerializer = {
    serialize: function (value) {
        return value ? true : false;
    },

    deserialize: function (value) {
        return value ? true : false;
    }
};
    
Milo.Helpers.numberSerializer = {
    serialize: function (value) {
        var numeric = parseFloat(value);
        return isNaN(numeric) ? 0 : numeric;
    },

    deserialize: function (value) {
        var numeric = parseFloat(value);
        return isNaN(numeric) ? 0 : numeric;
    }
};