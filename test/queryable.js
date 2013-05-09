// XXX Can I order by unexisting fields? Yes, we can't check that

describe('Queryable', function () {
    var queryable = Em.Object.extend(Milo.Queryable, {}).create();


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
        (function() {
            queryable.orderByDescending(1);
        }).should.Throw(/Ordering field must be a valid string/i);
        (function() {
            queryable.orderBy(1);
        }).should.Throw(/Ordering field must be a valid string/i);
        
        (function() {
            queryable.orderByDescending('');
        }).should.Throw(/Ordering field must be a valid string/i);
        (function() {
            queryable.orderBy('');
        }).should.Throw(/Ordering field must be a valid string/i);

        (function() {
            queryable.orderByDescending(undefined);
        }).should.Throw(/Ordering field must be a valid string/i);
        (function() {
            queryable.orderBy(undefined);
        }).should.Throw(/Ordering field must be a valid string/i);
        
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
            (function() {
                queryable.take( -14);
            }).should.Throw(/invalid index/i);
            (function() {
                queryable.take( 'hello');
            }).should.Throw(/invalid index/i);
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
            (function() {
                queryable.skip( -4);
            }).should.Throw(/invalid index/i);
            (function() {
                queryable.skip( 'bar');
            }).should.Throw(/invalid index/i);
        });
    });
});

