Milo.Model = Em.Object.extend(Milo.Queryable, {
    meta: Milo.property('string'),

    data: function () {
        if (!this.get('_data')) {
            this.set('_data', Em.A());
        }

        return this.get('_data');
    }.property(),

    rollback: function () {
        this.get('data').forEach(function (element) {
            this.set(element.key, element.orig);
        }.bind(this));

        this.set('isDirty', false);
    }
});

Milo.Model.reopenClass({
    find: function (clause) {
        return this.create().find(clause);
    }
});