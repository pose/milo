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
        var server;

        beforeEach(function () {
            // API
            window.API = Milo.API.create({});
            API.options('baseUrl', 'https://myurl/');
            API.options('auth', {access_token: 'sometoken'});
            
            // Fake Server
            server = sinon.fakeServer.create();
        });

        afterEach(function () {
            window.API = undefined;
            server.restore();
        });

        it('should fail if it does not contain properties', function () {
            // Arrange
            API.options('baseUrl', 'https://myapi.com/api');
            API.options('auth', { access_token: 'token' });

            // Act
            window.API.Foo = Milo.Model.extend({});

            // Assert
            (function () {
                window.API.Foo.find({ 'id': 42 }).single();
            }).should.Throw(/uriTemplate not set in model/i);
        });

        it('should make an ajax call', function (d0ne) {
            // Arrange
            API.options('baseUrl', 'https://myapi.com/api');
            API.options('auth', { api_key: 'XXX' });

            API.Foo = Milo.Model.extend({
                uriTemplate: '/foo/:id',
                id: Milo.property('number'),
                name: Milo.property('string', {
                    defaultValue: '',
                    operations: ['put', 'post'],
                    validationRules: {
                        required: true
                    }
                })
            });
            
            // Act 
            var foo = API.Foo.find({'id':42}).single();

            // Assert
            foo.should.not.equal(undefined);
            foo.should.have.property('isLoading', true);
            foo.should.have.property('done');
            foo.done(function (data) {
                foo.should.be.equal(data);
                foo.should.have.property('isLoading', false);
                // XXX Can't have a property named content, throw exception if found
                foo.get('content').should.be.ok;
                foo.get('id').should.be.equal(42);
                foo.get('name').should.be.equal('Catch 22');
                
                server.requests.length.should.be.equal(1);
                server.requests[0].url.should.be.equal("https://myapi.com/api/foo/42?api_key=XXX");
    
                
                d0ne();
            });
            
            server.requests[0].respond(200, { "Content-Type": "application/json" }, JSON.stringify({id: 42, name: 'Catch 22'}));
            
        });
    });
    
    describe('when called find on nested elements', function () {
        var xhr, requests;
        beforeEach(function () {
            // API
            window.API = Milo.API.create();
            API.options('baseUrl', 'https://myurl/');
        });
        afterEach(function () {
            window.API = undefined;
        });

        it('should fail if nested element is invalid', function () {
            throw 'Not implemented';
        });

        it('should handle nested entities', function (done) {
            // XXX What is rootElement? rootElement is the root element that contains the array
            // (arrays should not be json as plain JSON)
            // XXX What is uriTemplate?
            // XXX Assert that an entity can't use array if rootElement is not set
            API.options('baseUrl', 'https://myapi.com/api');
            API.options('auth', {
                access_token: 'token'
            });

            API.Bar = Milo.Model.extend({
                uriTemplate: '/bar/:id',
                id: Milo.property('number'),
                name: Milo.property('string')
            });

            API.Foo = Milo.Model.extend({
                uriTemplate: '/foo/"id',
                id: Milo.property('number'),
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


    describe('if setting a content type', function () {
        it('must be added to the requests', function () {
            throw "Not implemented";
        });
    });

});

