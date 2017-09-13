'use strict'
var fs = require('fs')
var path = require('path')
var http = require('http')
var wsRouter = require('router-on-websocket-stream')
var websocket = require('websocket-stream')
// var missi = require('mississippi')
var ecstatic = require('ecstatic')(path.join(__dirname, 'static'))
var Crawler = require('crawler')
var model = require('model')

var feedPath = path.join(__dirname, 'feeds/feed.txt')
var dbPath = path.join(__dirname, 'dbs')

var api = model(dbPath)
var crawler = new Crawler({
  maxSocket: 3,
  feedPath: feedPath,
  interval: 20 * 60 * 1000
})

crawler.on('beginCrawl', () => {
  console.log('!! crawl begin', (new Date()).toUTCString())
  console.time('crawler.crawl')
})

crawler.on('finishCrawl', () => {
  console.log('!! crawl finish', (new Date()).toUTCString())
  console.timeEnd('crawler.crawl')
})

crawler.once('end', () => console.log('! craler ended'))
// craler.emit('error', ... でcrawlerが destroy() してしまうので..
// missi.pipe(
//   crawler,
//   api.addUnReadEntry(),
//   err => { err && onError(err) }
// )
crawler.on('error', onError).pipe(
  api.addUnReadEntry().on('error', onError)
    .on('unpipe', function (src) {
      console.log('!! crawler.unpipe(apiStream)')
      src.pipe(this)
      console.log('!! crawler repipe apiStream')
    })
)

crawler.crawl()

var app = module.exports = http.createServer(ecstatic)
var r = wsRouter()

r.add('getUnReadList', p => api.getUnReadList())
r.add('getUnReadEntries', p => api.getUnReadEntries(p.link))
r.add('doesReadEntry', p => api.doesReadEntry(p.entry))
r.add('doesReadEntries', p => api.doesReadEntries(p.entries))
// r.add('findUnReadList', p => api.findUnReadList(p))

websocket.createServer({server: app}, sock => {
  sock.pipe(r.route()).pipe(sock)
})

function onError (err) {
  var log = path.join(__dirname, 'log', String(Date.now()) + '.error')
  var str = String(err) + '\n\n' + err.stack
  if (err.uri) str += '\n  uri: ' + err.uri

  fs.writeFile(log, str, err => err && console.error(err))
  console.error(err)
//  console.log(crawler._readableState)
}
