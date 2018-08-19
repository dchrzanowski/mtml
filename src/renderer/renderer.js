function Rendered(app) {
    this.app = app;
}

/**
 * Render the given Template
 * @param {String} content - Template as a string
 * @returns {String} Rendered template with EJS
 */
Rendered.prototype.render = function(content) {

    return this.app.ejs.render(
        content,
        {
            // some libs available for EJS
            v: this.app.v,
            _: this.app._,
            // helpers
            h: this.app.h,
            // scenario
            s: this.app.s,
            // shortcut to entity
            e: this.app.s.entity
        },
        {
            delimiter: '$'
        }
    );
};

module.exports = function(app) {
    return new Rendered(app);
};
