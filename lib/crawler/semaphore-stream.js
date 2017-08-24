var url = require('url')
var stream = require('readable-stream')
var inherits = require('inherits')

module.exports = SemaphoreStream
inherits(SemaphoreStream, stream.Duplex)

function SemaphoreStream (maxSockets, pool) {
  if (!(this instanceof SemaphoreStream)) {
    return new SemaphoreStream(maxSockets, pool)
  }
  stream.Duplex.call(this, {objectMode: true})
  this.maxSockets = maxSockets || 3
  this.pool = pool
  this.semaphore = []
}

SemaphoreStream.prototype._read = function (size) {
  this.pushURI()
}

SemaphoreStream.prototype.pushURI = function () {
  if (this.semaphore.length >= this.maxSockets) return
  for (var i = 0; i < this.pool.length; i++) {
    var uri = this.pool[i][0]
    var u = url.parse(uri)
    var host = u.host
    if (this.semaphore.indexOf(host) === -1) {
      this.semaphore.push(host)
      this.pool = this.pool.filter(function (x) {
        return uri !== x[0]
      })
      this.push(uri)
      this.pool.length || this.push(null)
      return
    }
  }
}

SemaphoreStream.prototype._write = function (uri, _, done) {
  this.semaphore = this.semaphore.filter(f)
  this.pushURI()
  done()

  function f (host) { return host !== url.parse(uri).host }
}
