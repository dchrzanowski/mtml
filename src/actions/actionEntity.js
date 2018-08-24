function ActionEntity(app) {
    this.app = app;
}

/**
 * Execute 'Entity' Action
 */
ActionEntity.prototype.execute = function() {
    var entity = this.app.s.rawScenario.entity;

    // check if entity keys are valid
    this.checkEntityKeys(entity);

    if (entity.here) {
        // raw entity in the scenario file, assign it directly to the scenario
        this.app.s.entity = entity.here;

    } else if (entity.json) {
        // JSON file path in the the scenario file
        this.executeJSON(entity.json, entity.relativeTo);

    } else if (entity.parser) {
        // Parser method option in the scenario file
        this.executeParser(entity.parser, entity.relativeTo);
    }
};

/**
 * Execute the 'json' Entity Action type
 * @param {String} content - String to be evaled or left alone
 */
ActionEntity.prototype.executeJSON = function(json, relativeTo) {
    // check if the path can be evaled
    var filePath = this.app.h.evalOrLeave(json);

    // load the file
    var content = this.app.h.loadFileRelative(filePath, relativeTo);

    // parse it and assign to the scenario
    this.app.s.entity = JSON.parse(content);
};

/**
 * Execute the 'parser' Entity Action type
 * @param {Object} parser - Object that containt the parser file location and the data file location
 */
ActionEntity.prototype.executeParser = function(parser, relativeTo) {

    this.checkParserKeys(parser);

    // get the parser's path
    var parserPath = this.app.h.joinPath(this.app.s.path, parser.file);

    // require the parser
    var parsingMethod = require(parserPath);

    // get the data file
    var dataFile = this.app.h.loadFileRelative(parser.data, relativeTo);

    // use the parser on the data file and assign to the scenario
    this.app.s.entity = parsingMethod(dataFile);
};

/**
 * Check if entity keys exists and that they are correct. Must have a 'json', 'here' or 'parser' key.
 * @param {Object} entity - Entity object
 */
ActionEntity.prototype.checkEntityKeys = function(entity) {

    var keys = Object.keys(entity);
    var errors = [];

    if (!(keys.includes('json') ||
          keys.includes('here') ||
          keys.includes('parser')))
        errors.push("Entity must have a 'json', 'here' or 'parser' key");

    if (entity.relativeTo &&
        !['scenario', 'cwd'].includes(entity.relativeTo))
        errors.push("Entity's 'relativeTo' key must be ommited or must be one of 'scenario' or 'cwd'");

    if (errors.length > 0)
        this.app.h.abort(errors.join('\n'));
};

/**
 * Check parser key and its correctness. Must have a 'file' and a 'data' key.
 * @param {Object} parser - Parser object.
 */
ActionEntity.prototype.checkParserKeys = function(parser) {
    if (!parser.file ||
        !parser.data)
        this.app.h.abort("Entity's 'parser' key must have a 'file' and a 'data' key");
}

module.exports = function(app) {
    return new ActionEntity(app);
};
