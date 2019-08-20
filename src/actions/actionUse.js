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

        // attempt to eval the 'template', 'spawn' and 'if' keys.
        var template = this.app.h.evalOrLeave(each.template);
        var spawn = this.app.h.evalOrLeave(each.spawn);
        var useIf = each.if ? this.app.h.evalOrLeave(each.if, true) : true;
        var useMeta = this.app.h.evalObject(each.meta);

        // assign the 'use' to the scenario under its given name
        this.app.s.use.push({
            template: template,
            spawn: spawn,
            if: useIf,
            relativeTo: each.relativeTo,
            useMeta: useMeta || {},
        });
    }
};

/**
 * Check if the 'use' keys are correct. Must have a 'template' and a 'spawn' key.
 * @param {Object} each - Use object
 */
ActionUse.prototype.checkUseKeys = function(each) {
    var errors = [];

    if (!each.template ||
        !each.spawn)
        errors.push("Each use object must contain a 'template' and a 'spawn' key");

    if (each.relativeTo &&
        !['scenario', 'cwd'].includes(each.relativeTo))
        errors.push("A use object's 'relativeTo' key must be ommited or must be one of 'scenario' or 'cwd'");

    if (errors.length > 0)
        this.app.h.abort(errors.join('\n'));
};

module.exports = function(app) {
    return new ActionUse(app);
};
