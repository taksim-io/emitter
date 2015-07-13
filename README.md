# Event Emitter

Event emitter for node and browser without any dependency.

## Installation

### Server

Install as a [node](http://nodejs.org/) module via [npm](https://www.npmjs.com/).

    npm install taksim-emitter --save

and include in a file;

```js
var Emitter = require('taksim-emitter');
```

### Client

You can pull down by using [Bower](http://bower.io/)

    bower install taksim-emitter --save

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

### #on(event:string/object, callback:function)

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
var emitter = new Emitter();
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

### #once(event:string/object, callback:function)

Fires the callback once and unregisters it after the first `emit` call.

```js
var emitter = new Emitter();
var foo = 0;

emitter.once('foo', function(val) {
  foo += val;
});

emitter.emit('foo', 1);
emitter.emit('foo', 2); // Not fired
// foo equals to 1
```

### #only(event:string/object, callback:function)

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
### #off(event:string, callback:function)

* `emitter.off()` removes all callbacks on all events.
* `emitter.off('foo')` removes all callbacks on `foo`.
* `emitter.off('foo', fn)` removes only `fn` callback on `foo`.

### #offence(event:string, callback:function)

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

### #emit(event:string, arguments)

Emits `event` and passes all arguments to the callbacks. Please not that this method is not chainable. It always returns the last registered callback's returned value.

### #getListeners(event:string)

Returns an array of callbacks or an empty array

### #hasListeners(event:string)

Checks if the emitter has a registered callback.

## Helper methods

### Emitter.mixin(base:object, source1:object, source2: object/\*, ... \*/)

A helper function which copies source objects' properties to the base object. You can pass any number of source objects to this function. Base and source objects can be regular objects, prototypes or functions.

```js
var base = {};
var source1 = {
  foo: 1,
  bar: 1
};
var source2 = {
  bar: 2
};

Emitter.mixin(base, source1, source2);
console.log(base.foo); // 1
console.log(base.bar); // 2
```

### Emitter.extend(constructor:function, extender:object)

Creates new constructor function which is a subclass of Emitter. You can override Emitter's constructor function by passing first parameter as your custom constructor. If the second parameter is supplied, all of its properties are attached to the newly created subclass's prototype by mixin function. All properties on Emitter function are also attached to the subclass, which means that you can use mixin and extend on subclass (see the snippet below).

```js
// Here we override Emitter's own constructor with Rectangle
// and attach "area" method to the new subclass's prototype.
// Now Rectangle have all features that Emitter have and plus an "area" method.
Emitter.extend(Rectangle, {
  area: function() {
    var area = this.height * this.width;

    // Trigger "area" listeners whenever the area is calculated.
    this.emit('area', area);
    return area;
  }
});

function Rectangle(width, height) {
  // Because we override the Emitter's constructor,
  // we should call "Emitter()" with Rectangle's context here
  // to attach necessary variables that Emitter may use
  // on new Rectangle instances.
  Emitter.call(this);

  this.width = width;
  this.height = height;

  // Just a show off of Emitter that says "I'm here".
  this.on('area',  function(area) {
    console.log('Area is calculated as ' + area + 'cm2');
  });
}

function Square(sideLength) {
  // A call to the parent constructor is necessary again.
  Rectangle.call(this, sideLength, sideLength);
}

// Instead of using "extender" object to provide subclass methods,
// you can also use old school prototype setter.
Square.prototype.update = function(sideLength) {
  this.height = this.width = sideLength;

  // Recalculate area
  this.area();
  return this;
};

// Please note that "extend" can be used on Rectangle
// to create new subclasses.
Rectangle.extend(Square);
var square = new Square(5);

square.on('area', function(area) {
  // Do something with area, maybe update canvas or DOM
});

// Returns 25 and triggers area listeners
square.area();

// Sets new length, recalculates area as 16 and
// triggers area listeners again
square.update(4);

// Check prototype chain
square instanceof Square; // true
square instanceof Rectangle; // true
square instanceof Emitter; // true
```

## License

MIT Copyright (c) 2015 taksim.io
