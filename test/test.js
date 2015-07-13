var expect = require('chai').expect;
var Emitter = require('../build');

describe('on', function() {
  it('should add a callback on an event', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.on('foo', function(val) {
      foo = val;
    });

    emitter.on('foo', function(val) {
      foo += val;
    });

    emitter.emit('foo', 1);
    expect(foo).to.equal(2);
  });

  it('should add same callback on multiple events ', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.on('foo bar', function(val, bar) {
      foo += val;
      if (bar) {
        foo += bar;
      }
    });

    emitter.emit('foo', 1);
    emitter.emit('bar', 1, 2);
    expect(foo).to.equal(4);
  });

  it('should add multiple events', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.on({
      foo: function(val) {
        foo += val;
      },
      bar: function(val) {
        foo -= val;
      }
    });

    emitter.emit('foo', 2);
    emitter.emit('bar', 1);
    expect(foo).to.equal(1);
  });
});

describe('once', function() {
  it('should add events that will be fired once', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.once('foo', function(val) {
      foo += val;
    });

    emitter.emit('foo', 1);
    emitter.emit('foo', 2);
    emitter.emit('foo', 3);
    expect(foo).to.equal(1);
  });
});

describe('only', function() {
  it('should add only one listener for each event', function() {
    var emitter = new Emitter();
    var foo = 0;

    // Only this should be fired
    emitter.only('foo', function(val) {
      foo += val;
    });

    // Not fired
    emitter.on('foo', function() {
      foo = 1;
    });

    // Not fired
    emitter.only('foo', function() {
      foo = 2;
    });

    emitter.emit('foo', 1);
    emitter.emit('foo', 2);
    expect(foo).to.equal(3);
  });
});

describe('off', function() {
  it('should remove all events', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.on('foo bar', function(val) {
      foo += val;
    });
    emitter.emit('foo', 1);
    emitter.emit('bar', 1);
    emitter.off();
    emitter.emit('foo', 1);
    emitter.emit('bar', 1);
    expect(foo).to.equal(2);
  });

  it('should remove single event', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.on('foo', function(val) {
      foo += val;
    });
    emitter.off('foo');
    emitter.emit('foo', 1);
    expect(foo).to.equal(0);
  });

  it('should remove multiple events', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.on('foo bar', function(val) {
      foo += val;
    });
    emitter.off('foo bar');
    emitter.emit('foo', 1);
    emitter.emit('bar', 1);
    expect(foo).to.equal(0);
  });

  it('should remove specific listener', function() {
    var emitter = new Emitter();
    var foo = 0;

    function add(val) {
      foo += val;
    }

    function subtract(val) {
      foo -= val;
    }

    emitter.on('foo', add);
    emitter.on('foo', subtract);
    emitter.off('foo', subtract);
    emitter.emit('foo', 1);
    emitter.emit('foo', 2);
    expect(foo).to.equal(3);
  });

  it('should work for once method', function() {
    var emitter = new Emitter();
    var foo = 0;

    function add(val) {
      foo += val;
    }

    function subtract(val) {
      foo -= val;
    }

    emitter.on('foo', add);
    emitter.once('foo', subtract);
    emitter.off('foo', subtract);
    emitter.emit('foo', 1);
    emitter.emit('foo', 2);
    expect(foo).to.equal(3);
  });

  it('should work for only method', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.only('foo', function(val) {
      foo += val;
    });
    emitter.off('foo');
    emitter.emit('foo', 1);
    expect(foo).to.equal(0);
  });

  it('should do nothing for unregistered events', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.only('foo', function(val) {
      foo += val;
    });
    emitter.off('bar');
    emitter.emit('bar', 1);
    expect(foo).to.equal(0);
  });
});

describe('offence', function() {
  it('should silence all events for once', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.on('foo bar', function(val) {
      foo += val;
    });
    emitter.offence();
    emitter.emit('foo', 1);
    emitter.emit('bar', 1);

    // Second calls should be fired
    emitter.emit('foo', 3);
    emitter.emit('bar', 4);
    expect(foo).to.equal(7);
  });

  it('should silence single event for once', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.on('foo', function(val) {
      foo += val;
    });
    emitter.offence('foo');
    emitter.emit('foo', 1);

    // Second call should be fired
    emitter.emit('foo', 2);
    expect(foo).to.equal(2);
  });

  it('should silence multiple events for once', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.on('foo bar', function(val) {
      foo += val;
    });
    emitter.offence('foo bar');
    emitter.emit('foo', 1);
    emitter.emit('bar', 1);

    // Second calls should be fired
    emitter.emit('foo', 3);
    emitter.emit('bar', 4);
    expect(foo).to.equal(7);
  });

  it('should silence specific listener for once', function() {
    var emitter = new Emitter();
    var foo = 0;

    function add(val) {
      foo += val;
    }
    function subtract(val) {
      foo -= val;
    }
    emitter.on('foo', add);
    emitter.on('foo', subtract);
    emitter.offence('foo', subtract);

    // Only add should be fired
    emitter.emit('foo', 1);

    // Both methods should be fired now
    emitter.emit('foo', 2);
    expect(foo).to.equal(1);
  });

  it('should work for once method', function() {
    var emitter = new Emitter();
    var foo = 0;

    function add(val) {
      foo += val;
    }
    function subtract(val) {
      foo -= val;
    }
    emitter.on('foo', add);
    emitter.once('foo', subtract);
    emitter.offence('foo', subtract);

    // Only add should be fired
    emitter.emit('foo', 1);

    // Both methods should be fired now
    emitter.emit('foo', 2);

    // Again only add should be fired
    emitter.emit('foo', 3);
    expect(foo).to.equal(4);
  });

  it('should work for only method', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.only('foo', function(val) {
      foo += val;
    });
    emitter.offence('foo');
    emitter.emit('foo', 1);

    // Second call should be fired
    emitter.emit('foo', 2);
    expect(foo).to.equal(2);
  });

  it('should do nothing for unregistered events', function() {
    var emitter = new Emitter();
    var foo = 0;

    emitter.only('foo', function(val) {
      foo += val;
    });
    emitter.offence('bar');
    emitter.emit('bar', 1);
    emitter.emit('bar', 2);
    expect(foo).to.equal(0);
  });
});

