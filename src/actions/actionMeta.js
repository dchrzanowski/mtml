function ActionMeta(app) {
    this.app = app;
}

/**
 * Execute Meta Action
 */
ActionMeta.prototype.execute = function() {
    var meta = this.app.s.rawScenario.meta;

    if (meta != null && typeof meta === 'object') {

        // if a meta exists try to eval each key of the meta
        for (var key in meta) {
            meta[key] = this.app.h.evalOrLeave(meta[key]);
        }

        // assign the meta to the scenario
        this.app.s.meta = meta;
    }
};

module.exports = function(app) {
    return new ActionMeta(app);
};
