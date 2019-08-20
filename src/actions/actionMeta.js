function ActionMeta(app) {
    this.app = app;
}

/**
 * Execute Meta Action
 */
ActionMeta.prototype.execute = function() {
    var meta = this.app.s.rawScenario.meta;



    // assign the meta to the scenario
    this.app.s.meta = this.app.h.evalObject(meta);

};

module.exports = function(app) {
    return new ActionMeta(app);
};
