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
            API = Milo.API.create();

            API.should.be.ok;
            API.should.have.property('options');
            API.should.have.property('headers');
            API.should.have.property('queryParams');
            API.isNamespace.should.be.true;
        });

        it('should allow to setup baseUrl', function () {
            var baseUrlV1 = 'http://myserver/api/v1',
                baseUrlV2 = 'http://myserver/api/v2';

            API = Milo.API.create();

            API.options('baseUrl', baseUrlV1);
            API.options('baseUrl').should.be.equal(baseUrlV1);

            API.options({ baseUrl: baseUrlV2 });
            API.options('baseUrl').should.be.equal(baseUrlV2);
        });

        it('should allow to setup an apiKey', function () {
            var apiKeyV1 = 'my_apu_key_v1',
                apiKeyV2 = 'my_apu_key_v2';

            API = Milo.API.create();

            API.queryParams('apiKey', apiKeyV1);
            API.queryParams('apiKey').should.be.equal(apiKeyV1);

            API.queryParams({ apiKey: apiKeyV2 });
            API.queryParams('apiKey').should.be.equal(apiKeyV2);
        });

        it('should have a default adapter', function () {
            API = Milo.API.create();
            API.adapter().should.be.ok;
        });

        it('should have a default serializer', function () {
            API = Milo.API.create();
            API.serializer().should.be.ok;
        });

        it('should allow to setup an adapter', function () {
            var mockAdapter = { mock: true };
            API = Milo.API.create();

            API.adapter(mockAdapter);

            API.adapter().should.be.equal(mockAdapter);
        });

        it('should allow to setup a serializer', function () {
            var mockSerializer = { mock: true };
            API = Milo.API.create();

            API.serializer(mockSerializer);

            API.serializer().should.be.equal(mockSerializer);
        });
    });
});