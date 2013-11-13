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

  var proxy = (fn || target[method])
  if (!proxy) throw new Error('Object does not contain method `' + method + '`.')
  proxy = proxy.bind.apply(proxy, [context].concat(args))
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
    if (typeof listener === 'function')
      removeListener.call(this, event, listener)

    if (!this._events || !this._events[event]) return
    if ('_proxied' in listener) listener = listener._proxied.fn || listener._proxied.target[listener._proxied.method]

    var events = (Array.isArray(this._events[event]) ? this._events[event] : [this._events[event]])
    for (var i = events.length - 1; i >= 0; --i) {
      var fn = events[i], proxy = fn._proxied || fn.listener._proxied
      if (!proxy) continue
      if (proxy.fn === listener || (proxy.target && (proxy.target === listener || proxy.target[proxy.method] === listener)))
        removeListener.call(this, event, fn)
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