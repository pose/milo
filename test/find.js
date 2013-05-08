chai.should();
var expect = chai.expect;

// TODO What happens if there is no element returned in the query and I do .single?
// TODO Test always returning a proxy with deferred
// XXX Why can't we remove operations array from the model?
// XXX .fail() does not work
// XXX What happens if JSON sent does not match the schema? Ans: There is not validation
// First done parameter is foo

describe('Milo', function () {

    describe('when called find', function () {
        var API;
        beforeEach(function () {
            sinon.stub($, 'get', function (url) {
                var defer = $.Deferred();
                setTimeout(function () {
                    defer.resolve({ 
                        'id': 42,
                        'name': 'Catch 22'
                    });
                }, 1000);
                return defer.promise();
            });
            API = Milo.API.create({});
            API.options('baseUrl', 'https://myurl/%@');
            API.options('auth', {access_token: 'sometoken'});
        });

        afterEach(function () {
            $.get.restore();
        });

        it('should fail if it does not contain properties', function () {
            // Arrange
            API.options('baseUrl', 'https://myapi.com/api%@');
            API.options('auth', { access_token: 'token' });

            // Act
            API.Foo = Milo.Model.extend({});

            // Assert
            (function () {
                API.Foo.find({ 'id': 42 }).single();
            }).should.Throw(/uriTemplate not set in model/i);
        });

        it('should make an ajax call', function (d0ne) {
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', {
                access_token: 'token'
            });

            API.Foo = Milo.Model.extend({
                uriTemplate: Milo.UriTemplate('/foo/%@'),
                name: Milo.property('string', {
                    defaultValue: '',
                    operations: ['put', 'post'],
                    validationRules: {
                        required: true
                    }
                })
            });

            var foo = API.Foo.find({ 'id': 42 }).single();
            foo.should.not.equal(undefined);
            foo.should.have.property('isLoading', true);
            foo.should.have.property('done');
            foo.done(function (data) {
                foo.should.be.equal(data);
                foo.should.have.property('isLoading', false);
                foo.get('content').should.be.ok;
                foo.get('content.id').should.be.equal(42);
                foo.get('content.name').should.be.equal('Catch 22');
                d0ne();

            });

            $.get.should.have.been.calledWith('https://myapi.com/api/foo/42?access_token=token');
        });
    });
    
    describe('when called find on nested elements', function () {
        var API, xhr, requests;
        beforeEach(function () {
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
            Milo.Options.set('baseUrl', 'https://myurl/%@');
            API = Ember.Namespace.create({
                revision: 1
            });
        });
        afterEach(function () {
            xhr.restore();
        });

        it('should fail if nested element is invalid', function () {
            throw 'Not implemented';
        });

        it('should handle nested entities', function (done) {
            // XXX What is rootElement? rootElement is the root element that contains the array
            // (arrays should not be json as plain JSON)
            // XXX What is uriTemplate?
            // XXX Assert that an entity can't use array if rootElement is not set
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', {
                access_token: 'token'
            });

            API.Bar = Milo.Model.extend({
                uriTemplate: Milo.UriTemplate('/bar/%@'),
                name: Milo.property('string')
            });

            API.Foo = Milo.Model.extend({
                uriTemplate: Milo.UriTemplate('/foo/%@'),
                name: Milo.property('string', {
                    defaultValue: '',
                    operations: ['put', 'post'],
                    validationRules: {
                        required: true
                    }
                }),
                bar: Milo.collection(API.Bar)
            });

            API.Foo.find({
                id: 42
            })
            .single()
            .done(function (elem) {
                throw "Not implemented";
                //done();
            });

        });


        describe('if single returns more than one element', function () {
            it('must throw an exception', function () {
                throw "Not implemented";
            });
        });

        describe('if using toArray', function () {
            it('should work and return collection', function () {
                throw "Not implemented";
            });

        });

    });

    describe('if token is added', function () {
        it('should add it to the request', function () {
            throw "Not implemented";
        });
    });

});

