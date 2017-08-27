var Combokeys = require('combokeys')
// var keymaps = require('../../configs/keymap')
var scrollLines = 240
var pitchHeight = 6
var scrollInteral = 8

module.exports = function (emitter, getData) {
  var comb = new Combokeys(document.documentElement)

  comb.bind('v', () => {
    var link = getData().unReadEntriesFocus
    if (link == null) alertNoEntrySelected()
    else emitter.emit('dom:openNewTab', link)
  })
  comb.bind('r', () => emitter.emit('ws:getUnReadList'))
  comb.bind('c', () => emitter.emit('toggleEntriesViewMode'))
  comb.bind('j', () => emitter.emit('incUnReadEntriesFocus'))
  comb.bind('k', () => emitter.emit('decUnReadEntriesFocus'))

  comb.bind('h', () => scroll(pitchHeight))
  comb.bind('l', () => scroll(-pitchHeight))

  function scroll (pitchHeight) {
    var e = document.querySelector('#Entries')
    if (!e) return console.warn('not found "#Entries"')

    var line = scrollLines
    var id = window.setInterval(() => {
      if (line < 0) return clear()
      e.scrollBy(0, pitchHeight)
      line = line - Math.abs(pitchHeight)
    }, scrollInteral)

    function clear () {
      window.clearInterval(id)
      id = null
    }
  }

  comb.bind('o', () => emitter.emit('storage:togglePinList'))
  comb.bind('p', () => {
    var data = getData()
    var link = data.unReadEntriesFocus

    if (link == null) return alertNoEntrySelected()

    data.unReadEntries.some(x => {
      if (x.data.link === link) {
        emitter.emit('storage:togglePin', x.data)
        return true
      }
    })
  })

  comb.bind('a', () => {
    emitter.emit('decUnReadListFocus')
    help()
  })
  comb.bind('s', () => {
    emitter.emit('incUnReadListFocus')
    help()
  })

  comb.bind('?', () => emitter.emit('toggleHelp'))

  function help () {
    var link = getData().unReadListFocus
    emitter.emit('ws:getUnReadEntries', link)
    emitter.emit('getUnReadEntries', link)
    emitter.emit('setUnReadListToRead', link)
  }

  function alertNoEntrySelected () {
    window.alert('No entry selected. Please select an entry.\nSpecifically, press "j" !!')
  }
}
