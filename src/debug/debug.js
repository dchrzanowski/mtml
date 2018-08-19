function Debug(app) {
    this.app = app;
}

/**
 * Display debug data
 */
Debug.prototype.display = function() {

    if (this.app.settings.debug) {
        console.log(this.app.c.bgRed("---- entity ----\n"), this.app.s.entity);
        console.log(this.app.c.bgRed("\n---- template ----\n"), this.app.s.template);
        console.log(this.app.c.bgRed("\n---- use ----\n"), this.app.s.use);
        console.log(this.app.c.bgRed("\n---- meta ----\n"), this.app.s.meta);
        console.log(this.app.c.bgRed("\n---- argv ----\n"), process.argv);
    }
};

module.exports = function(app) {
    return new Debug(app);
};
