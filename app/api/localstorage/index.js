var model = require('./model')
var levelup = require('levelup')
var localstorageDown = require('localstorage-down')
var pin = levelup('feedr:pin', {
  db: localstorageDown,
  valueEncoding: 'json'
})

module.exports = function (emitter, getData) {
  var api = model(pin)

  emitter.on('storage:togglePin', entry => {
    api.togglePin(entry).then(ent => {
      if (ent) emitter.emit('toPinEntry', ent.link)
      else emitter.emit('removePinEntry', entry.link)
    }).catch(err => emitter.emit('error', err))
  })

  emitter.on('storage:togglePinList', () => {
    var pinList = getData().pinList
    if (pinList.length === 0) {
      api.getEntries().then(entries => {
        emitter.emit('setToPinEntries', entries)
        emitter.emit('showPinList', entries)
      }).catch(err => emitter.emit('error', err))
    } else {
      emitter.emit('hidePinList')
    }
  })

  api.getEntries().then(entries => {
    emitter.emit('setToPinEntries', entries)
  }).catch(err => emitter.emit('error', err))
}
