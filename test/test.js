chai.should();
var expect = chai.expect;


// Cases
// TODO What happens if there is no element returned in the query and I do .single?
// TODO Support for multiple APIs (un-singletonize)
// TODO Test always returning a proxy with deferred

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
        afterEach(function () {
        });

        it('should fail if not set', function () {
            expect(function () { 
                Milo.Options.set('baseUrl', undefined);
            }).to.Throw(/not supported/i);
        });

        it('should fail if set to an invalid protocol', function () {
            expect(function () {
                Milo.Options.set('baseUrl', 'smtp://hello');
            }).to.Throw(/smtp.*not supported/i);

            expect(function () {
                Milo.Options.set('baseUrl', 'bye://hello');
            }).to.Throw(/bye.* not supported/i);
        });

        it('should work with http and https', function () {
            var http = 'http://hello',  https = 'https://hello';
            Milo.Options.set('baseUrl', http);
            Milo.Options.get('baseUrl').should.be.a('string');
            Milo.Options.get('baseUrl').should.equal(http);
            
            Milo.Options.set('baseUrl', https);
            Milo.Options.get('baseUrl').should.be.a('string');
            Milo.Options.get('baseUrl').should.equal(https);
        });
    });


    describe('when called find', function () {
        var Fixture;
        beforeEach(function () {
            sinon.stub($, 'get', function (url) {
                var defer = $.Deferred();
                setTimeout(function () {
                    defer.resolve({ 
                        'id': 42,
                        'name': 'Catch 22'
                    });
                }, 1000);
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
            Milo.Options.set('auth', { access_token: 'token' });

            Fixture.Foo = Milo.Model.extend({});

            expect(function () {
                Fixture.Foo.find({ 'id': 42 }).single();
            }).to.Throw(/uriTemplate not set in model/i);
        });

        it('should make an ajax call when called find', function (d0ne) {
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', {
                access_token: 'token'
            });

            Fixture.Foo = Milo.Model.extend({
                uriTemplate: Milo.UriTemplate('/foo/%@'),
                name: Milo.property('string', {
                    defaultValue: '',
                    operations: ['put', 'post'],
                    validationRules: {
                        required: true
                    }
                })
            });

            var foo = Fixture.Foo.find({ 'id': 42 }).single();
            foo.should.not.equal(undefined);
            foo.should.have.property('isLoading', true);
            foo.should.have.property('done');
            foo.done(function (data) {
                // XXX What happens if what is sent does not match the schema? Ans: There is not validation
                // First done parameter is foo
                foo.should.be.equal(data);
                foo.should.have.property('isLoading', false);
                foo.get('content').should.be.ok;
                foo.get('content.id').should.be.equal(42);
                foo.get('content.name').should.be.equal('Catch 22');
                d0ne();

            });

            $.get.should.have.been.calledWith('https://myapi.com/api/foo/42?access_token=token');
        });

        it('should fail if nested element is invalid', function () {
            throw 'Not implemented';
        });

        it('should handle nested entities', function (done) {
            // XXX What is rootElement? rootElement is the root element that contains the array
            // (arrays should not be json as plain JSON)
            // XXX What is uriTemplate?
            // XXX Assert that an entity can't use array if rootElement is not set
            Milo.Options.set('baseUrl', 'https://myapi.com/api%@');
            Milo.Options.set('auth', {
                access_token: 'token'
            });

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


        describe('if single returns more than one element', function () {
            it('must throw an exception', function () {
                throw "Not implemented";
            });
        });

        describe('if using toArray', function () {
            it('should work and return collection', function () {
                throw "Not implemented";
            });

        });

    });

    describe('Queryable', function () {
        var queryable = Em.Object.extend(Milo.Queryable, {}).create();

        // XXX Can I order by unexisting fields? Yes, we can't check that

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
        it('must validate that order fields should be string', function () {
            expect(queryable.orderByDescending,1).to.Throw(/Ordering field must be a valid string/i);
            expect(queryable.orderBy,1).to.Throw(/Ordering field must be a valid string/i);
            
            expect(queryable.orderByDescending,'').to.Throw(/Ordering field must be a valid string/i);
            expect(queryable.orderBy,'').to.Throw(/Ordering field must be a valid string/i);

            expect(queryable.orderByDescending,undefined).to.Throw(/Ordering field must be a valid string/i);
            expect(queryable.orderBy,undefined).to.Throw(/Ordering field must be a valid string/i);
            
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
            queryable.single();
            throw 'Not implemented';
        });
        it('must support toArray', function () {
            throw 'Not implemented';
        });
    });

});

