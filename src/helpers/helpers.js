function Helpers(app) {
    this.app = app;
}

/**
 * Abort the program's operation
 * @param {String} reason - Reason for termination
 */
Helpers.prototype.abort = function(reason) {
    console.log(this.app.c.red(reason));
    process.exit(0);
};

/**
 * Prompt a user for an answer
 * @param {String} prompt - The prompt to display
 * @returns {String} String entered by the user
 */
Helpers.prototype.askUser = function(prompt) {
    return this.app.readline.question(prompt);
};

/**
 * Load a file relative to the scenario file
 * @param {String} filePath - The path of the file
 * @returns {String} File content
 */
Helpers.prototype.loadFileRelative = function(filePath) {
    // join the given path with the scenario's path
    filePath = this.joinPath(this.app.s.path, filePath);

    return this.loadFile(filePath);
};

/**
 * Load a file
 * @param {String} filePath - The path of the file
 * @returns {String} File content
 */
Helpers.prototype.loadFile = function(filePath) {

    try {
        // read the file
        return this.app.fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        this.abort("File read error: " + e);
    }
};

/**
 * Save a file relative to the scenario file
 * @param {String} filePath - The path of the file
 * @param {String} content - Textual representation of the file
 */
Helpers.prototype.saveFileRelative = function(filePath, content) {
    // join the given path with the scenario's path
    filePath = this.joinPath(this.app.s.path, filePath);

    this.saveFile(filePath, content);
};

/**
 * Save a file
 * @param {String} filePath - The path of the file
 * @param {String} content - Textual representation of the file
 */
Helpers.prototype.saveFile = function(filePath, content) {

    try {
        if (!this.app.settings.dryRun) {
            // make dirs if necessary
            this.app.mkdirp.sync(this.app.path.dirname(filePath));
            // write file
            this.app.fs.writeFileSync(filePath, content);
        }

        console.log(this.app.c.green.bold("File saved at: ") + this.app.c.underline(filePath));
    } catch (e) {
        this.abort("File save error: " + e);
    }
};

/**
 * Get a command line argument
 * @param {Number} arg - Number of the command line argument, e.g. in the CLI command 'mtml hello', 'hello' is arg 0
 * @returns {String} Textual representation of the argument
 */
Helpers.prototype.getArg = function(arg) {
    var errorMsg = "Argument " + arg + ", not provided from the command line";

    if (arg === 0)
        errorMsg = "Scenario file not provide from the command line";

    try {
        var result = process.argv[arg + 2]; // do not count the first two indices
        if (result)
            return result;
        else
            this.abort(errorMsg);
    } catch (e) {
        this.abort(errorMsg);
    }
};

/**
 * Joing two path together
 * @param {String} a - Path a
 * @param {String} b - Path b
 * @returns {String} Joined path
 */
Helpers.prototype.joinPath = function(a, b) {
    try {
        return this.app.path.join(a, b);
    } catch (e) {
        this.abort("Could not join paths: " + a + ", and " + b);
    }
};

/**
 * Attempt to evalute a value
 * @param {String} value - Value to be eval'ed
 */
Helpers.prototype.evalOrLeave = function(value) {

    // make some app libs available for eval (for ease of use);
    var v = this.app.v;
    var _ = this.app._;
    // helpers
    var h = this.app.h;
    // make the scenario available
    var s = this.app.s;
    // make a shortcut for the entity itself
    var e = this.app.s.entity;

    try {
        return eval(value);
    } catch (e) {
        return value;
    }
};

module.exports = function(app) {
    return new Helpers(app);
};
