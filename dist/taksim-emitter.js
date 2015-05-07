/**
 * @license MIT
 * taksim.io/emitter v0.1.5
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

  var namespace = 'emitter';
  var proto = TaksimEmitter.prototype;

  function TaksimEmitter(obj) {
    if (obj) {
      return mixin(obj);
    }
  }

  proto.emit = function() {
    var on = getListeners(this);
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
      var on = getListeners(this);
      on || (on = setListeners(this, {}));
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
      var on = getListeners(this);
      on || (on = setListeners(this, {}));
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
    var on = getListeners(this);
    if (!on) {
      return this;
    }
    if (argsLen === 0) {
      setListeners(this, null);
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
    var on = getListeners(this);
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

  function offence(callbacks, i, callback) {
    callbacks[i] = function() {
      callbacks[i] = callback;
    };
  }

  proto.getListeners = function(event) {
    return (getListeners(this) || {})[event] || [];
  };

  proto.hasListeners = function(event) {
    return !!this.getListeners(event).length;
  };

  function get(ctx, key) {
    return ctx._t && ctx._t[namespace] && ctx._t[namespace][key];
  }

  function getListeners(ctx) {
    return get(ctx, 'listeners');
  }

  function set(ctx, key, val) {
    ctx._t || (ctx._t = {});
    ctx._t[namespace] = {};
    ctx._t[namespace][key] = val;
    return val;
  }

  function setListeners(ctx, val) {
    return set(ctx, 'listeners', val);
  }

  function mixin(ctx) {
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        ctx[key] = proto[key];
      }
    }
    return ctx;
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
