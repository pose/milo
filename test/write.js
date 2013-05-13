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

        // Assert
        dog.should.be.ok;
        dog.should.have.property('isSaving', true);
        ['done', 'fail', 'then'].forEach(function (verb) {
            promise.should.have.property(verb);
        });

        promise.done(function (data) {
            data.should.be.equal(dog);
            data.should.have.property('isSaving', false);

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

    it.skip('should work with existing basic entities', function () {
    });

    it.skip('should work with nested entities', function () {
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
