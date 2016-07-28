'use strict';

var isValid = require('is-valid-app');
var stashObject = require('stash-object');

module.exports = function(config) {
  return function(app) {
    if (!isValid(app, 'base-stash', ['base'])) {
      return;
    }

    var cache = {};
    var stack = {};

    /**
     * Stash an object property from the app with an optional "name".
     *
     * ```js
     * app.stash('options');
     * ```
     * @name .stash
     * @param {String} `prop` Property to stash (e.g. `options` or `cache`);
     * @param {String} `name` Name to use to "tag" the stash to restore from later.
     * @api public
     */

    this.define('stash', function(prop, name) {
      var stash = getStash(prop);
      name = name || 'default';
      pushStack(prop, name);
      stash.stash(name);
      return this;
    });

    /**
     * Restore a previously stashed object. Optionally restore from a specific "name" that was used with `.stash`.
     * When a "name" is not specified, the last stashed object is used.
     *
     * ```js
     * app.restore('options');
     * ```
     * @name .restore
     * @param {String} `prop` Property to restore (e.g. `options` or `cache`);
     * @param {String} `name` Name used when stashing to restore directly to that spot.
     * @api public
     */

    this.define('restore', function(prop, name) {
      var stash = getStash(prop);
      name = popStack(prop, name);
      app[prop] = stash.restore(name);
      return this;
    });

    function getStash(prop) {
      if (typeof app[prop] !== 'object') {
        throw new TypeError(`expected "app.${prop}" to be an object`);
      }
      return cache[prop] = (cache[prop] || stashObject(app[prop]));
    }

    function pushStack(prop, name) {
      stack[prop] = stack[prop] || [];
      stack[prop].push(name);
    }

    function popStack(prop, name) {
      stack[prop] = stack[prop] || [];
      if (!name) {
        name = stack[prop].pop();
      } else if (name === stack[prop][stack[prop].length - 1]) {
        stack[prop].pop();
      }
      return name;
    }
  };
};
