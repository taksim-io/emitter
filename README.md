# Emitter

Event emitter for node and browser without any dependency.

## Installation

### Server

Install it as a [node](http://nodejs.org/) module via [npm](https://www.npmjs.com/).

    npm install taksim-emitter

and include in a file;

```js
var Emitter = require('taksim-emitter');
```

### Client

You can pull down it using [Bower](http://bower.io/)

    bower install taksim-emitter

or just [download](https://raw.githubusercontent.com/taksim-io/emitter/master/dist/taksim-emitter.min.js) the latest minified version and include in your document.

```html
<script type='text/javascript' src='taksim-emitter.min.js'></script>
```

## Usage

### Emitter(obj)

```js
// As an instance
var emitter = new Emitter();
emitter.emit('foo');

// As a mixin
var obj = {};
Emitter(obj);
obj.emit('foo');
```
### on(event:string/object, callback:function)

Pass an event name and callback function to register single `event` at a time.

```js
var emitter = Emitter({});
emitter.on('foo', function(args) {
  // Do something 
});
emitter.emit('foo', arg1, arg2/*...args*/);
```

Pass an object to register multiple `event`s at a time.

```js
var emitter = Emitter({});
emitter.on({
  foo: function(args) {
    // Do something
  },
  bar: function(args) {
    // Do something
  },
});
emitter.emit('foo');
emitter.emit('bar');
```

### once(event:string/object, callback:function)

Fires the callback once and unregisters it after the first `emit` call.

```js
var emitter = Emitter({});
var foo = 0;

emitter.once('foo', function(val) {
  foo += val; 
});

emitter.emit('foo', 1);
emitter.emit('foo', 2); // Not fired
// foo equals to 1
```

### only(event:string/object, callback:function)

Registers the callback function only once for an event and unlike `on` and `once` methods you can use callback's returned value safely. Any new register attempt for the same event name is omitted and because there is only one callback to be fired, this method performs better than the `on` method.

```js
var emitter = new Emitter();

function add(val) {
  return val + 1;
}

// Only this will be fired
emitter.only('foo', add);

// After this point, register attempts for foo are omitted
emitter.on('foo', add);
emitter.once('foo', add);
emitter.only('foo', add);

var foo = emitter.emit('foo', 1); // 2
emitter.emit('foo', foo); // 3
```
### off(event:string, callback:function)

* `emitter.off()` removes all callbacks on all events.
* `emitter.off('foo')` removes all callbacks on `foo`.
* `emitter.off('foo', fn)` removes only `fn` callback on `foo`.

### offence(event:string, callback:function)

Turns off callbacks once when the event is emitted first time after `offence` call. Callbacks will be fired again after the second `emit` call.

```js
var emitter = new Emitter();
var foo = 0;

emitter.on('foo bar', function(val) {
  foo += val;
});
emitter.offence('foo');
emitter.emit('foo', 1); // Not fired
emitter.emit('foo', 2); // Fired
emitter.emit('foo', 3); // Fired
// foo equals to 5
```

* `emitter.offence()` silences all callbacks for once.
* `emitter.offence('foo')` silences all callbacks on `foo` for once.
* `emitter.offence('foo', fn)` silences only `fn` callback on `foo` for once.

### emit(event:string, arguments)

Emits `event` and passes all arguments to the callbacks. Please not that this method is not chainable. It always returns the last registered callback's returned value.

### getListeners(event:string)

Returns an array of callbacks or an empty array

### hasListeners(event:string)

Checks if the emitter has a registered callback.

## License

MIT Copyright (c) 2015 taksim.io