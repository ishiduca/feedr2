var fs = require('fs')
var xtend = require('xtend')
var hyperquest = require('hyperquest')
var FeedParser = require('feedparser')
var missi = require('mississippi')
var split = require('split2')
// var iconv = require('iconv-lite')

module.exports = addFeed

function addFeed (uri, headers, file, done) {
  var rs = fs.createReadStream(file)
  var s = split()
  var opt = {headers: xtend(headers)}
  opt.headers['User-Agent'] = 'feedman'

  rs.once('close', function () { this.unpipe(s) })

  missi.pipe(
    rs, s, missi.through(function (r, _, d) {
      var u = String(r).split(/\t/)[0]
      if (u === uri) {
        rs.destroy()
        return d(new Error('registered uri [' + u + ']'))
      }
      d()
    }), function (err) {
      if (err) return done(err)
      else add()
    }
  )

  function add () {
    var feedparser = new FeedParser({addmeta: true})
    var req = hyperquest(uri, opt)
    var headers

    req.on('error', onError)
    req.once('response', res => {
      console.log('addFeed %s statuscode %s', uri, res.statusCode)
      if (String(res.statusCode).slice(0, 1) === '3' &&
          res.headers.location
      ) {
        console.log(res.headers)
        req.destroy()
        headers = xtend(opt.headers, {referer: uri})
        addFeed(res.headers.location, headers, file, done)
        return
      }
      if (res.statusCode !== 200) {
        req.destroy()
        done(new Error('StatusCodeError: statusCode ' + res.statusCode))
      }
    })
    req.once('close', () => {
      console.log(`!! close "${uri}"`)
      req.unpipe(feedparser)
    })

    req.pipe(feedparser)

    feedparser.on('error', onError)
    feedparser.on('meta', function (meta) {
      var encoding = meta['#xml'].encoding || 'UTF-8'
      var line = [uri, encoding, meta.title].join('\t')
      fs.appendFile(file, line + '\n', function (err) {
        if (err) return onError(err)
        else done(null, line)
      })
    })

    function onError (err) {
      req.destroy()
      done(err)
    }
  }
}
