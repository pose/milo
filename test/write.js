describe('Write operations', function () {
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
        server.restore();
    });

    it('should work with basic entities', function (done) {
        var dog, promise;

        // Arrange
        dog = API.Dog.create({id: 9, name: 'Bobby'});

        // Act
        promise = dog.save();

        // Assert
        dog.should.be.ok;
        dog.get('isSaving').should.be.equal(true);
        ['done', 'fail', 'then'].forEach(function (verb) {
            promise.should.have.property(verb);
        });

        promise.done(function (data) {
            data.should.be.equal(dog);
            data.get('isSaving').should.be.equal(false);

            data.get('id').should.be.equal(9);
            data.get('name').should.be.equal('Bobby');

            server.requests[0].method.should.be.equal('PUT');
            server.requests[0].url.should.be.equal('https://fake/dog?');
            server.requests.length.should.be.equal(1);

            done();
        });

        server.requests[0].respond(200, {'Content-Type': 'application/json'},
            "{}");
    });

    it.skip('should work with existing basic entities', function (done) {
        var dog, promise;

        // Arrange
        dog = API.Dog.where({id: 9}).findOne();

        dog.done(function () {
            // Act
            dog.set('name', 'Pompi');
            dog.should.have.property('save');
            promise = dog.save();

            // Assert
            dog.should.be.ok;
            dog.get('isSaving').should.be.equal(true);
            ['done', 'fail', 'then'].forEach(function (verb) {
                promise.should.have.property(verb);
            });

            promise.done(function (data) {
                data.should.be.equal(dog);
                data.get('isSaving').should.be.equal(false);

                data.get('id').should.be.equal(9);
                data.get('name').should.be.equal('Pompi');

                server.requests[1].method.should.be.equal('POST');
                server.requests[1].url.should.be.equal('https://fake/dog?');
                server.requests.length.should.be.equal(2);

                done();
            });

            server.requests[1].respond(200, {'Content-Type': 'application/json'},
                "{}");
        });

        server.requests[0].respond(200, {'Content-Type': 'application/json'},
            JSON.stringify({id: 9, name: 'Milu'}));

    });

    it.skip('should work with nested entities', function () {
        // Arrange
        var book, author, promise;

        book = API.Book.create({id: 1, name: 'A Clockwork Orange',
            authors: [API.Author.create({id: 5, name: 'Anthony Burgess'})]});

        // Act
        author = book.get('authors')[0];
        author.set('name', 'Jorge Luis Borges');
        promise = author.save();

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

    it.skip('should work with existing nested entities', function () {
    });

    it('.fail() should be executed when the request fail', function (done) {
        var dog, promise;

        // Arrange
        API.Dog = Milo.Model.extend({
            uriTemplate: '/dog/:id',
            id: Milo.property('number'),
            name: Milo.property('string')
        });
        dog = API.Dog.create({id: 9, name: 'Bobby'});

        // Act
        promise = dog.save();

        // Assert
        dog.should.be.ok;
        dog.should.have.property('isSaving', true);
        ['done', 'fail', 'then'].forEach(function (verb) {
            promise.should.have.property(verb);
        });

        // TODO XXX What is data?!?!?
        promise.fail(function (data) {
            dog.should.have.property('isSaving', false);

            dog.get('id').should.be.equal(9);
            dog.get('name').should.be.equal('Bobby');

            server.requests[0].method.should.be.equal('PUT');
            server.requests[0].url.should.be.equal('https://fake/dog?');
            server.requests.length.should.be.equal(1);

            done();
        });

        server.requests[0].respond(404, {'Content-Type': 'application/json'},
            JSON.stringify({message: 'Entity not found'}));
    });

});
