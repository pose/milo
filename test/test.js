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


    describe('when called find', function () {
        var Fixture;
        beforeEach(function () {
            sinon.stub($, 'get', function (url) {
                var defer = $.Deferred();
                setTimeout(function () {
                    defer.resolve({'id': 42, 'name': 'Catch 22'});
                }, 0);
                return defer.promise();
            });
            Milo.Options.set('baseUrl', 'https://myurl/%@');
            Milo.Options.set('auth', {
                access_token: 'sometoken'
            });
            Fixture = Ember.Namespace.create({
                revision: 1
            });
        });
        afterEach(function () {
            $.get.restore();
        });
        it('should fail if it does not contain properties', function () {
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', {access_token: 'token'});
            
            Fixture.Foo = Milo.Model.extend({});

            Fixture.Foo.find({ 'id': 42 }).single(function () { }).done(function () { });
        });

        it('should make an ajax call when called find', function (d0ne) {
            // XXX What happens if I want to consume more than one API?
            // XXX Should this be static?
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', {access_token: 'token'});
            
            Fixture.Foo = Milo.Model.extend({
                rootElement: 'foo',
                uriTemplate: Milo.UriTemplate('/foo/%@'),
                name: Milo.property('string', {
                    defaultValue: '',
                    operations: ['put', 'post'],
                    validationRules: {
                        required: true
                    }
                })
            });

            var x = Fixture.Foo.find({ 'id': 42 }).single();
            x.should.not.equal(undefined);
            x.should.have.property('isLoading', true);
            x.should.have.property('done');
            x.done(function () {
                // XXX Done parameters
                // XXX What happens if what is sent does not match the schema?
                x.should.have.property('isLoading', false);
                console.log(x);
                x.should.have.deep.property('deferred.id', 42);
                d0ne();
                
            });
            // TODO x shoud contain the id
            // TODO x should be a promise
            // TODO x must have done defined (so I can asign my callbakc)
            // x.should.be.
            $.get.should.have.been.calledWith('https://myapi.com/api/foo/42?access_token=token');
        });

        it('should fail if nested element is invalid', function () {
            throw 'Not implemented';
        });
        
        it('should handle nested entities', function (done) {
            // XXX What is rootElement?
            // XXX What is uriTemplate?
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', {access_token: 'token'});

            Fixture.Bar = Milo.Model.extend({
                rootElement: 'bar',
                uriTemplate: Milo.UriTemplate('/bar/%@'),
                name: Milo.property('string')
            });

            Fixture.Foo = Milo.Model.extend({
                rootElement: 'foo',
                uriTemplate: Milo.UriTemplate('/foo/%@'),
                name: Milo.property('string', {
                    defaultValue: '',
                    operations: ['put', 'post'],
                    validationRules: {
                        required: true
                    }
                }),
                bar: Milo.collection(Fixture.Bar)
            });
            
            Fixture.Foo.find({
                id: 42 
            })
            .single()
            .done(function (elem) { 
                throw "Not implemented";
                //done();
            });
            
            $.get.should.have.been.calledWith(
                    'https://myapi.com/api/foo/42?access_token=token');

            

        });

        // XXX We shouldn't be able to pass callbacks to single


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
