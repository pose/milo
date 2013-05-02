var _defaultSerializer = {
        serialize: function (value) {
            return value;
        },

        deserialize: function (value) {
            return value;
        }
    },
    _booleanSerializer = {
        serialize: function (value) {
            return value ? true : false;
        },

        deserialize: function (value) {
            return value ? true : false;
        }
    },
    _numberSerializer = {
        serialize: function (value) {
            var numeric = parseFloat(value);
            return isNaN(numeric) ? 0 : numeric;
        },

        deserialize: function (value) {
            var numeric = parseFloat(value);
            return isNaN(numeric) ? 0 : numeric;
        }
    };

Milo.DefaultSerializer = Em.Object.extend({
    serializerCache: null,

    init: function () {
        var cache = Em.Map.create();

        cache.set('string', _defaultSerializer);
        cache.set('boolean', _booleanSerializer);
        cache.set('array', _defaultSerializer);
        cache.set('number', _numberSerializer);

        this.set('serializerCache', cache);
    },

    serializerFor: function (modelClass) {
        var cache = this.get('serializerCache'),
            serializer = cache.get(modelClass);

        if (!serializer) {
            modelClass = (typeof(modelClass) === 'string') ? Em.get(modelClass) : modelClass;
            serializer = this._buildSerializer(modelClass);
            cache.set(modelClass, serializer);
        }

        return serializer;
    },

    _buildSerializer: function (modelClass) {
        var properties = [],
            propertyNamesForPost = [],
            propertyNamesForPut = [],
            serializer = {},
            that = this;

        modelClass.eachComputedProperty(function (propertyName) {
            var propertyMetadata = modelClass.metaForProperty(propertyName);

            if (propertyMetadata.type) {
                properties.push($.extend({ name: propertyName }, propertyMetadata));
            }
        });

        properties.forEach(function (property) {
            if (property.operations.contains('post')) {
                propertyNamesForPost.push(property.name);
            }

            if (property.operations.contains('put')) {
                propertyNamesForPut.push(property.name);
            }
        });

        serializer.serialize = modelClass.serialize || function (model, method) {
            var serialized = (method || 'post').toLower() === 'post' ?
                model.getProperties(propertyNamesForPost) : model.getProperties(propertyNamesForPut);

            properties.forEach(function (property) {
                if (serialized[property.name] === undefined) {
                    serialized[property.name] = property.defaultValue;
                } else {
                    serialized[property.name] = that.serializerFor(property.type)
                        .serialize(serialized[property.name], method || 'post');
                }
            });

            return serialized;
        };

        serializer.deserialize = modelClass.deserialize || function (json) {
            var model = modelClass.create();

            properties.forEach(function (property) {
                if (json[property.name] === undefined) {
                    model.set(property.name, property.defaultValue);
                } else {
                    model.set(property.name, that.serializerFor(property.type).deserialize(json[property.name]));
                }
            });

            return model;
        };

        return serializer;
    }
});