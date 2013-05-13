describe('Write operations', function () {
    var server;

    beforeEach(function () {
        // API
        window.API = Milo.API.create({});
        API.options('baseUrl', 'https://fake');

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
        API.Dog = Milo.Model.extend({
            uriTemplate: '/dog/:id',
            id: Milo.property('number'),
            name: Milo.property('string')
        });
        dog = API.Dog.create({id: 9, name: 'Bobby'});

        // Act
        promise = dog.save();

        dog.should.be.ok;
        dog.should.have.property('isSaving', true);
        ['done', 'fail', 'then'].forEach(function (verb) {
            promise.should.have.property(verb);
        });

        // Assert
        promise.done(function (data) {
            data.should.be.equal(dog);
            data.should.have.property('isSaving', false);

            data.get('id').should.be.equal(9);
            data.get('name').should.be.equal('Bobby');

            done();
        });

        server.requests[0].url.should.be.equal('https://fake/dog?');
        server.requests[0].respond(200, {'Content-Type': 'application/json'},
            "{}");
    });
});
