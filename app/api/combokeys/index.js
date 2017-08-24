var Combokeys = require('combokeys')

module.exports = function (emitter, getData) {
  var comb = new Combokeys(document.documentElement)

  comb.bind('v', () => {
    var link = getData().unReadEntriesFocus
    if (link == null) return noEntrySelected()

    emitter.emit('dom:openNewTab', getData().unReadEntriesFocus)
  })
  comb.bind('r', () => emitter.emit('ws:getUnReadList'))
  comb.bind('c', () => emitter.emit('toggleEntriesViewMode'))
  comb.bind('j', () => emitter.emit('incUnReadEntriesFocus'))
  comb.bind('k', () => emitter.emit('decUnReadEntriesFocus'))

  comb.bind('l', () => {
    var e = document.querySelector('#Entries')
    e && e.scrollBy(0, 300)
  })
  comb.bind('h', () => {
    var e = document.querySelector('#Entries')
    e && e.scrollBy(0, -300)
  })
  comb.bind('o', () => emitter.emit('storage:togglePinList'))
  comb.bind('p', () => {
    var data = getData()
    var link = data.unReadEntriesFocus

    if (link == null) return noEntrySelected()

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

  function help () {
    var link = getData().unReadListFocus
    emitter.emit('ws:getUnReadEntries', link)
    emitter.emit('getUnReadEntries', link)
    emitter.emit('setUnReadListToRead', link)
  }

  function noEntrySelected () {
    window.alert('No entry selected. Please select an entry.\nSpecifically, press "j" !!')
  }
}
