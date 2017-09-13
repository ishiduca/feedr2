var hyperquest = require('hyperquest')
var missi = require('mississippi')
var xtend = require('xtend')

module.exports = request

function request (uri, _opt) {
  var maxRetry = 5
  var stream = missi.through.obj()

  _request(uri, _opt)

  return stream

  function _request (uri, _opt) {
    var opt = xtend(_opt)
    opt.headers = xtend(opt.headers)
    opt.headers['user-agent'] || (opt.headers['user-agent'] = 'feedman')
    var req = hyperquest(uri, opt)
    req.once('response', function (res) {
      var h = res.headers
      var s = Number(res.statusCode)

      console.log('%s - %s', s, uri)

      if (s >= 300 && s < 400 && h.location) {
        return _request(h.location, {headers: {referrer: uri}})
      }

      if (s === 503 && maxRetry > 0) {
        maxRetry -= 1
        return setTimeout(function () {
          _request(uri, opt)
        }, 1000 * 12)
      }

      if (s !== 200) {
        var err = new Error(`requestError: statusCode: ${s} uri: ${uri}`)
        return stream.emit('error', err)
      }

      res.pipe(stream).once('end', function () {
        console.log('response end %s', uri)
      })
    })
    req.on('error', function (err) {
      stream.emit('error', err)
    })

    setTimeout(function () {
      if (!req._readableState.ended) req.destroy()
    }, 1000 * 60 * 5)
  }
}
