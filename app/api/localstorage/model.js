module.exports = function model (db) {
  var api = {}

  api.togglePin = function (entry) {
    return new Promise(function (resolve, reject) {
      db.get(entry.link, function (err, ent) {
        if (err && !err.notFound) return reject(err)
        if (ent) remove(ent, resolve, reject)
        else put(entry, resolve, reject)
      })
    })
  }

  function put (entry, resolve, reject) {
    db.put(entry.link, entry, function (err) {
      if (err) reject(err)
      else resolve(entry)
    })
  }

  function remove (entry, resolve, reject) {
    db.del(entry.link, function (err) {
      if (err) reject(err)
      else resolve(null)
    })
  }

  api.getEntries = function () {
    return new Promise(function (resolve, reject) {
      var entries = []
      db.createValueStream()
        .on('error', reject)
        .on('data', function (entry) {
          entries.push(entry)
        })
        .once('end', function () {
          resolve(entries)
        })
    })
  }

  return api
}
