module.exports = function(Handlebars) {
  Handlebars.registerHelper('date', (function() {
    var date = new Date();
    return function(options) {
      return date.toString();
    };
  })());
};