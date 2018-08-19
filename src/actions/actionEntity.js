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
        this.executeJSON(entity.json);

    } else if (entity.parser) {
        // Parser method option in the scenario file
        this.executeParser(entity.parser);
    }
};

/**
 * Execute the 'json' Entity Action type
 * @param {String} content - String to be evaled or left alone
 */
ActionEntity.prototype.executeJSON = function(json) {
    // check if the path can be evaled
    var filePath = this.app.h.evalOrLeave(json);

    // load the file
    var content = this.app.h.loadFileRelative(filePath);

    // parse it and assign to the scenario
    this.app.s.entity = JSON.parse(content);
};

/**
 * Execute the 'parser' Entity Action type
 * @param {Object} parser - Object that containt the parser file location and the data file location
 */
ActionEntity.prototype.executeParser = function(parser) {

    this.checkParserKeys(parser);

    // get the parser's path
    var parserPath = this.app.h.joinPath(this.app.s.path, parser.file);

    // require the parser
    var parsingMethod = require(parserPath);

    // get the data file
    var dataFile = this.app.h.loadFileRelative(parser.data);

    // use the parser on the data file and assign to the scenario
    this.app.s.entity = parsingMethod(dataFile);
};

/**
 * Check if entity keys exists and that they are correct. Must have a 'json', 'here' or 'parser' key.
 * @param {Object} entity - Entity object
 */
ActionEntity.prototype.checkEntityKeys = function(entity) {

    var keys = Object.keys(entity);

    if (keys.length > 1) {
        this.app.h.abort("Entity can have only one key: 'json', 'here' or 'parser'");
    }

    if (!(keys.includes('json') ||
          keys.includes('here') ||
          keys.includes('parser')))

        this.app.h.abort("Entity must have a 'json', 'here' or 'parser' key");
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
