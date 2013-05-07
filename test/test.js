chai.should();
var expect = chai.expect;

// TODO What happens if there is no element returned in the query and I do .single?
// TODO Support for multiple APIs (un-singletonize)
// TODO Test always returning a proxy with deferred
// XXX Why can't we remove operations array from the model?
// XXX .fail() does not work
// XXX What happens if JSON sent does not match the schema? Ans: There is not validation
// First done parameter is foo

describe('Milo', function () {
    describe('baseUrl', function () {
        var Fixture, nothing;

        beforeEach(function () {
            Fixture = Ember.Namespace.create({
                revision: 1
            });
            Fixture.Foo = Milo.Model.extend({});
            nothing = function () {};
        });
        afterEach(function () {
        });

        it('should fail if not set', function () {
            expect(function () { 
                Milo.Options.set('baseUrl', undefined);
            }).to.Throw(/not supported/i);
        });

        it('should fail if set to an invalid protocol', function () {
            expect(function () {
                Milo.Options.set('baseUrl', 'smtp://hello');
            }).to.Throw(/smtp.*not supported/i);

            expect(function () {
                Milo.Options.set('baseUrl', 'bye://hello');
            }).to.Throw(/bye.* not supported/i);
        });

        it('should work with http and https', function () {
            var http = 'http://hello',  https = 'https://hello';
            Milo.Options.set('baseUrl', http);
            Milo.Options.get('baseUrl').should.be.a('string');
            Milo.Options.get('baseUrl').should.equal(http);
            
            Milo.Options.set('baseUrl', https);
            Milo.Options.get('baseUrl').should.be.a('string');
            Milo.Options.get('baseUrl').should.equal(https);
        });
    });


    describe('when called find', function () {
        var Fixture;
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
            Milo.Options.set('baseUrl', 'https://myurl/%@');
            Milo.Options.set('auth', {
                access_token: 'sometoken'
            });
            Fixture = Ember.Namespace.create({
                revision: 1
            });
        });
        afterEach(function () {
            $.get.restore();
        });
        it('should fail if it does not contain properties', function () {
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', { access_token: 'token' });

            Fixture.Foo = Milo.Model.extend({});

            expect(function () {
                Fixture.Foo.find({ 'id': 42 }).single();
            }).to.Throw(/uriTemplate not set in model/i);
        });

        it('should make an ajax call', function (d0ne) {
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', {
                access_token: 'token'
            });

            Fixture.Foo = Milo.Model.extend({
                uriTemplate: Milo.UriTemplate('/foo/%@'),
                name: Milo.property('string', {
                    defaultValue: '',
                    operations: ['put', 'post'],
                    validationRules: {
                        required: true
                    }
                })
            });

            var foo = Fixture.Foo.find({ 'id': 42 }).single();
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
        var Fixture, xhr, requests;
        beforeEach(function () {
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
            Milo.Options.set('baseUrl', 'https://myurl/%@');
            Fixture = Ember.Namespace.create({
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

            Fixture.Bar = Milo.Model.extend({
                uriTemplate: Milo.UriTemplate('/bar/%@'),
                name: Milo.property('string')
            });

            Fixture.Foo = Milo.Model.extend({
                uriTemplate: Milo.UriTemplate('/foo/%@'),
                name: Milo.property('string', {
                    defaultValue: '',
                    operations: ['put', 'post'],
                    validationRules: {
                        required: true
                    }
                }),
                bar: Milo.collection(Fixture.Bar)
            });

            Fixture.Foo.find({
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

