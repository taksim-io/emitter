/**
 * @license MIT
 * taksim.io/emitter // @echo VERSION
 * https://github.com/taksim-io/emitter
 * Copyright (c) 2015 taksim.io
*/

;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    var Emitter = factory(root);
    root.Emitter || (root.Emitter = Emitter);
    root.taksim || (root.taksim = {});
    root.taksim.Emitter = Emitter;
  }
})(this, function() {

  'use strict';

  var uniqueId = 1;
  var namespace = 'emitter';
  var proto = TaksimEmitter.prototype;

  function TaksimEmitter(obj) {
    if (obj) {
      init(mixin(obj, proto));
      return obj;
    }
    init(this);
  }

  proto.emit = function() {
    var on = _t(this).listeners;
    var args = Array.prototype.slice.call(arguments);
    var event = args.shift();
    var result;
    if (on && on[event]) {
      var callbacks = on[event];
      if (typeof callbacks === 'function') {
        result = callbacks.apply(this, args);
      }
      else {
        var len = callbacks.length;
        callbacks = callbacks.slice();
        for (var i = 0; i < len; i++) {
          result = callbacks[i].apply(this, args);
          if (result === false) {
            break;
          }
        }
      }
    }
    return result;
  };

  proto.on = function(event, callback) {
    if (typeof event === 'object') {
      eachEvent(this, 'on', event);
    }
    else if (typeof callback === 'function') {
      var events = event.split(' ');
      var i = events.length;
      var t = _t(this);
      var on = t.listeners;
      on || (on = t.listeners = {});
      while (i--) {
        event = events[i];
        if (typeof on[event] !== 'function') {
          on[event] || (on[event] = []);
          on[event].push(callback);
        }
      }
    }
    return this;
  };

  proto.once = function(event, callback) {
    if (typeof event === 'object') {
      eachEvent(this, 'once', event);
    }
    else if (typeof callback === 'function') {
      var events = event.split(' ');
      var i = events.length;
      while (i--) {
        this.on(event, once(this, events[i], callback));
      }
    }
    return this;
  };

  function once(ctx, event, callback) {
    return function before() {
      ctx.off(event, before);
      callback.apply(ctx, arguments);
    };
  }

  proto.only = function(event, callback) {
    if (typeof event === 'object') {
      eachEvent(this, 'only', event);
    }
    else if (typeof callback === 'function') {
      var events = event.split(' ');
      var i = events.length;
      var t = _t(this);
      var on = t.listeners;
      on || (on = t.listeners = {});
      while (i--) {
        var e = events[i];
        if (typeof on[e] !== 'function') {
          on[e] = callback;
        }
      }
    }
    return this;
  };

  proto.off = function(event, callback) {
    var argsLen = arguments.length;
    var t = _t(this);
    var on = t.listeners;
    if (!on) {
      return this;
    }
    if (argsLen === 0) {
      t.listeners = null;
    }
    else if (!on[event]) {
      var events = event.split(' ');
      var j = events.length;
      if (j > 1) {
        while (j--) {
          this.off(events[j], callback);
        }
      }
    }
    else if (argsLen === 1 || !callback || typeof on[event] === 'function') {
      on[event] = null;
    }
    else {
      var callbacks = on[event];
      var len = callbacks.length;
      for (var i = 0; i < len; i++) {
        var strCallback = String(callbacks[i]);
        if (strCallback === String(callback) ||
            strCallback === String(once(this, event, callback))) {
          callbacks.splice(i, 1);
          break;
        }
      }
    }
    return this;
  };

  proto.offence = function(event, callback) {
    var argsLen = arguments.length;
    var t = _t(this);
    var on = t.listeners;
    var callbacks;
    if (!on) {
      return this;
    }
    if (argsLen === 0) {
      for (var key in on) {
        if (on.hasOwnProperty(key)) {
          this.offence(key);
        }
      }
    }
    else if (!on[event]) {
      var events = event.split(' ');
      var j = events.length;
      if (j > 1) {
        while (j--) {
          this.offence(events[j], callback);
        }
      }
    }
    else if (argsLen === 1 || !callback || typeof callbacks === 'function') {
      callbacks = on[event];
      if (String(callbacks) !== 'function() {on[event] = callbacks;}') {
        on[event] = function() {on[event] = callbacks;};
      }
    }
    else if (callback) {
      callbacks = on[event];
      var len = callbacks.length;
      for (var i = 0; i < len; i++) {
        var strCallback = String(callbacks[i]);
        if (strCallback === String(callback) ||
            strCallback === String(once(this, event, callback))) {
          offence(callbacks, i, callbacks[i]);
          break;
        }
      }
    }
    return this;
  };

  proto.getListeners = function(event) {
    return (_t(this).listeners || {})[event] || [];
  };

  proto.hasListeners = function(event) {
    return !!this.getListeners(event).length;
  };

  function offence(callbacks, i, callback) {
    callbacks[i] = function() {
      callbacks[i] = callback;
    };
  }

  function eachEvent(ctx, method, obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        ctx[method](key, obj[key]);
      }
    }
  }

  function init(ctx) {
    ctx._t || (ctx._t = {});
    ctx._t[namespace] = {
      listeners: null
    };
    ctx._t.id = uniqueId++;
    return ctx;
  }

  function _t(ctx) {
    return ctx._t[namespace];
  }

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

  function inherits(child, parent) {
    var Mirror = function() {
      this.constructor = child;
    };
    Mirror.prototype = parent.prototype;
    child.prototype = new Mirror();
    child.__super__ = parent.prototype;
  }

  TaksimEmitter.mixin = mixin;
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
    mixin(parent.prototype, extender);

    return child;
  };

  return TaksimEmitter;
});
