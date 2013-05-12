chai.should();
var expect = chai.expect;

// TODO What happens if there is no element returned in the query and I do .single?
// TODO Test always returning a proxy with deferred
// XXX Why can't we remove operations array from the model?
// XXX .fail() does not work
// XXX What happens if JSON sent does not match the schema? Ans: There is not validation
// XXX Assert that an entity can't use array if rootElement is not set
// First done parameter is foo


describe('Find', function () {
    var server;

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

    it('should fail if the uriTemplate is not set', function () {
        // Act
        window.API.Foo = Milo.Model.extend({});

        // Assert
        (function () {
            window.API.Foo.where({ 'id': 42 }).findOne();
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
        var foo = API.Foo.where({'id':42}).findOne();

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
            server.requests[0].url.should.be.equal("https://myapi.com/api/foo/42?");

            
            done();
        });
        
        server.requests[0].respond(200, { "Content-Type": "application/json" }, 
                JSON.stringify({id: 42, name: 'Catch 22'}));
        
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
        var author = API.Book.where({id: 42})
            .get('authors')
            .findOne()
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


    it('findOne must pick the first element of the array if query returns more than one element', function (done) {
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
        var author = API.Book.where({id: 42})
            .get('authors')
            .findOne()
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

    it('should work and return collection if using findMany', function (done) {
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
        var author = API.Book.where({id: 42})
            .get('authors')
            .findMany()
            .done(function (data) {
                // Assert
                author.should.be.equal(data);
                author.should.have.property('isLoading', false);

                author.objectAt(0).get('id').should.be.equal(23);
                author.objectAt(0).get('name').should.be.equal('Joseph Heller');

                author.objectAt(1).get('id').should.be.equal(24);
                author.objectAt(1).get('name').should.be.equal('Julio Cortázar');

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

    it('should add the access token/api key it to the request', function (done) {
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
        var foo = API.Foo.where({'id':42}).findOne();

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

    it('should add content type (when set) to the requests', function (done) {
        // Arrange
        API.Foo = Milo.Model.extend({
            uriTemplate: '/foo/:id',
            id: Milo.property('number'),
            name: Milo.property('string')
        });
        API.headers('Content-Type', 'application/cool');
        
        // Act 
        var foo = API.Foo.where({'id':42}).findOne();

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


