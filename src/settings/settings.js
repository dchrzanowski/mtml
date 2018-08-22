function Settings(app) {
    this.app = app;
    this.dryRun = false;
    this.debug = false;

    this.hasDryRun();
    this.hasDebug();
    this.hasBaseDir();
}

/**
 * Check if dry run is necessary
 */
Settings.prototype.hasDryRun = function() {
    var idx = process.argv.indexOf('--dry-run');

    if (idx != -1) {
        this.dryRun = true;
        process.argv.splice(idx, 1);
    }
};

/**
 * Check whether to provide debug data
 */
Settings.prototype.hasDebug = function() {
    var idx = process.argv.indexOf('--debug');

    if (idx != -1) {
        this.debug = true;
        process.argv.splice(idx, 1);
    }
};

/**
 * Check whether to you a different base directory
 */
Settings.prototype.hasBaseDir = function() {
    var idx = process.argv.indexOf('--base-dir');

    if (idx != -1) {
        var args = process.argv.splice(idx, 2);
        this.basedir = this.app.path.join(process.cwd(), args[1]);
    } else {
        this.basedir = process.cwd();
    }
};

module.exports = function(app) {
    return new Settings(app);
};
