/**
 * Load libraries
 * @param {Object} app - Main app object
 */
function loadLibs(app) {

    // core packages
    app.ejs = require('ejs');
    app.mkdirp = require('mkdirp');
    app.readline = require('readline-sync');
    app.fs = require('fs');
    app.path = require('path');
    app.c = require('chalk');
    // packages injected into ejs and eval
    app.v = require('voca');
    app._ = require('lodash');
    // scenario (also injected)
    app.s = require('./scenario/scenario.js')(app);
    // helpers (also injected)
    app.h = require('./helpers/helpers.js')(app);

    // renderer
    app.renderer = require('./renderer/renderer.js')(app);

    // actions
    app.actions = require('./actions/actions.js')(app);

    // settings
    app.settings = require('./settings/settings.js')(app);

    // debug
    app.debug = require('./debug/debug.js')(app);
}

/**
 * Main init point
 */
var main = function () {
    const app = {};

    loadLibs(app);

    app.s.scenarioLoad();
    app.actions.runActions();
    app.debug.display();
};

exports.main = main;
