'use strict';

// Use this to configure whether to run the queries from a local source or from production:
var process = 'PROD';  // use PROD for production settings

// Bluebird is the best promise library available today,
// and is the one recommended here:
var promise = require('bluebird');

// Loading all the database repositories separately,
// because event 'extend' is called multiple times:
var repos = {
    questions: require('./repos/questions')
};

// Loading database configuration information
if (process == "DEV") {
  var config = require('../config/config').dev
} else {
  var config = require('../config/config').prod
}

// pg-promise initialization options:
var options = {

    // Use a custom promise library, instead of the default ES6 Promise:
    promiseLib: promise,
    
    // Extending the database protocol with our custom repositories:
    extend: obj => {
        // 1. Do not use 'require()' here, because this event occurs for every task
        //    and transaction being executed, which should be as fast as possible.
        // 2. We pass in `pgp` in case it is needed when implementing the repository;
        //    for example, to access namespaces `.as` or `.helpers`
        obj.questions = repos.questions(obj, pgp);
    }

};

// Database connection parameters:
var config = {
    host      : config.host,
    port      : config.port,
    database  : config.database,
    user      : config.user,
    password  : config.password,
    ssl       : config.ssl
};

// Load and initialize pg-promise:
var pgp = require('pg-promise')(options);

// Create the database instance:
var db = pgp(config);

// Load and initialize all the diagnostics:
var diag = require('./diagnostics');
diag.init(options);

// If you ever need to change the default pool size, here's an example:
// pgp.pg.defaults.poolSize = 20;

module.exports = {

    // Library instance is often necessary to access all the useful
    // types and namespaces available within the library's root:
    pgp,

    // Database instance. Only one instance per database is needed
    // within any application.
    db
};
