var expect = require('chai').expect
  , EventEmitter = require('events').EventEmitter
  , proxy = require('../lib')

suite('Proxy', function() {
  test('Events', function() {
    var obj = new EventEmitter
    obj.on('event1', proxy(function() {
      throw new Error('Works!')
    }))
    expect(obj.emit.bind(obj, 'event1')).to.throw('Works!')
  })
  test('Context', function() {
    var obj = new EventEmitter
      , context = {}
    obj.on('event1', proxy(function() {
      expect(this).to.equal(context)
    }, context))
    obj.emit('event1')
  })
  test('Arguments', function() {
    var obj = new EventEmitter
      , context = {}, arg1 = {}, arg2 = {}
    obj.on('event1', proxy(function(a, b) {
      expect(this).to.equal(context)
      expect(a).to.equal(arg1)
      expect(b).to.equal(arg2)
    }, context, arg1, arg2))
    obj.emit('event1')
  })
  test('Indirect functions', function() {
    var obj = new EventEmitter
      , called = false
      , target = { method: function() { called = true } }
    obj.on('event1', proxy(target, 'method'))
    obj.emit('event1')
    expect(called).to.be.ok
  })
  test('Bind & Unbind', function() {
    var obj = new EventEmitter
      , fn  = function() {}
    obj.on('event1', proxy(fn, {}, 1))
    obj.on('event1', proxy(fn, {}, 2))
    expect(obj._events).to.include.keys('event1')
    expect(obj._events.event1).to.have.lengthOf(2)
    obj.removeListener('event1', fn)
    expect(obj._events).to.not.include.keys('event1')
  })
  test('Unbinding indirect functions', function() {
    function Constructor() {}
    Constructor.prototype.doSomething = function() {}

    var c = new Constructor
      , obj = new EventEmitter
    obj.on('event1', proxy(c, 'doSomething'))
    expect(obj._events).to.include.keys('event1')
    obj.removeListener('event1', c.doSomething)
    expect(obj._events).to.not.include.keys('event1')
  })
})