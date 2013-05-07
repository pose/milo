chai.should();
var expect = chai.expect;

describe('Core', function () {
    describe('initialization', function () {
        var API;

        beforeEach(function () {

        });

        afterEach(function () {
            API = undefined;
        });

        it('should create valid milo namespace', function () {
            // Act
            API = Milo.API.create();

            // Assert
            API.should.be.ok;
            API.should.have.property('options');
            API.should.have.property('headers');
            API.should.have.property('queryParams');
            API.isNamespace.should.be.true;
        });

        it('should allow to setup baseUrl as property', function () {
            // Arrange
            var baseUrlV1 = 'http://myserver/api/v1',
                baseUrlV2 = 'http://myserver/api/v2';

            API = Milo.API.create();

            // Act
            API.options('baseUrl', baseUrlV1);

            // Assert
            API.options('baseUrl').should.be.equal(baseUrlV1);
        });

        it('should allow to setup baseUrl as hashmap', function () {
            // Arrange
            var baseUrlV1 = 'http://myserver/api/v1',
                baseUrlV2 = 'http://myserver/api/v2';

            API = Milo.API.create();

            // Act
            API.options({ baseUrl: baseUrlV2 });

            // Assert
            API.options('baseUrl').should.be.equal(baseUrlV2);
        });


        it('should allow to setup an apiKey as property', function () {
            // Arrange
            var apiKeyV1 = 'my_apu_key_v1',
                apiKeyV2 = 'my_apu_key_v2';

            API = Milo.API.create();

            // Act
            API.queryParams('apiKey', apiKeyV1);

            // Assert
            API.queryParams('apiKey').should.be.equal(apiKeyV1);
        });

        it('should allow to setup an apiKey as hashmap', function () {
            // Arrange
            var apiKeyV1 = 'my_apu_key_v1',
                apiKeyV2 = 'my_apu_key_v2';

            API = Milo.API.create();

            // Act
            API.queryParams({ apiKey: apiKeyV2 });

            // Assert
            API.queryParams('apiKey').should.be.equal(apiKeyV2);
        });

        it('should return all query params', function () {
            // Arrange
            var param1 = 'param1',
                param2 = 'param2';

            API = Milo.API.create();

            // Act
            API.queryParams({ param1: param1, param2: param2 });

            // Assert
            API.queryParams().param1.should.be.equal(param1);
            API.queryParams().param2.should.be.equal(param2);
        });

        it('should have a default adapter', function () {
            // Act
            API = Milo.API.create();

            // Assert
            API.adapter().should.be.ok;
        });

        it('should have a default serializer', function () {
            // Act
            API = Milo.API.create();

            // Assert
            API.serializer().should.be.ok;
        });

        it('should allow to setup an adapter', function () {
            // Arrange
            var mockAdapter = { mock: true };

            API = Milo.API.create();

            // Act
            API.adapter(mockAdapter);

            // Assert
            API.adapter().should.be.equal(mockAdapter);
        });

        it('should allow to setup a serializer', function () {
            // Arrange
            var mockSerializer = { mock: true };

            API = Milo.API.create();

            // Act
            API.serializer(mockSerializer);

            // Assert
            API.serializer().should.be.equal(mockSerializer);
        });
    });
});