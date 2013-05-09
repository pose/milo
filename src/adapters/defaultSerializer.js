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

/**
    @namespace Milo
    @module milo-adapters
    @class DefaultSerializer
    @extends {Ember.Object}
*/
Milo.DefaultSerializer = Em.Object.extend({
    serializerCache: null,

    init: function () {
        var cache = Em.Map.create();

        cache.set('string', _defaultSerializer);
        cache.set('object', _defaultSerializer);
        cache.set('boolean', _booleanSerializer);
        cache.set('array', _defaultSerializer);
        cache.set('number', _numberSerializer);

        this.set('serializerCache', cache);
    },

    /**
        @method serializeFor
        @param {String} modelClass
    */
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

    /**
        @method _buildSerializer
        @private
    */
    _buildSerializer: function (modelClass) {
        var properties = [],
            propertyNamesForPost = [],
            propertyNamesForPut = [],
            serializer = {},
            that = this;

        modelClass.eachComputedProperty(function (propertyName) {
            var propertyMetadata = modelClass.metaForProperty(propertyName);

            if (propertyMetadata.type && propertyMetadata.embedded) {
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
                    if (property.occurrences === "one") {
                        serialized[property.name] = that.serializerFor(property.type).serialize(model.get(property.name), method || 'post');
                    } else {
                        serialized[property.name] = Em.A();
                        (model.get(property.name) || []).forEach(function (item) {
                            serialized[property.name].pushObject(that.serializerFor(property.type).serialize(item, method || 'post'));
                        });
                    }
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
                    if (property.occurrences === "one") {
                        model.set(property.name, that.serializerFor(property.type).deserialize(json[property.name]));
                    } else {
                        model.set(property.name, Em.A());
                        (json[property.name] || []).forEach(function (item) {
                            model.get(property.name).pushObject(that.serializerFor(property.type).deserialize(item));
                        });
                    }
                }
            });

            return model;
        };

        return serializer;
    }
});