/**
 * @license MIT
 * taksim.io/emitter v0.2.2
 * https://github.com/taksim-io/emitter
 * Copyright (c) 2015 taksim.io
*/

;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // Set up for AMD loader
    define(factory);
  } else if (typeof exports === 'object') {
    // Set up for CommonJS (Node.js, Browserify) loader
    module.exports = factory(root);
  } else {
    // Set up for browser's window
    var Emitter = factory(root);

    // If "Emitter" key is already used, don't attach factory to the window global.
    root.Emitter || (root.Emitter = Emitter);

    // In case of different "Emitter" is available on global,
    // use "taksim" namespace to access factory.
    root.taksim || (root.taksim = {});
    root.taksim.Emitter = Emitter;
  }
})(this, function() {

  'use strict';

  // A unique id that can be increased 1 by calling _tid() method, so that,
  // if necessary any new instance of Emitter or its subclasses
  // will have a unique id within the current session.
  // Especially useful for temporary DOM ids.
  var uniqueId = 1;

  // A namespace to be used for Emitter's internal variables.
  // Instead of attaching these variables directly on "this" instance, it's
  // better to use something like "this._t[namespace]" to prevent conflicts with
  // internal variables of subclasses. Less variable noise on "this" instance is
  // also good for debugging.
  var namespace = 'emitter';

  // Cache prototype of Emitter constructor.
  var proto = TaksimEmitter.prototype;

  /**
   * Initialize a new `Emitter`.
   *
   * @param {Object} obj
   * @return {Object}
   */
  function TaksimEmitter(obj) {
    if (obj) {
      return mixin(obj, proto);
    }
  }

  /**
   * Emits `event` and passes all arguments to the listener callbacks.
   * Please not that this method is not chainable. It always returns the
   * last registered callback's returned value.
   *
   * @param {String} event
   * @param {Mixed} ...
   * @return {Mixed} Returns the last registered callback's returned value.
   */
  proto.emit = function(event) {
    // Get listeners
    var on = _t(this).listeners;

    // Get arguments to be passed to listeners.
    var args = [].slice.call(arguments, 1);

    // Cache result to be returned.
    var result;

    // Check if supplied event name was registered before.
    if (on && on[event]) {

      // Get listeners to be called
      var callbacks = on[event];

      // Check if the listener is registered by `only` method.
      // If so, directly trigger it.
      if (typeof callbacks === 'function') {
        result = callbacks.apply(this, args);
      }
      else {
        // Trigger all listeners one by one.
        var len = callbacks.length;
        callbacks = callbacks.slice();
        for (var i = 0; i < len; i++) {
          result = callbacks[i].apply(this, args);

          // If a listener returns `false`,
          // break the loop and cancel remaining calls.
          if (result === false) {
            break;
          }
        }
      }
    }
    return result;
  };

  /**
   * Registers an event name and its listener.
   *
   * @param {String} event
   * @param {Function} callback
   * @return {Emitter}
   */
  proto.on = function(event, callback) {
    if (typeof event === 'object') {
      // Support object registerers.
      eachEvent(this, 'on', event);
    }
    else if (typeof callback === 'function') {
      // Support multiple event names separated by a space.
      var events = event.split(' ');
      var i = events.length;

      // Get listeners (set it for the first register attempt).
      var t = _t(this);
      var on = t.listeners;
      on || (on = t.listeners = {});

      // Loop on events
      while (i--) {
        var e = events[i];

        // Check if an event was registered by `only` method.
        // If so do not register listener.
        if (typeof on[e] !== 'function') {
          // Register event and listener.
          on[e] || (on[e] = []);
          on[e].push(callback);
        }
      }
    }
    return this;
  };

  /**
   * Triggers the listener once and unregisters it after the first `emit` call.
   *
   * @param {String} event
   * @param {Function} callback
   * @return {Emitter}
   */
  proto.once = function(event, callback) {
    if (typeof event === 'object') {
      // Support object registerers.
      eachEvent(this, 'once', event);
    }
    else if (typeof callback === 'function') {
      // Support multiple event names separated by a space.
      var events = event.split(' ');
      var i = events.length;

      // Loop on events
      while (i--) {
        this.on(event, once(this, events[i], callback));
      }
    }
    return this;
  };

  function once(ctx, event, callback) {
    // Decorate listener to remove itself after first trigger.
    return function before() {
      ctx.off(event, before);
      callback.apply(ctx, arguments);
    };
  }

  /**
   * Registers the callback function only once for an event and unlike
   * `on` and `once` methods you can use callback's returned value safely.
   * Any new register attempt for the same event name is omitted and because
   * there is only one callback to be fired, this method performs better
   * than the `on` method.
   *
   * @param {String} event
   * @param {Function} callback
   * @return {Emitter}
   */
  proto.only = function(event, callback) {
    if (typeof event === 'object') {
      // Support object registerers.
      eachEvent(this, 'only', event);
    }
    else if (typeof callback === 'function') {
      // Support multiple event names separated by a space.
      var events = event.split(' ');
      var i = events.length;

      // Get listeners (set it for the first register attempt).
      var t = _t(this);
      var on = t.listeners;
      on || (on = t.listeners = {});

      // Loop on events
      while (i--) {
        var e = events[i];

        // If an event with the same name was registered by `only` method,
        // do not override previous one.
        if (typeof on[e] !== 'function') {
          on[e] = callback;
        }
      }
    }
    return this;
  };

  /**
   * Unregisters events. Usage;
   * `emitter.off()` removes all callbacks on all events.
   * `emitter.off('foo')` removes all callbacks on `foo`.
   * `emitter.off('foo', fn)` removes only `fn` callback on `foo`.
   *
   * @param {String} event
   * @param {Function} callback
   * @return {Emitter}
   */
  proto.off = function(event, callback) {
    var argsLen = arguments.length;

    // Get listeners
    var t = _t(this);
    var on = t.listeners;

    // If there is no events, don't go further.
    if (!on) {
      return this;
    }

    if (argsLen === 0) {
      // Remove all listeners on all events.
      t.listeners = null;
    }
    else if (!on[event]) {
      // Supplied event not found, but it may have
      // multiple events separated by a space. Run `off` method
      // for each individual event to test this case.
      var events = event.split(' ');
      var j = events.length;
      if (j > 1) {
        while (j--) {
          this.off(events[j], callback);
        }
      }
    }
    else if (argsLen === 1 || !callback || typeof on[event] === 'function') {
      // Remove all listeners on single event.
      on[event] = null;
    }
    else {
      // Remove specific listener on single event.
      var callbacks = on[event];
      var len = callbacks.length;
      for (var i = 0; i < len; i++) {
        var strCallback = String(callbacks[i]);

        // Check if supplied listener is equal to the registered one.
        if (strCallback === String(callback) ||
            strCallback === String(once(this, event, callback))) {
          callbacks.splice(i, 1);
          break;
        }
      }
    }
    return this;
  };

  /**
   * Turns off listeners once when the event is emitted
   * first time after `offence` call. Listeners will be triggered
   * again after the second `emit` call.
   *
   * @param {String} event
   * @param {Function} callback
   * @return {Emitter}
   */
  proto.offence = function(event, callback) {
    var argsLen = arguments.length;

    // Get listeners
    var t = _t(this);
    var on = t.listeners;
    var callbacks;

    // If there is no events, don't go further.
    if (!on) {
      return this;
    }
    if (argsLen === 0) {
      // Apply offence to all listeners on all events.
      for (var key in on) {
        if (on.hasOwnProperty(key)) {
          this.offence(key);
        }
      }
    }
    else if (!on[event]) {
      // Supplied event not found, but it may have
      // multiple events separated by a space. Run `offence` method
      // for each individual event to test this case.
      var events = event.split(' ');
      var j = events.length;
      if (j > 1) {
        while (j--) {
          this.offence(events[j], callback);
        }
      }
    }
    else if (argsLen === 1 || !callback || typeof callbacks === 'function') {
      // Get listeners
      callbacks = on[event];

      // Check if `offence` was applied previously.
      if (String(callbacks) !== 'function() {on[event] = callbacks;}') {
        // Apply offence to all listeners on single event.
        // Convert listeners array to a function which will be
        // set itself again to the listeners array after first call.
        on[event] = function() {on[event] = callbacks;};
      }
    }
    else if (callback) {
      // Apply `offence` to a specific listener on single event.
      callbacks = on[event];
      var len = callbacks.length;
      for (var i = 0; i < len; i++) {
        var strCallback = String(callbacks[i]);

        // Check if supplied listener is equal to the registered one.
        if (strCallback === String(callback) ||
            strCallback === String(once(this, event, callback))) {
          offence(callbacks, i, callbacks[i]);
          break;
        }
      }
    }
    return this;
  };

  function offence(callbacks, i, callback) {
    // Override specific listener with a function which will be
    // set itself again to the original one after first call.
    callbacks[i] = function() {
      callbacks[i] = callback;
    };
  }

  /**
   * Returns an array of callbacks or an empty array.
   *
   * @param {String} event
   * @return {Array}
   */
  proto.getListeners = function(event) {
    return (_t(this).listeners || {})[event] || [];
  };

  /**
   * Checks if the emitter has a registered listener.
   *
   * @param {String} event
   * @return {Boolean}
   */
  proto.hasListeners = function(event) {
    return !!this.getListeners(event).length;
  };

  /**
   * Undocumented method. Generates a unique id and returns it.
   *
   * @return {Integer}
   */
  proto._tid = function() {
    var ctx = this;
    ctx._t || (ctx._t = {});
    return ctx._t.tid || (ctx._t.tid = uniqueId++);
  };

  function eachEvent(ctx, method, obj) {
    // An object like `{event1: listener1, event2: listener2}` is supplied to
    // one of the `on`, `once` and `only` methods.
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        ctx[method](key, obj[key]);
      }
    }
  }

  function _t(ctx) {
    ctx._t || (ctx._t = {});
    return ctx._t[namespace] || (ctx._t[namespace] = {});
  }

  /**
   * A helper function which copies source objects' properties to
   * the base object. You can pass any number of source objects to
   * this function. Base and source objects can be regular objects,
   * prototypes or functions.
   *
   * @param {Object} base
   * @param {Object} ...
   * @return {Object}
   */
  function mixin(base) {
    var len = arguments.length;
    base || (base = {});
    for (var i = 1; i < len; i++) {
      var source = arguments[i];
      if (source) {
        for (var prop in source) {
          if (source.hasOwnProperty(prop)) {
            base[prop] = source[prop];
          }
        }
      }
    }
    return base;
  }

  // A helper function similar to `goog.inherits` which adds
  // inheritance mechanism to constructor methods.
  function inherits(child, parent) {
    var childProto = child.prototype;
    var Mirror = function() {
      this.constructor = child;
    };
    Mirror.prototype = parent.prototype;
    child.prototype = new Mirror();
    child.__super__ = parent.prototype;
    mixin(child.prototype, childProto);
  }

  /**
   * Creates new constructor function which is a subclass of `Emitter`.
   * You can override Emitter's constructor function by passing first
   * parameter as your custom constructor. If the second parameter is supplied,
   * all of its properties are attached to the newly created subclass's
   * prototype by mixin function. All properties on Emitter function
   * are also attached to the subclass, which means that you can use
   * `Subclass.mixin` and `Subclass.extend` too.
   *
   * @param {Function} ctor
   * @param {Object} extender
   * @return {Function}
   */
  TaksimEmitter.extend = function(ctor, extender) {
    if (typeof ctor !== 'function') {
      extender = ctor;
      ctor = null;
    }
    var parent = this;
    var child;

    if (ctor) {
      child = ctor;
    }
    else {
      child = function() {
        return parent.apply(this, arguments);
      };
    }

    inherits(child, parent);
    mixin(child, parent);
    mixin(child.prototype, extender);

    return child;
  };

  // Attach mixin to `Emitter` constructor.
  TaksimEmitter.mixin = mixin;

  return TaksimEmitter;
});
