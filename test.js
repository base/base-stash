'use strict';

require('mocha');
var assert = require('assert');
var stash = require('./');
var Base = require('base');
var app;

describe('base-stash', function() {
  beforeEach(function() {
    app = new Base();
    app.use(stash());
  });

  describe('plugin', function() {
    it('should export a function', function() {
      assert.equal(typeof stash, 'function');
    });

    it('should expose a .stash method', function() {
      assert.equal(typeof app.stash, 'function');
    });

    it('should expose a .restore method', function() {
      assert.equal(typeof app.restore, 'function');
    });
  });

  describe('.stash', function() {
    it('should stash app.options', function() {
      app.options.foo = 'bar'
      assert.deepEqual(app.options, {foo: 'bar'});

      app.stash('options');
      assert.deepEqual(app.options, {foo: 'bar'});

      app.options.foo = 'baz';
      assert.deepEqual(app.options, {foo: 'baz'});
    });

    it('should stash app.options using a custom name', function() {
      app.options.foo = 'bar'
      assert.deepEqual(app.options, {foo: 'bar'});

      app.stash('options', 'foo');
      assert.deepEqual(app.options, {foo: 'bar'});

      app.options.foo = 'baz';
      assert.deepEqual(app.options, {foo: 'baz'});

      app.stash('options', 'bar');
      assert.deepEqual(app.options, {foo: 'baz'});

      app.options.bar = 'qux';
      assert.deepEqual(app.options, {foo: 'baz', bar: 'qux'});
    });
  });

  describe('.restore', function() {
    it('should restore stashed app.options', function() {
      // initial state
      app.options.foo = 'bar'
      assert.deepEqual(app.options, {foo: 'bar'});

      // stash the current state where `foo === 'bar'`
      app.stash('options');
      assert.deepEqual(app.options, {foo: 'bar'});

      // change `foo = 'baz'`
      app.options.foo = 'baz';
      assert.deepEqual(app.options, {foo: 'baz'});

      // restore the stashed state to `foo === 'bar'`
      app.restore('options');
      assert.deepEqual(app.options, {foo: 'bar'});
    });

    it('should restore stashed app.options from a custom name', function() {
      // initial state
      app.options.foo = 'bar'
      assert.deepEqual(app.options, {foo: 'bar'});

      // stash the current state where `foo === 'bar'`
      app.stash('options', 'foo');
      assert.deepEqual(app.options, {foo: 'bar'});

      // change `foo = 'baz'`
      app.options.foo = 'baz';
      assert.deepEqual(app.options, {foo: 'baz'});

      // stash the current state where `foo === 'baz'`
      app.stash('options', 'bar');
      assert.deepEqual(app.options, {foo: 'baz'});

      // add a new property `bar = 'qux'`
      app.options.bar = 'qux';
      assert.deepEqual(app.options, {foo: 'baz', bar: 'qux'});

      // restore the "foo" state when `foo === 'bar'`
      app.restore('options', 'foo');
      assert.deepEqual(app.options, {foo: 'bar'});

      // restore the "bar" state when `foo === 'baz' && bar === undefined`
      app.restore('options', 'bar');
      assert.deepEqual(app.options, {foo: 'baz'});
    });

    it('should restore stashed app.options from multiple stash calls', function() {
      // initial state
      app.options.foo = 'bar'
      assert.deepEqual(app.options, {foo: 'bar'});

      // stash the current state where `foo === 'bar'`
      app.stash('options');
      assert.deepEqual(app.options, {foo: 'bar'});

      // change `foo = 'baz'`
      app.options.foo = 'baz';
      assert.deepEqual(app.options, {foo: 'baz'});

      // stash the current state where `foo === 'baz'`
      app.stash('options');
      assert.deepEqual(app.options, {foo: 'baz'});

      // change `foo = 'qux'`
      app.options.foo = 'qux';
      assert.deepEqual(app.options, {foo: 'qux'});

      // restore the `options` to the previously stashed state when `foo === 'baz'`
      app.restore('options');
      assert.deepEqual(app.options, {foo: 'baz'});

      // restore the `options` to the previously stashed state when `foo === 'bar'`
      app.restore('options');
      assert.deepEqual(app.options, {foo: 'bar'});
    });

    it('should restore the previously stashed state when the name is not given', function() {
      // initial state
      app.options.foo = 'bar'
      assert.deepEqual(app.options, {foo: 'bar'});

      // stash the current state where `foo === 'bar'`
      app.stash('options', 'before something');
      assert.deepEqual(app.options, {foo: 'bar'});

      // change `foo = 'baz'`
      app.options.foo = 'baz';
      assert.deepEqual(app.options, {foo: 'baz'});

      // stash the current state where `foo === 'baz'`
      app.stash('options', 'after something');
      assert.deepEqual(app.options, {foo: 'baz'});

      // change `foo = 'qux'`
      app.options.foo = 'qux';
      assert.deepEqual(app.options, {foo: 'qux'});

      // restore the `options` to the previously stashed state when `foo === 'baz'`
      app.restore('options');
      assert.deepEqual(app.options, {foo: 'baz'});

      // restore the `options` to the previously stashed state when `foo === 'bar'`
      app.restore('options');
      assert.deepEqual(app.options, {foo: 'bar'});
    });

    it('should restore the previously stashed state when the name is not given and multiple properties are used', function() {
      // initial state
      app.options.foo = 'bar'
      app.cache.foo = 'FOO';
      assert.deepEqual(app.options, {foo: 'bar'});
      assert.deepEqual(app.cache, {foo: 'FOO'});

      // stash the current options state where `foo === 'bar'`
      app.stash('options', 'before something');
      assert.deepEqual(app.options, {foo: 'bar'});

      // stash the current cache state where `foo === 'FOO'`
      app.stash('cache', 'before something');
      assert.deepEqual(app.cache, {foo: 'FOO'});

      // change options `foo = 'baz'`
      app.options.foo = 'baz';
      assert.deepEqual(app.options, {foo: 'baz'});

      // change cache `foo = 'BAZ'`
      app.cache.foo = 'BAZ';
      assert.deepEqual(app.cache, {foo: 'BAZ'});

      // stash the current options state where `foo === 'baz'`
      app.stash('options', 'after something');
      assert.deepEqual(app.options, {foo: 'baz'});

      // stash the current cache state where `foo === 'BAZ'`
      app.stash('cache', 'after something');
      assert.deepEqual(app.cache, {foo: 'BAZ'});

      // change options `foo = 'qux'`
      app.options.foo = 'qux';
      assert.deepEqual(app.options, {foo: 'qux'});

      // change cache `foo = 'QUX'`
      app.cache.foo = 'QUX';
      assert.deepEqual(app.cache, {foo: 'QUX'});

      // restore the `options` to the previously stashed options state when `foo === 'baz'`
      app.restore('options');
      assert.deepEqual(app.options, {foo: 'baz'});

      // restore the `cache` to the previously stashed cache state when `foo === 'BAZ'`
      app.restore('cache');
      assert.deepEqual(app.cache, {foo: 'BAZ'});

      // restore the `options` to the previously stashed options state when `foo === 'bar'`
      app.restore('options');
      assert.deepEqual(app.options, {foo: 'bar'});

      // restore the `cache` to the previously stashed cache state when `foo === 'FOO'`
      app.restore('cache');
      assert.deepEqual(app.cache, {foo: 'FOO'});
    });
  });
});
