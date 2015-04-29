/**
 * @license MIT
 * taksim.io/emitter v0.1.2
 * https://github.com/taksim-io/emitter
 * Copyright (c) 2015 taksim.io
*/

;(function(root, factory) {
  var Emitter = factory(root);
  if (typeof define === 'function' && define.amd) {
    define(Emitter);
  } else if (typeof exports === 'object') {
    module.exports = Emitter;
  } else {
    root.Emitter || (root.Emitter = Emitter);
    root.taksim || (root.taksim = {});
    root.taksim.Emitter = Emitter;
  }
})(this, function() {

  'use strict';

  function TaksimEmitter(obj) {
    if (obj) {
      return mixin(obj);
    }
  }

  var proto = TaksimEmitter.prototype;

  proto.emit = function() {
    var on = get(this, 'listeners');
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
      var on = get(this, 'listeners');
      on || (on = set(this, 'listeners', {}));
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
      var on = get(this, 'listeners');
      on || (on = set(this, 'listeners', {}));
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
    var on = get(this, 'listeners');
    if (!on) {
      return this;
    }
    if (argsLen === 0) {
      set(this, 'listeners', null);
    }
    else if (!on[event]) {
      var events = event.split(' ');
      var j = events.length;
      while (--j >= 0) {
        this.off(events[j], callback);
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
    var on = get(this, 'listeners');
    var callbacks = on[event];
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
      while (--j >= 0) {
        this.offence(events[j], callback);
      }
    }
    else if (argsLen === 1 || !callback || typeof callbacks === 'function') {
      if (String(callbacks) !== 'function() {on[event] = callbacks;}') {
        on[event] = function() {on[event] = callbacks;};
      }
    }
    else if (callback) {
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

  function offence(callbacks, i, callback) {
    callbacks[i] = function() {
      callbacks[i] = callback;
    };
  }

  proto.getListeners = function(event) {
    return (get(this, 'listeners') || {})[event] || [];
  };

  proto.hasListeners = function(event) {
    return !!this.getListeners(event).length;
  };

  function set(ctx, key, value) {
    ctx._t || (ctx._t = {
      emitter: {}
    });
    ctx._t.emitter[key] = value;
    return value;
  }

  function get(ctx, key) {
    return ctx._t && ctx._t.emitter && ctx._t.emitter[key];
  }

  function mixin(obj) {
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        obj[key] = proto[key];
      }
    }
    return obj;
  }

  function eachEvent(ctx, method, obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        ctx[method](key, obj[key]);
      }
    }
  }

  return TaksimEmitter;
});
