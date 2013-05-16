// ===== Namespace =====
var App = require('app');

// ===== Milo JS =====
var Api = Milo.API.create();

Api.options('baseUrl', 'http://localhost:3000/api');

window.Api = Api;

// ===== Router =====
App.Router.map(function () {});

// ===== Routes =====
require('routes');

// ===== Data =====
require('data');

// ===== Models =====
require('models');

// ===== Views =====
require('views')

// ===== Controllers =====
require('controllers');

// ===== Helpers =====
require('helpers');

// ===== Templates =====
require('templates');