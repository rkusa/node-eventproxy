var proxy = module.exports = function(/* target, method, context, args.. */) {
  var args = Array.prototype.slice.call(arguments)
    , target = args.shift()
    , method, fn

  if (typeof target === 'function') {
    fn = target
    target = null
  } else {
    method = args.shift()
  }

  var context = args.shift()

  var proxy = function() {
    var proxy = arguments.callee._proxied
    try {
      var fn = proxy.fn || proxy.target[proxy.method]
    } catch(e) {}
    fn.apply(proxy.context, proxy.args.concat(Array.prototype.slice.call(arguments)))
  }
  proxy._proxied = {
    target: target,
    method: method,
    fn: fn,
    context: context,
    args: args
  }

  return proxy
}

proxy.enable = function(emitter) {
  var prototype = emitter.prototype || emitter
    , removeListener = prototype.removeListener
  prototype.removeListener = function(event, listener) {
    if (typeof listener === 'undefined') {
      removeListener.call(this, event)
      return
    }

    if (typeof listener === 'function') {
      removeListener.call(this, event, listener)
    }

    if (!this._events || !this._events[event]) return

    var events = (Array.isArray(this._events[event]) ? this._events[event] : [this._events[event]])
    for (var i = events.length - 1; i >= 0; --i) {
      var fn = events[i], proxy = fn && (fn._proxied || (fn.listener && fn.listener._proxied))
      if (!proxy) continue
      if ('_proxied' in listener) {
        if (compare(proxy, listener._proxied))
          removeListener.call(this, event, fn)
      } else {
        if (proxy.fn === listener || (proxy.target && (proxy.target === listener || proxy.target[proxy.method] === listener)))
          removeListener.call(this, event, fn)
      }
    }

    return this
  }

  prototype.once = function(type, listener) {
    if (typeof listener !== 'function')
      throw TypeError('listener must be a function')

    function g() {
      this.removeListener(arguments.callee.type, arguments.callee.listener || arguments.callee)
      arguments.callee.listener.apply(this, arguments)
    }

    g.type = type
    g.listener = listener
    this.on(type, g)

    return this
  };
}

function compare(lhs, rhs) {
  var result =          lhs.fn === rhs.fn
            &&      lhs.target === rhs.target
            &&      lhs.method === rhs.method
            &&     lhs.context === rhs.context
            && lhs.args.length === rhs.args.length
  if (!result) return false

  for (var i = 0, len = lhs.args.length; i < len; ++i) {
    if (typeof lhs.args[i] === 'function' && '_proxied' in lhs.args[i]) {
      if (!compare(lhs.args[i]._proxied, rhs.args[i]._proxied)) return false
    }
    else if (lhs.args[i] !== rhs.args[i]) return false
  }

  return true
}