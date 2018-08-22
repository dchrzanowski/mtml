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
        this.app.h.abort("Scenario's 'use' key must be an array");

    // iterate through each of the 'use' objects
    for (var each of use) {
        this.checkUseKeys(each);

        // attempt to eval the 'template' and 'spawn' keys.
        var template = this.app.h.evalOrLeave(each.template);
        var spawn = this.app.h.evalOrLeave(each.spawn);
        var relativeTo = this.app.h.evalOrLeave(each.relativeTo) || 'scenario';

        // assign the 'use' to the scenario under its given name
        this.app.s.use.push({
            template: template,
            spawn: spawn,
            relativeTo: relativeTo
        });
    }
};

/**
 * Check if the 'use' keys are correct. Must have a 'template' and a 'spawn' key.
 * @param {Object} use - Use object
 */
ActionUse.prototype.checkUseKeys = function(use) {
    const errors = []
    if (!use.template ||
        !use.spawn)
        errors.push("Each use object must contain a 'template' and a 'spawn' key");
    // if ()
};

module.exports = function(app) {
    return new ActionUse(app);
};
