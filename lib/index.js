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

    if (!this._events[event]) return
    if ('_proxied' in listener) listener = listener._proxied.fn || listener._proxied.target[listener._proxied.method]

    var events = (Array.isArray(this._events[event]) ? this._events[event] : [this._events[event]])
    for (var i = events.length - 1; i >= 0; --i) {
      var fn = events[i]
      if (!fn._proxied) continue
      if (fn._proxied.fn === listener || (fn._proxied.target && (fn._proxied.target === listener || fn._proxied.target[fn._proxied.method] === listener)))
        removeListener.call(this, event, fn)
    }

    return this
  }
}