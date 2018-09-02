function Scenario(app) {
    this.app = app;

    this.path = null;
    this.fileName = null;
    this.rawScenario = {};
    this.entity = null;
    this.meta = null;
    this.template = null;
    this.use = null;
}

/**
 * Set the scenario path and the scenario file name
 */
Scenario.prototype.scenarioSetPaths = function () {
    var executionPath = this.app.settings.baseDir;
    this.fileName = this.app.h.getArg(0);

    var path = this.app.h.joinPath(executionPath, this.fileName);

    if (this.app.fs.existsSync(path)) {
        this.fileName = this.app.path.basename(path);
        this.path = this.app.path.dirname(path);

    } else {
        this.app.h.abort("Could not locate scenario file: " + path);
    }
};

/**
 * Load the scenario file
 * @returns {JSON} Scenario as a JSON object
 */
Scenario.prototype.scenarioLoad = function() {
    this.scenarioSetPaths();

    try {
        var path = this.app.h.joinPath(this.path, this.fileName);

        // get the file
        var content = this.app.h.loadFile(path);
        content = JSON.parse(content);

        // check mandatory keys presence
        this.checkKeys(content);

        // assign JSON file attributes to the Scenario
        Object.assign(this.rawScenario, content);

    } catch (e) {
        this.app.h.abort("Error while loading scenario file: " + e);
    }
};

/**
 * Check for presence of mandatory keys in the scenario JSON
 * @param {JSON} content - Scenario JSON object
 */
Scenario.prototype.checkKeys = function(content) {
    var errMsg = '';

    if (!content.entity)
        errMsg += "No 'entity' key in the scenario file\n";

    if (!content.template)
        errMsg += "No 'template' key in the scenario file\n";

    if (!content.use)
        errMsg += "No 'use' key in the scenario file\n";

    if (errMsg)
        this.app.h.abort(errMsg);
};

module.exports = function(app) {
    return new Scenario(app);
};
