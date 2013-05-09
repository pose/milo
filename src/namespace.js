/**
    @namespace Milo
    @module milo
    @extends {Ember.Namespace}
*/
window.Milo = Em.Namespace.create({
    revision: 1
});

var _apiFromModelClass = function (modelClass) {
    var modelClassName = modelClass.toString();

    return Em.get(modelClassName.substring(0, modelClassName.indexOf('.')));
};

