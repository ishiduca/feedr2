var inject = require('reconnect-core')
var websocket = require('websocket-stream')
var router = require('router-on-websocket-stream')
var loc = window.location
var uri = [ loc.protocol.replace('http', 'ws'), '//', loc.host ].join('')

module.exports = function (emitter) {
  var r = router()
  var reconnect = inject(uri => websocket(uri))
  var re = reconnect({}, ws => {
    ws.once('close', () => emitter.emit('notif', 'wsProxy closed'))
    ws.once('end', () => {
      ws.unpipe(r)
      r.unpipe(ws)
    })
    ws.on('error', err => emitter.emit('error', err))
    r.pipe(ws).pipe(r, {end: false})
  })

  var getUnReadList = r.method('getUnReadList')
  var getUnReadEntries = r.method('getUnReadEntries')
  var doesReadEntry = r.method('doesReadEntry')

  r.on('error', err => emitter.emit('error', err))
  re.on('error', err => emitter.emit('error', err))
  getUnReadList.on('error', err => emitter.emit('error', err))
  getUnReadEntries.on('error', err => emitter.emit('error', err))
  doesReadEntry.on('error', err => emitter.emit('error', err))

  emitter.on('ws:getUnReadEntries', link => {
    getUnReadEntries.write({link: link})
  })
  emitter.on('ws:getUnReadList', () => {
    getUnReadList.write({getUnReadList: true})
  })

  getUnReadList.on('data', unReadList => {
    emitter.emit('setUnReadList', unReadList)
  })
  getUnReadEntries.on('data', unReadEntries => {
    emitter.emit('setUnReadEntries', unReadEntries)
    unReadEntries.forEach(ent => {
      doesReadEntry.write({entry: ent})
    })
  })

  re.on('connect', () => {
    getUnReadList.write({getUnReadList: true})
  })
  re.on('disconnect', err => {
    err && emitter.emit('error:reconnectDisconnectError', err)
  })
  re.on('reconnect', (n, delay) => {
    emitter.emit('notif', `reconnect ${n} times, delay: ${delay}`)
  })

  re.connect(uri)
}
