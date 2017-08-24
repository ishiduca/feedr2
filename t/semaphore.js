'use strict'
var test = require('tape')
var path = require('path')
var fs = require('fs')
var split = require('split2')
var missi = require('mississippi')
var hyperquest = require('hyperquest')
var FeedParser = require('feedparser')
var semaphore = require('crawler/semaphore-stream')

test('', t => {
  var arry = [
    ['https://hitsujiwool.tumblr.com/rss', 'UTF-8', 'hitsu-jiwool'],
    ['http://yokoshimanti.blog.fc2.com/?xml', 'UTF-8', '横島んち。のブログ。'],
    ['http://notebook.ke-ta.com/atom.xml', 'UTF-8', '自転車と南の島ノート'],
    ['http://dokurosan2.blog94.fc2.com/?xml', 'UTF-8', '闇に蠢く'],
    ['http://uruururuu2.blog35.fc2.com/?xml', 'UTF-8', 'うるう島リターンズ'],
    ['http://zveruga.tumblr.com/rss', 'UTF-8', 'CreamPie']
  ]

  var sem = semaphore(3, arry)
  var rs = missi.through.obj()

  sem.on('end', () => {
    t.ok(1)
    t.end()
  })

  missi.pipe(sem, missi.through.obj(function (uri, _, done) {

    missi.pipe(hyperquest(uri), new FeedParser(), missi.through.obj(function (ent, _, done) {
      console.log('%s [%s]', ent.title.replace(/\n|\r/g, ''), uri)
      done()
    }), err => {
      if (err) return console.log(err)
      rs.write(uri)
      if (!sem.semaphore.length) rs.end()
    })

    done()
  }), err => {
    if (err) return console.error(err)
    console.log('>>> sem._readableState.ended - "%s"', sem._readableState.ended)
  })

  rs.pipe(sem)
})
