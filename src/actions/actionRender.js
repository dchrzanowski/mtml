function ActionRender(app) {
    this.app = app;
}

/**
 * Execute 'Use' Action
 */
ActionRender.prototype.execute = function() {

    // iterate through each of the 'use' actions
    for (var each of this.app.s.use) {
        // grab the spawn path
        var spawnPath = each.spawn;

        // is the 'use' supposed to be spawned?
        if (each.if) {
            // grab the template for this 'use'
            var template = this.app.s.template[each.template];
            // render the template with EJS
            var renderedTemplate = this.app.renderer.render(template);

            // save the file relative to the scenario file
            this.app.h.saveFileRelative(spawnPath, renderedTemplate);
        } else {
            // Inform of skipping
            console.log(this.app.c.yellow.bold("Skipping: ") + spawnPath);
        }
    }
};

module.exports = function(app) {
    return new ActionRender(app);
};
