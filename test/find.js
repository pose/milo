chai.should();
var expect = chai.expect;

// TODO What happens if there is no element returned in the query and I do .single?
// TODO Test always returning a proxy with deferred
// XXX Why can't we remove operations array from the model?
// XXX .fail() does not work
// XXX What happens if JSON sent does not match the schema? Ans: There is not validation
// XXX Assert that an entity can't use array if rootElement is not set
// First done parameter is foo

describe('Milo', function () {

    describe('when called find', function () {
        var server;

        beforeEach(function () {
            // API
            window.API = Milo.API.create({});
            API.options('baseUrl', 'https://myapi.com/api');
            API.options('auth', { api_key: 'XXX' });
            
            // Fake Server
            server = sinon.fakeServer.create();
        });

        afterEach(function () {
            window.API = undefined;
            server.restore();
        });

        it('should fail if it does not contain properties', function () {
            // Act
            window.API.Foo = Milo.Model.extend({});

            // Assert
            (function () {
                window.API.Foo.find({ 'id': 42 }).single();
            }).should.Throw(/uriTemplate not set in model/i);
        });

        it('should make an ajax call', function (done) {
            // Arrange
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
            foo.should.should.be.ok;
            foo.should.have.property('isLoading', true);
            foo.should.have.property('done');
            foo.done(function (data) {
                foo.should.be.equal(data);
                foo.should.have.property('isLoading', false);
                // XXX Can't have a property named content, throw exception if found
                foo.get('id').should.be.equal(42);
                foo.get('name').should.be.equal('Catch 22');
                
                server.requests.length.should.be.equal(1);
                server.requests[0].url.should.be.equal("https://myapi.com/api/foo/42?api_key=XXX");
    
                
                done();
            });
            
            server.requests[0].respond(200, { "Content-Type": "application/json" }, 
                    JSON.stringify({id: 42, name: 'Catch 22'}));
            
        });
    });
    
    describe('on nested elements', function () {
        var xhr, requests;
        beforeEach(function () {
            // API
            window.API = Milo.API.create();
            API.options('baseUrl', 'https://myapi.com/api');

            // Server
            server = sinon.fakeServer.create();
        });
        afterEach(function () {
            window.API = undefined;
            server.restore();
        });

        it('should handle nested entities', function (done) {
            // Arrange
            API.Author = Milo.Model.extend({
                uriTemplate: '/book/:bookId/authors',
                rootElement: 'authors',
                id: Milo.property('number'),
                name: Milo.property('string')
            });

            API.Book = Milo.Model.extend({
                uriTemplate: '/book/:id',
                id: Milo.property('number'),
                name: Milo.property('string', {
                    defaultValue: '',
                    operations: ['put', 'post'],
                    validationRules: {
                        required: true
                    }
                }),
                authors: Milo.collection('API.Author')
            });

            // Act
            var author = API.Book.find({id: 42})
                .get('authors')
                .find()
                .single()
                .done(function (data) {
                    // Assert
                    author.should.be.equal(data);
                    author.should.have.property('isLoading', false);

                    author.get('id').should.be.equal(23);
                    author.get('name').should.be.equal('Joseph Heller');

                    server.requests.length.should.be.equal(1);
                    server.requests[0].url.should.be.equal("https://myapi.com/api/book/42/authors?");

                    done();
                });
            author.should.be.ok;
            author.should.have.property('isLoading', true);
            author.should.have.property('done');

            server.requests[0].respond(200, { "Content-Type": "application/json" }, 
                    JSON.stringify({authors: [{id: 23, name: 'Joseph Heller'}]}));
        });


        describe('if query returns more than one element', function () {
            it('single must not throw an exception and pick the first element of the array', function (done) {
                // Arrange
                API.Author = Milo.Model.extend({
                    uriTemplate: '/book/:bookId/authors',
                    rootElement: 'authors',
                    id: Milo.property('number'),
                    name: Milo.property('string')
                });

                API.Book = Milo.Model.extend({
                    uriTemplate: '/book/:id',
                    id: Milo.property('number'),
                    name: Milo.property('string', {
                        defaultValue: '',
                        operations: ['put', 'post'],
                        validationRules: {
                            required: true
                        }
                    }),
                    authors: Milo.collection('API.Author')
                });

                // Act
                var author = API.Book.find({id: 42})
                    .get('authors')
                    .find()
                    .single()
                    .done(function (data) {
                        // Assert
                        author.should.be.equal(data);
                        author.should.have.property('isLoading', false);

                        author.get('id').should.be.equal(23);
                        author.get('name').should.be.equal('Joseph Heller');

                        server.requests.length.should.be.equal(1);
                        server.requests[0].url.should.be.equal("https://myapi.com/api/book/42/authors?");

                        done();
                    });
                author.should.be.ok;
                author.should.have.property('isLoading', true);
                author.should.have.property('done');

                server.requests[0].respond(200, { "Content-Type": "application/json" }, 
                        JSON.stringify({authors: [{id: 23, name: 'Joseph Heller'}, {id: 24, name: 'Julio Cortázar'}]}));
            });
        });

        describe('if using toArray', function () {
            it('should work and return collection', function (done) {
                // Arrange
                API.Author = Milo.Model.extend({
                    uriTemplate: '/book/:bookId/authors',
                    rootElement: 'authors',
                    id: Milo.property('number'),
                    name: Milo.property('string')
                });

                API.Book = Milo.Model.extend({
                    uriTemplate: '/book/:id',
                    id: Milo.property('number'),
                    name: Milo.property('string'),
                    authors: Milo.collection('API.Author')
                });

                // Act
                var author = API.Book.find({id: 42})
                    .get('authors')
                    .find()
                    .toArray()
                    .done(function (data) {
                        // Assert
                        author.should.be.equal(data);
                        author.should.have.property('isLoading', false);

                        author[0].get('id').should.be.equal(23);
                        author[0].get('name').should.be.equal('Joseph Heller');
                        
                        author[1].get('id').should.be.equal(24);
                        author[1].get('name').should.be.equal('Julio Cortázar');

                        server.requests.length.should.be.equal(1);
                        server.requests[0].url.should.be.equal("https://myapi.com/api/book/42/authors?");

                        done();
                    });
                author.should.be.ok;
                author.should.have.property('isLoading', true);
                author.should.have.property('done');

                server.requests[0].respond(200, { "Content-Type": "application/json" }, 
                        JSON.stringify({authors: [{id: 23, name: 'Joseph Heller'}, {id: 24, name: 'Julio Cortázar'}]}));
            });

        });

    });

    describe('if token is added', function () {

        beforeEach(function () {
            // API
            window.API = Milo.API.create({});
            API.options('baseUrl', 'https://myapi.com/api');
            
            // Fake Server
            server = sinon.fakeServer.create();
        });

        afterEach(function () {
            window.API = undefined;
            server.restore();
        });
        it('should add it to the request', function (done) {
            // Arrange
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
            API.options('auth', { api_key: 'XXX' });
            
            // Act 
            var foo = API.Foo.find({'id':42}).single();

            // Assert
            foo.should.should.be.ok;
            foo.done(function (data) {
                server.requests.length.should.be.equal(1);
                server.requests[0].url.should.be.equal("https://myapi.com/api/foo/42?api_key=XXX");
    
                done();
            });
            
            server.requests[0].respond(200, { "Content-Type": "application/json" }, 
                    JSON.stringify({id: 42, name: 'Catch 22'}));
            
        });
    });


    describe('if setting a content type', function () {
        beforeEach(function () {
            // API
            window.API = Milo.API.create({});
            API.options('baseUrl', 'https://myapi.com/api');
            
            // Fake Server
            server = sinon.fakeServer.create();
        });

        afterEach(function () {
            window.API = undefined;
            server.restore();
        });
        it('must be added to the requests', function (done) {
            // Arrange
            API.Foo = Milo.Model.extend({
                uriTemplate: '/foo/:id',
                id: Milo.property('number'),
                name: Milo.property('string')
            });
            API.headers('Content-Type', 'application/cool');
            
            // Act 
            var foo = API.Foo.find({'id':42}).single();

            // Assert
            foo.should.should.be.ok;
            foo.done(function (data) {
                server.requests.length.should.be.equal(1);
                server.requests[0].url.should.be.equal("https://myapi.com/api/foo/42?");
                server.requests[0].requestHeaders['Content-Type'].should.be.ok;
                server.requests[0].requestHeaders['Content-Type'].should.be.equal('application/cool');
    
                done();
            });
            
            server.requests[0].respond(200, { "Content-Type": "application/json" }, 
                    JSON.stringify({id: 42, name: 'Catch 22'}));
            

        });
    });

});

