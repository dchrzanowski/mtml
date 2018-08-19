function Actions(app) {
    this.app = app;
    this.runEntity = require('./actionEntity')(app);
    this.runMeta = require('./actionMeta')(app);
    this.runTemplate = require('./actionTemplate')(app);
    this.runUse = require('./actionUse')(app);
    this.runRender = require('./actionRender')(app);
}

/**
 * Run each individual action
 */
Actions.prototype.runActions = function() {
    this.runEntity.execute();
    this.runMeta.execute();
    this.runTemplate.execute();
    this.runUse.execute();
    this.runRender.execute();
};

module.exports = function(app) {
    return new Actions(app);
};
