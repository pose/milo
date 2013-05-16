chai.should();
var expect = chai.expect;

describe('Pagination', function () {
    describe('initialization', function () {

        beforeEach(function () {
            window.API = Milo.API.create();
        });

        afterEach(function () {
            API = undefined;
        });

        it('should allow to setup a pagination plugin', function () {
            // Arrange
            var plugin = {},
                config = {};


            // Act
            API.options('pagination', { plugin: plugin, config: config });

            // Assert
            API.options('pagination').plugin.should.be.equal(plugin);
            API.options('pagination').config.should.be.equal(config);
        });

        it('should throw an exception if the pagination plugin is not configured', function () {
            // Arrange
            var paginateCall;

            API = Milo.API.create();

            API.Foo = Milo.Model.extend({
                uriTemplate: '/foo/:id',
                id: Milo.property('number'),
                name: Milo.property('string'),
                active: Milo.property('boolean')
            });

            // Act
            paginateCall = function() {
                API.Foo.where({ active: true }).paginate({ page: 1 }).findMany();
            };

            // Assert
            paginateCall.should.Throw('Pagination is not configured');
        });


        it('should throw an exception if the pagination plugin does not extend Milo.PaginationPlugin', function () {
            // Arrange
            var plugin = Em.Object.extend(),
                config = {},
                paginateCall;

            API = Milo.API.create();

            API.Foo = Milo.Model.extend({
                uriTemplate: '/foo/:id',
                id: Milo.property('number'),
                name: Milo.property('string'),
                active: Milo.property('boolean')
            });

            API.options('pagination', { plugin: plugin, config: config });

            // Act
            paginateCall = function() {
                API.Foo.where({ active: true }).paginate({ page: 1 }).findMany();
            };

            // Assert
            paginateCall.should.Throw('Pagination plugin should extend Milo.PaginationPlugin');
        });

        it('should throw an exception if the pagination plugin is not an Ember class', function () {
            // Arrange
            var plugin = {},
                config = {},
                paginateCall;

            API = Milo.API.create();

            API.Foo = Milo.Model.extend({
                uriTemplate: '/foo/:id',
                id: Milo.property('number'),
                name: Milo.property('string'),
                active: Milo.property('boolean')
            });

            API.options('pagination', { plugin: plugin, config: config });

            // Act
            paginateCall = function() {
                API.Foo.where({ active: true }).paginate({ page: 1 }).findMany();
            };

            // Assert
            paginateCall.should.Throw('Pagination plugin should be an Ember class');
        });

    });
});
