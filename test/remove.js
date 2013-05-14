describe('Remove operations', function () {
    var server;
    beforeEach(function () {
        // API
        window.API = Milo.API.create({});
        API.options('baseUrl', 'https://fake');
        
        API.Dog = Milo.Model.extend({
            uriTemplate: '/dog/:id',
            id: Milo.property('number'),
            name: Milo.property('string')
        });

        API.Author = Milo.Model.extend({
            id: Milo.property('number'),
            name: Milo.property('string')
        });

        API.Book = Milo.Model.extend({
            uriTemplate: '/book/:id',
            id: Milo.property('number'),
            name: Milo.property('string'),
            authors: Milo.collection('API.Author', {embedded: true})
        });

        // Fake server
        server = sinon.fakeServer.create();
    });
    afterEach(function () {
        window.API = undefined;
        server = undefined;
    });
    it.skip('should work with basic entities', function (done) {
        var dog, promise;
        
        // Arrange
        dog = API.Dog.create({id: 9, name: 'Bobby'});

        // Act
        promise = dog.remove();

        // Assert
        dog.should.be.ok;
        dog.should.have.property('isDeleting', true);
        ['done', 'fail', 'then'].forEach(function (verb) {
            promise.should.have.property(verb);
        });

        promise.done(function (data) {
            data.should.be.equal(dog);
            data.should.have.property('isDeleting', false);
            
            server.requests[0].method.should.be.equal('DELETE');
            server.requests[0].url.should.be.equal('https://fake/dog/9?');
            server.requests.length.should.be.equal(1);

            done();
        });

        server.requests[0].respond(200, {'Content-Type': 'application/json'}, "{}");

    });

    it.skip('should work with nested entities', function (done) {
        // Arrange
        var book, author, promise;

        book = API.Book.create({id: 1, name: 'A Clockwork Orange', 
            authors: [API.Author.create({id: 5, name: 'Anthony Burgess'})]});

        // Act
        author = book.get('authors')[0];
        promise = author.remove();

        // Assert
        promise.should.be.ok;
        author.should.be.ok;
        author.should.have.property('isDeleting', true);
        ['done', 'fail', 'then'].forEach(function (verb) {
            promise.should.have.property(verb);
        });
        
        // XXX What is data?
        promise.done(function (data) {
            data.should.have.property('isDeleting', false);
            
            server.requests[0].method.should.be.equal('POST');
            server.requests[0].url.should.be.equal('https://fake/dog/9?');
            server.requests.length.should.be.equal(1);

            // Assert that the entity is no longer present in the array

            done();
        });

        server.requests[0].respond(200, {'Content-Type': 'application/json'}, "{}");


    });

    it.skip('.fail() should be executed when the request fail', function (done) {
        // Arrange
        var dog, promise;
        dog = API.Dog.create({id: 9, name: 'Bobby'});

        // Act
        promise = dog.remove();

        // Assert
        dog.should.be.ok;
        dog.should.have.property('isDeleting', true);
        ['done', 'fail', 'then'].forEach(function (verb) {
            promise.should.have.property(verb);
        });

        // TODO XXX What is data?
        promise.fail(function (data) {
            data.should.have.property('isDeleting', false);
            
            server.requests[0].method.should.be.equal('DELETE');
            server.requests[0].url.should.be.equal('https://fake/dog/9?');
            server.requests.length.should.be.equal(1);

            done();
        });

        server.requests[0].respond(404, {'Content-Type': 'application/json'}, 
                JSON.strinfigy({message: 'Entity not found'}));

    });
});
