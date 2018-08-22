function ActionTemplate(app) {
    this.app = app;
}

/**
 * Execute 'Template' Action
 */
ActionTemplate.prototype.execute = function() {
    this.app.s.template = {};

    var templates = this.app.s.rawScenario.template;

    if (!Array.isArray(templates))
        this.app.h.abort("Entity's 'template' key must be an array");

    // iterate through each of the template objects
    for (var each of templates) {
        each.relativeTo = each.relativeTo || 'scenario'
        this.checkTemplateKeys(each);

        // attempt to eval the 'from' and 'name' keys.
        var from = this.app.h.evalOrLeave(each.from);
        var name = this.app.h.evalOrLeave(each.name);

        // load the template file
        var templateFile = this.app.h.loadFileRelative(from, each.relativeTo);

        // assign the template to the scenario under its given name
        this.app.s.template[name] = templateFile;
    }
};

/**
 * Check if the 'template' keys are correct. Must have a 'name' and a 'from' key.
 * @param {Object} template - Template object
 */
ActionTemplate.prototype.checkTemplateKeys = function(template) {
    var erros = []
    if (!template.name ||
        !template.from)
        erros.push("Each template object must contain a 'name' and a 'from' key");

    if (template.relativeTo &&
        !['scenario', 'process'].includes(template.relativeTo))
        erros.push("A template object's 'relativeTo' key must be one of 'scenario' or 'process'");

    if (erros.length > 0)
        this.app.h.abort(erros.join('\n'));
};

module.exports = function(app) {
    return new ActionTemplate(app);
};
