var fs = require('fs')
var url = require('url')
var xtend = require('xtend')
var inherits = require('inherits')
var stream = require('readable-stream')
var split = require('split2')
var missi = require('mississippi')
// var hyperquest = require('hyperquest')
var FeedParser = require('feedparser')
var semaphore = require('./semaphore-stream')
var request = require('./request')

module.exports = Crawler
inherits(Crawler, stream.Readable)

function Crawler (opt) {
  if (!(this instanceof Crawler)) return new Crawler(opt)
  stream.Readable.call(this, { objectMode: true })
  this.maxSocket = opt.maxSocket || 3
  this.feedPath = opt.feedPath
  this.interval = opt.interval || 20 * 60 * 1000
  this.isCrawling = false
}

Crawler.prototype._read = function () {}

Crawler.prototype.crawl = function () {
  if (this.isCrawling) return

  this.isCrawling = true
  this.emit('beginCrawl')

  var me = this
  var m = {}

  missi.pipe(
    fs.createReadStream(this.feedPath),
    split(),
    missi.through.obj(function (line, _, done) {
      var b = String(line).split('\t')
      var u = url.parse(b[0])
      var h = u.host
      ;(m[h] || (m[h] = [])).push(b)
      done()
    }),
    function (err) {
      if (err) {
        me.isCrawling = false
        err.file = me.feedPath
        return me.emit('error', err)
      }

      _crawl()
    }
  )

  function _crawl () {
    var hosts = Object.keys(m).sort()
    var list = hosts.reduce(_reduce, [])
    var sem = semaphore(me.maxSocket, list)
    var kai = missi.through.obj()

    kai.on('end', () => console.log('!!!! kai ended'))
    sem.on('end', () => console.log('!!!! sem ended'))
    sem.on('finish', function () {
      console.log('!!! sem finish')
      me.isCrawling = false
      setTimeout(me.crawl.bind(me), me.interval)
      me.emit('finishCrawl')
    })

    missi.pipe(
      sem,
      missi.through.obj(function (uri, _, done) {
        missi.pipe(
          request(uri),
          new FeedParser(),
          missi.through.obj(function (entry, _, done) {
            me.push(xtend(entry, { uri: uri }))
            done()
          }),
          function (err) {
            if (err) {
              err.uri = uri
              me.emit('error', err)
            }
            setTimeout(function () {
              kai.write(uri)
              sem.semaphore.length || kai.end()
              // console.log('sem.semaphore.length "%d"', sem.semaphore.length)
            }, 5 * 1000)
          }
        )
        done()
      }),
      function (err) {
        if (err) me.emit('error', err)
        me.isCrawling = false
        if (!err) console.log('!!! sem ended ?')
      }
    )

    missi.pipe(kai, sem, function (err) {
      if (err) me.emit('error', err)
      me.isCrawling = false
      if (!err) console.log('!!! kai.pipe(sem) finished ?')
    })
  }

  function _reduce (x, host) {
    return x.concat(m[host])
  }
}

// function request (uri, _opt) {
//   var opt = xtend(_opt)
//   opt.headers || (opt.headers = {})
//   opt.headers['user-agent'] = 'feedman'
//   var hyp = hyperquest(uri, opt)
//   console.log('fetch start - %s', uri)
//   hyp.once('response', function (res) {
//     res.once('end', function () {
//       console.log('%s - %s ended', res.statusCode, uri)
//     })
//   })
//   hyp.once('request', function (req) {
//     req.once('timeout', function () {
//       console.log('req.timeout - %s', uri)
//       req.destroy()
//     })
//   })
//   return hyp
// }
