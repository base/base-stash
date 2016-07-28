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

    this.define('stash', function(prop, name) {
      var stash = getStash(prop);
      name = name || 'default';
      pushStack(prop, name);
      stash.stash(name);
      return this;
    });

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
