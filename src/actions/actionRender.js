function ActionRender(app) {
    this.app = app;
}

/**
 * Execute 'Use' Action
 */
ActionRender.prototype.execute = function() {

    // iterate through each of the 'use' actions
    for (var each of this.app.s.use) {
        // grab the template for this 'use'
        var template = this.app.s.template[each.template];
        // render the template with EJS
        var renderedTemplate = this.app.renderer.render(template);
        // grab the spawn path
        var spawnPath = each.spawn;

        // save the file relative to the scenario file
        this.app.h.saveFileRelative(spawnPath, renderedTemplate, each.relativeTo);
    }
};

module.exports = function(app) {
    return new ActionRender(app);
};
