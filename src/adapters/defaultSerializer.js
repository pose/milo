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

        cache.set('string', Milo.Helpers.defaultSerializer);
        cache.set('object', Milo.Helpers.defaultSerializer);
        cache.set('boolean', Milo.Helpers.booleanSerializer);
        cache.set('array', Milo.Helpers.defaultSerializer);
        cache.set('number', Milo.Helpers.numberSerializer);

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
            // XXX Model properties cannot be named meta or _data
            var propertyMetadata = modelClass.metaForProperty(propertyName),
                forbiddenProperties = ['meta', '_data'];

            if (!forbiddenProperties.contains(propertyName) && propertyMetadata.type && propertyMetadata.embedded) {
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
            if (!(model && (model.constructor === modelClass ||
                            (model.constructor && model.constructor.toString && model.constructor.toString() === modelClass)))) {
                throw new Error('Error serializing instance: model is not an instance of %@'.fmt(modelClass));
            }

            var serialized = (method || 'post').toLowerCase() === 'post' ?
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
                    if (property.occurrences === 'one') {
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
