function ActionUse(app) {
    this.app = app;
}

/**
 * Execute 'Use' Action
 */
ActionUse.prototype.execute = function() {

    this.app.s.use = [];

    var use = this.app.s.rawScenario.use;

    if (!Array.isArray(use))
        this.app.h.abort("Entity's 'use' key must be an array");

    // iterate through each of the 'use' objects
    for (var each of use) {
        this.checkUseKeys(each);

        // attempt to eval the 'template', 'spawn' and 'if' keys.
        var template = this.app.h.evalOrLeave(each.template);
        var spawn = this.app.h.evalOrLeave(each.spawn);
        var useIf = each.if ? this.app.h.evalOrLeave(each.if, true) : true;

        // assign the 'use' to the scenario under its given name
        this.app.s.use.push({
            template: template,
            spawn: spawn,
            if: useIf
        });
    }
};

/**
 * Check if the 'use' keys are correct. Must have a 'template' and a 'spawn' key.
 * @param {Object} use - Use object
 */
ActionUse.prototype.checkUseKeys = function(each) {
    if (!each.template ||
        !each.spawn)
        this.app.h.abort("Each use object must contain a 'template' and a 'spawn' key");

};

module.exports = function(app) {
    return new ActionUse(app);
};
