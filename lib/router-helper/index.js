var qs = require('querystring')
var url = require('url')
var bl = require('bl')
var xtend = require('xtend')
var routington = require('routington')

module.exports = function () {
  var router = routington()
  router.errorHandler = null
  ;['get', 'delete', 'post', 'put'].forEach(function (method) {
    router[method] = function (path, handler) {
      var node = router.define(path)[0]
      if (!node[method]) node[method] = handler
      else node[method].handler = handler
    }
  })
  router.onerror = function (errorHandler) {
    router.errorHandler = errorHandler
  }
  return router
}

module.exports.setup = function (opt) {
  var router = opt.router
  var ecstatic = opt.ecstatic

  router.onerror(function defaultErrorHandler (err, req, res) {
    console.error(err)
    var str = JSON.stringify({error: String(err)}, null, 2)
    res.statusCode = 400
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.setHeader('content-length', Buffer.byteLength(str))
    res.end(str)
  })

  return function onRequest (req, res) {
    var u = url.parse(req.url, true)
    var m = router.match(u.pathname)
    if (!m) return ecstatic(req, res)

    var method = req.method.toLowerCase()
    var node = m.node
    if (!node[method]) return ecstatic(req, res)

    var data = null
    var params = xtend(u.query, m.param)
    if (method !== 'post' && method !== 'put') {
      return help(node[method])
    }

    req.pipe(bl(function (err, body) {
      if (err) return router.errorHandler(err, req, res)
      var c = req.headers['content-type']
      var s = String(body)
      if (c.indexOf('/json') === -1) {
        data = qs.parse(s)
      } else {
        try {
          data = JSON.parse(s)
        } catch (e) {
          return router.errorHandler(JSONParseError(s), req, res)
        }
      }
      help(node[method])
    }))

    function help (handler) {
      var p = handler(req, res, params, data)
      if (handler.handler && p && p.then) {
        p.then(help.bind(null, handler.handler))
      }
    }

    function JSONParseError (s) {
      var e = new Error('can not JSON.parse')
      e.name = 'JSONParseError'
      e.data = s
      return e
    }
  }
}
