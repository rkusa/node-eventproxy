# node-eventproxy

Takes a function and returns a new one that has the provided context and arguments bind to it.

[![Build Status](https://secure.travis-ci.org/rkusa/node-eventproxy.png)](http://travis-ci.org/rkusa/node-eventproxy)

```json
{ "name": "node-eventproxy",
  "version": "0.3.2" }
```

This method is useful for binding a context and arguments to a function that is attached to a Node's [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter). It thereby assures that even if you bind the function returned from node-eventproxy it will still unbind the correct function if passed the original one.

## Usage

```js
var proxy = require('node-eventproxy')
proxy.enable(require('events').EventEmitter)
obj.on('event', proxy(fn, context))
obj.removeListener('event', fn)
```

To not overwrite `EventEmitter.prototype.removeListener` directly, a better practise would be:

```js
var util = require('util')
  , proxy = require('node-eventproxy')
util.inherits(MyEventEmitter, require('events').EventEmitter)
proxy.enable(MyEventEmitter)
```

## API

### proxy.enable(constructor)

Extends the behaviour of `constructor.prototype.removeListener`.

### proxy(fn, [context], [args...])

This method is used to bind a context and arguments to a function to be attached to a Node's [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

**Arguments:**

* **fn** - the function to be attached
* **context** - the context (`this`) of the function
* **args...** - additional arguments that should be provided to the function

### proxy(target, method, [context], [args...])

Same as [`proxy(fn, [context], [args...])`](#proxyfn-context-args) with the difference of referencing the function in an indirect way. This is especially for serializing attached events using [rkusa/implode](https://github.com/rkusa/implode).

**Example:**

```js
function Constructor() {}
Constructor.prototype.doSomething = function() {}

var c = new Constructor
  , obj = new EventEmitter
obj.on('event', proxy(c, 'doSomething'))
```

## MIT License
Copyright (c) 2013 Markus Ast

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.