describe('getListeners', function() {
  it('should return array of listeners', function() {
    var emitter = new Emitter();

    function foo() {
      return 0;
    }
    emitter.on('foo', foo);
    expect(emitter.getListeners('foo')).to.deep.equal([foo]);
  });

  it('should return empty array', function() {
    expect(new Emitter().getListeners('foo')).to.deep.equal([]);
  });
});

describe('hasListeners', function() {
  it('should return true', function() {
    var emitter = new Emitter();

    function foo() {
      return 0;
    }
    emitter.on('foo', foo);
    expect(emitter.hasListeners('foo')).is.true;
  });

  it('should return false', function() {
    expect((new Emitter()).hasListeners('foo')).is.false;
  });
});

describe('mixin', function() {
  it('should add emitter methods to any object', function() {
    var emitter = {};
    var foo = 0;

    Emitter(emitter);
    emitter.on('foo', function(val) {
      foo += val;
    });
    emitter.emit('foo', 1);

    expect(foo).to.equal(1);
  });

  it('should work with prototype objects', function() {
    function TestCtor() {}
    Emitter(TestCtor.prototype);
    var emitter1 = new TestCtor();
    var emitter2 = new TestCtor();
    var foo = 0;
    var bar = 0;

    emitter1.on('foo', function(val) {
      foo += val;
    });
    emitter1.emit('foo', 1);

    emitter2.on('foo', function(val) {
      bar += val;
    });
    emitter2.emit('foo', 1);

    expect(foo).to.equal(1);
    expect(bar).to.equal(1);
  });

  it('should work with multiple objects', function() {
    var base = {};
    var source1 = {
      foo: 1,
      bar: 1
    };
    var source2 = {
      bar: 2
    };

    Emitter.mixin(base, source1, source2);

    expect(base.foo + base.bar).to.equal(3);
  });
});

describe('extend', function() {
  it('should create a new constructor method based on Emitter', function() {
    var ExtendEmitter = Emitter.extend();
    var emitter = new ExtendEmitter();
    var foo = 0;

    emitter.on('foo', function(val) {
      foo += val;
    });
    emitter.emit('foo', 1);

    expect(emitter).to.be.an.instanceof(Emitter);
    expect(emitter).to.be.an.instanceof(ExtendEmitter);
    expect(ExtendEmitter.extend).to.be.a.function;
    expect(ExtendEmitter.mixin).to.be.a.function;
    expect(ExtendEmitter.init).to.be.a.function;
    expect(foo).to.equal(1);
  });

  it('should create a new constructor method based on Emitter and supplied constructor', function() {
    var ExtendEmitter = Emitter.extend(ExtendEmitter_);
    var emitter = new ExtendEmitter();
    var foo = 0;

    function ExtendEmitter_() {
      Emitter.call(this);
      this.on('foo', function() {
        foo += 1;
      });
    }

    emitter.on('foo', function(val) {
      foo += val;
    });
    emitter.emit('foo', 1);

    expect(emitter).to.be.an.instanceof(Emitter);
    expect(emitter).to.be.an.instanceof(ExtendEmitter);
    expect(emitter).to.be.an.instanceof(ExtendEmitter_);
    expect(foo).to.equal(2);
  });

  it('should create a new constructor with supplied extend methods', function() {
    var ExtendEmitter = Emitter.extend({
      foo: attachFooListener
    });
    var emitter = new ExtendEmitter();
    var foo = 0;

    function attachFooListener() {
      this.on('foo', function() {
        foo += 1;
      });
      return this;
    }

    emitter.foo().emit('foo', 1);

    expect(foo).to.equal(1);
  });

  it('should work with the documentation example', function() {
    var foo = 0;
    var area = 0;

    Emitter.extend(Rectangle, {
      area: function() {
        var area = this.height * this.width;
        this.emit('area', area);
        return area;
      }
    });

    function Rectangle(width, height) {
      Emitter.call(this);
      this.width = width;
      this.height = height;
      this.on('area',  function(a) {
        area = a;
        foo++;
      });
    }

    function Square_(sideLength) {
      Rectangle.call(this, sideLength, sideLength);
    }

    Square_.prototype.update = function(sideLength) {
      this.height = this.width = sideLength;
      this.area();
      return this;
    };

    var Square = Rectangle.extend(Square_);
    var square = new Square(5);

    square
      .on('area', function(a) {
        area = a;
        foo++;
      })
      .update(4);

    expect(square).to.be.an.instanceof(Square_);
    expect(square).to.be.an.instanceof(Square);
    expect(square).to.be.an.instanceof(Rectangle);
    expect(square).to.be.an.instanceof(Emitter);
    expect(area).to.equal(16);
    expect(foo).to.equal(2);
  });
});
