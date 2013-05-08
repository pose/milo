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
});

