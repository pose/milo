var App = require('app');

App.IndexView = Ember.View.extend({
    templateName: 'index',
    isShowingInTheaters: true,
    isShowingUpcoming: false,
    isShowingBoxOffice: false,

    showInTheaters: function () {
        this.get('controller').filter({
            type: 'theaters'
        });

        this.set('isShowingInTheaters', true);
        this.set('isShowingUpcoming', false);
        this.set('isShowingBoxOffice', false);
    },

    showUpcoming: function () {
        this.get('controller').filter({
            type: 'upcoming'
        });

        this.set('isShowingInTheaters', false);
        this.set('isShowingUpcoming', true);
        this.set('isShowingBoxOffice', false);
    },

    showBoxOffice: function () {
        this.get('controller').filter({
            type: 'box'
        });

        this.set('isShowingInTheaters', false);
        this.set('isShowingUpcoming', false);
        this.set('isShowingBoxOffice', true);
    },

    keyPress: function (e) {
        if (e.keyCode === 13) {
            this.get('controller').filter({
                q: $(e.target).val()
            });

            this.set('isShowingInTheaters', false);
            this.set('isShowingUpcoming', false);
            this.set('isShowingBoxOffice', false);
        }
    }
});

module.exports = App.IndexView;