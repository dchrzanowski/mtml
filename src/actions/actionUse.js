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
        each.relativeTo = each.relativeTo || 'scenario';
        this.checkUseKeys(each);

        // attempt to eval the 'template' and 'spawn' keys.
        var template = this.app.h.evalOrLeave(each.template);
        var spawn = this.app.h.evalOrLeave(each.spawn);

        // assign the 'use' to the scenario under its given name
        this.app.s.use.push({
            template: template,
            spawn: spawn,
            relativeTo: each.relativeTo
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

    if (use.relativeTo &&
        !['scenario', 'process'].includes(use.relativeTo))
        errors.push("A use object's 'relativeTo' key must be one of 'scenario' or 'process'");

    if (errors.length > 0)
        this.app.h.abort(errors.join('\n'));
};

module.exports = function(app) {
    return new ActionUse(app);
};
