describe('Serialization', function () {
    var defaultSerializer;
    beforeEach(function () {
        defaultSerializer = Milo.DefaultSerializer.create();
        window.API = Milo.API.create();
        
        API.Dog = Milo.Model.extend({
            name: Milo.property('string'),
            age: Milo.property('number'),
            likesCats: Milo.property('boolean'),
            favoriteFoods: Milo.property('array')
        });

        API.Book = Milo.Model.extend({
            id: Milo.property('number'),
            name: Milo.property('string'),
            authors: Milo.collection('API.Author', {embedded: true})
        });

        API.Author = Milo.Model.extend({
            id: Milo.property('number'),
            name: Milo.property('string')
        });

    });

    afterEach(function () {
        defaultSerializer = undefined;
        window.API = undefined;
    });
    it('should fail when using an invalid model', function () {
        // Act
        var dogSerializer = defaultSerializer.serializerFor(API.Dog);
        
        // Assert
        (function () {
            dogSerializer.serialize({name: 'Milo', age: 10});
        }).should.Throw(/Error serializing instance/i);
        (function () {
            dogSerializer.serialize(undefined);
        }).should.Throw(/Error serializing instance/i);
    });

    it('should allow serialization of simple models', function () {
        // Arrange
        var dogSerializer, dogData = {name: 'Milo', age: 10, likesCats: true, 
            favoriteFoods: ['chicken', 'rice', 'pork']},
            dog = API.Dog.create(dogData),
            jsonDog;

        // Act
        dogSerializer = defaultSerializer.serializerFor(API.Dog);
        jsonDog = dogSerializer.serialize(dog);

        // Asser
        jsonDog.should.be.deep.equal(dogData);
    });
    it('should allow serialization of nested entities', function () {
        // Arrange
        var bookSerializer, jsonBook, bookData = [{
                id: 1,
                name: 'A Study in Scarlet',
                authors: [{id: 9, name: 'Sir Arthur Conan Doyle'}]
            }],
            book = API.Book.create(bookData.map(function (book) {
                book = JSON.parse(JSON.stringify(book));
                book.authors = Em.A(book.authors.map(function (author) {
                    return API.Author.create(author);
                }));
                return book;
            })[0]);
        bookData = bookData[0];

        // Act 
        bookSerializer = defaultSerializer.serializerFor(API.Book);
        jsonBook = bookSerializer.serialize(book);

        // Assert
        // XXX Hack because it does not work with deepEqual
        JSON.stringify(jsonBook).should.be.deep.equal(JSON.stringify(bookData));
    });

    it('should allow deserialization of a basic entity', function () {
        // Arrange
        var dog, dogSerializer = defaultSerializer.serializerFor(API.Dog), favoriteFoods;
        
        // Act
        dog = dogSerializer.deserialize({age: 8, name: 'Dinamita', likesCats: false,
            favoriteFoods: ['asado', 'empanadas', 'seafood']});

        // Assert
        dog.should.be.ok;
        dog.get('age').should.be.equal(8);
        dog.get('name').should.be.equal('Dinamita');
        dog.get('likesCats').should.be.equal(false);
        favoriteFoods = dog.get('favoriteFoods');
        favoriteFoods.length.should.be.equal(3);
        favoriteFoods[0].should.be.equal('asado');
        favoriteFoods[1].should.be.equal('empanadas');
        favoriteFoods[2].should.be.equal('seafood');
    });
    
    it('should allow deserialization of nested entities', function () {
        // Arrange
        var book, bookSerializer, authors;

        // Act 
        bookSerializer = defaultSerializer.serializerFor(API.Book);
        book = bookSerializer.deserialize({
                id: 1,
                name: 'A Study in Scarlet',
                authors: [{id: 9, name: 'Sir Arthur Conan Doyle'}]
            });

        // Assert
        book.should.be.ok;
        book.get('id').should.be.equal(1);
        book.get('name').should.be.equal('A Study in Scarlet');
        authors = book.get('authors');
        authors.length.should.be.equal(1);
        authors[0].get('name').should.be.equal('Sir Arthur Conan Doyle');
        authors[0].get('id').should.be.equal(9);
    });

});
