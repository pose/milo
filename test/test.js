chai.should();
var expect = chai.expect;


// Cases
// What happens if there is no element returned in the query and I do .single?
//

describe('Milo', function () {
    describe('baseUrl', function () {
        var Fixture, nothing;

        beforeEach(function () {
            Fixture = Ember.Namespace.create({
                revision: 1
            });
            Fixture.Foo = Milo.Model.extend({});
            nothing = function () {};
        });
        afterEach(function () {});

        // XXX Shouldn't fail earlier?
        it('should fail if not set', function () {
            Milo.Options.set('baseUrl', undefined);
            expect(Fixture.Foo.find({
                'id': 42
            }).single, nothing).to.Throw(TypeError);
        });

        it('should fail if set to an invalid protocol', function () {
            Milo.Options.set('baseUrl', 'smtp://hello');
            expect(Fixture.Foo.find({
                'id': 42
            }).single, nothing).to.Throw(/invalid protocol/i);

            Milo.Options.set('baseUrl', 'bye://hello');
            expect(Fixture.Foo.find({
                'id': 42
            }).single, nothing).to.Throw(/invalid protocol/);
        });

        it('should work with http and https', function () {
            throw 'Not implemented';
        });
    });

    describe('given retrieved entities', function () {
        it('must be able to find elements', function () {
            throw 'Not implemented';
        });
    });
    describe('if single returns more than one element', function () {
        it('must throw an exception', function () {
            throw 'Not implemented';
        });
    });

    describe('with jQuery mocked', function () {
        var Fixture;
        beforeEach(function () {
            console.log(sinon.spy);
            sinon.spy($, 'ajax');
            Milo.Options.set('baseUrl', 'https://myurl/%@');
            Milo.Options.set('auth', {
                access_token: 'sometoken'
            });
            Fixture = Ember.Namespace.create({
                revision: 1
            });
            Fixture.Foo = Milo.Model.extend({});
        });
        afterEach(function () {
            $.ajax.restore();
        });

        it('should make an ajax call', function () {
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', {
                access_token: 'token'
            });

            // XXX How do I instanciate this?

            Fixture.Foo.find({
                'id': 42
            }).single(function () {

            }).done(function () {

            });

        });

    });

    describe('Queryable', function () {
        var queryable = Em.Object.extend(Milo.Queryable, {}).create();

        // XXX Can I order by unexisting fields?
        // XXX What happen if I submit a number as field to orderBy?

        it('must support order asc', function () {
            queryable.orderBy('someField');
            queryable.get('orderByClause').orderBy.should.equal('someField');
            queryable.get('orderByClause').order.should.equal('asc');
        });
        it('must support order desc', function () {
            queryable.orderByDescending('someField');
            queryable.get('orderByClause').orderBy.should.equal('someField');
            queryable.get('orderByClause').order.should.equal('desc');
        });
        describe('take', function () {
            it('should generate the clause', function () {
                queryable.take(15);
                queryable.get('takeClause').limit.should.equal(15);

            });
            it('should work with 0', function () {
                queryable.take(0);
                queryable.get('takeClause').limit.should.equal(0);
            });
            it('should not allow invalid indexes', function () {
                expect(queryable.take, -14).to.Throw(/invalid index/i);
                expect(queryable.take, 'hello').to.Throw(/invalid index/i);
            });
        });
        describe('skip', function () {
            it('should generate the caluse', function () {
                queryable.skip(10);
                queryable.get('skipClause').offset.should.equal(10);
            });
            it('should allow 0', function () {
                queryable.skip(0);
            });
            it('should not allow invalid indexes', function () {
                expect(queryable.skip, -4).to.Throw(/invalid index/i);
                expect(queryable.skip, 'bar').to.Throw(/invalid index/i);
            });
        });
        it('must support find', function () {
            throw 'Not implemented';
        });
        it('must support single', function () {
            throw 'Not implemented';
        });
        it('must support toArray', function () {
            throw 'Not implemented';
        });
    });
});