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

        // check if we should use it by checking if there is no condition or if the eval of the condition gives true
        const shouldUse = !each.condition || this.app.h.evalOrAbort(
            'Each use object\'s \'condition\' key must be eval-able or omitted',
            each.condition
        );

        if (shouldUse) {
            // attempt to eval the 'template' and 'spawn' keys.
            var template = this.app.h.evalOrLeave(each.template);
            var spawn = this.app.h.evalOrLeave(each.spawn);

            // assign the 'use' to the scenario under its given name
            this.app.s.use.push({
                template: template,
                spawn: spawn
            });
        }
    }
};

/**
 * Check if the 'use' keys are correct. Must have a 'template' and a 'spawn' key.
 * @param {Object} use - Use object
 */
ActionUse.prototype.checkUseKeys = function(use) {
    if (!use.template ||
        !use.spawn)
        this.app.h.abort("Each use object must contain a 'template' and a 'spawn' key");
};

module.exports = function(app) {
    return new ActionUse(app);
};
