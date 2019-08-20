function Rendered(app) {
    this.app = app;
}

/**
 * Render the given Template
 * @param {String} content - Template as a string
 * @returns {String} Rendered template with EJS
 */
Rendered.prototype.render = function(content, useMeta) {
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
            e: this.app.s.entity,
            // shortcut to meta
            m: this.app.s.meta,
            // shortcut to template meta
            um: useMeta,
        },
        {
            delimiter: '$'
        }
    );
};

module.exports = function(app) {
    return new Rendered(app);
};
