var url = require('url')
var path = require('path')
var xtend = require('xtend')
var trumpet = require('trumpet')
var hyperquest = require('hyperquest')
var missi = require('mississippi')

module.exports = findFeed

function findFeed (uri, _opt, done) {
  var opt = xtend(_opt)
  opt.headers || (opt.headers = {})
  opt.headers['user-agent'] || (opt.headers['user-agent'] = 'find-feed')

  var isEnded = false
  var feeds = []
  var u = url.parse(uri)
  var tr = trumpet()
  var req = hyperquest(uri, opt)

  tr.selectAll('link[rel^="alternat"]', function (link) {
    var buf = []
    missi.pipe(
      link.createReadStream({outer: true}),
      missi.through(function (r, _, done) {
        buf.push(r)
        done()
      }), function (err) {
        if (err) {
          return done(err)
        }

        var str = Buffer.isBuffer(buf[0])
          ? String(Buffer.concat(buf))
          : buf.join('')

        link.getAttribute('href', function (href) {
          link.getAttribute('type', function (type) {
            if (/\/(?:atom|rss|rdf)(?:\+xml)?$/.test(type)) {
              feeds.push({
                href: resolve(href),
                type: type,
                _: str
              })
            }
          })
        })
      }
    )
  })

  tr.once('end', function () {
    // console.log('!!tr ended')
    if (isEnded) return
    isEnded = true
    done(null, feeds)
  })

  req.once('error', done)
  tr.once('error', done)

  req.pipe(tr)

  function resolve (href) {
    var _ = url.parse(href)
    if (_.protocol && _.host) return href

    var p = path.join(u.pathname, _.path)
    return [u.protocol, '//', u.host, p].join('')
  }
}
