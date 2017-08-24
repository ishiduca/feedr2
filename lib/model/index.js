// var url = require('url')
var sub = require('subleveldown')
var levelup = require('levelup')
var missi = require('mississippi')

module.exports = function (dbPath) {
  var db = levelup(dbPath)
  var read = sub(db, 'read')
  var unread = sub(db, 'unread', {valueEncoding: 'json'})
  var api = {}

  api.addUnReadEntry = function () {
    return missi.through.obj(function addUnReadEntry (entry, _, done) {
      var id = entry.link

      function put () {
        unread.put(id, entry, done)
      }

      read.get(id, function (err, x) {
        if (err && err.notFound) {
          unread.get(id, function (err, x) {
            if (err && err.notFound) put()
            else {
              if (err) done(err)
              else {
                if (x && (x.date === entry.data)) done()
                else put()
              }
            }
          })
        } else {
          if (err) err.data = JSON.stringify(entry, null, 2)
          done(err)
        }
      })
    })
  }

  api.getUnReadList = function getUnReadList () {
    return new Promise(function (resolve, reject) {
      var map = {}
      var titles = {}
      missi.pipe(
        unread.createValueStream(),
        missi.through.obj(function (entry, _, done) {
          if (!entry.meta || !entry.meta.link) {
            return done(new Error('notfound "entry.meta.link" '))
          }

          var link = entry.meta.link
          ;(map[link] || (map[link] = [])).push(entry)
          if (!titles[link]) titles[link] = entry.meta.title || 'no title'
          done()
        }),
        function (err) {
          if (err) return reject(err)
          var links = Object.keys(map).sort()
          var list = links.map(function (link) {
            return {
              length: map[link].length,
              title: titles[link],
              link: link
            }
          })
          resolve(list)
        }
      )
    })
  }

  api.getUnReadEntries = function getUnReadEntries (link) {
    return new Promise(function (resolve, reject) {
      var list = []
      missi.pipe(
        unread.createValueStream(),
        missi.through.obj(function (entry, _, done) {
          if (!entry.meta || !entry.meta.link) {
            return done(new Error('notfound "entry.meta.link" '))
          }

          if (link === entry.meta.link) list.push(entry)
          done()
        }),
        function (err) {
          err ? reject(err) : resolve(list)
        }
      )
    })
  }

  api.doesReadEntry = doesReadEntry

  function doesReadEntry (entry) {
    return new Promise(function (resolve, reject) {
      var id = entry.link
      read.put(id, '1', function (err) {
        if (err) return reject(err)
        unread.del(id, function (err) {
          if (err) return reject(err)
          else resolve(entry)
        })
      })
    })
  }

  api.doesReadEntries = function doesReadEntries (entries) {
    return entries.map(doesReadEntry)
  }

  return api
}
