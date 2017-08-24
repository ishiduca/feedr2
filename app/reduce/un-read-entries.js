var xtend = require('xtend')
var entries = {}
var pinMap = {} // key: entry.link, value: true
var viewModeIsFull = true
var focus = null

module.exports = {
  setUnReadEntries (data, action, update) {
    if (action.length === 0) return
    var meta = action[0].meta || {}
    var link = meta.link
    var ents = entries[link] || []
    var keys = ents.map(entry => entry.link)
    entries[link] = ents.concat(action.filter(f))

    focus = null

    update({
      unReadEntriesFocus: focus,
      unReadEntries: entries[link].sort(sort).map(addPinToEntry)
    })

    function f (entry) {
      return keys.indexOf(entry.link) === -1
    }
  },
  getUnReadEntries (data, action, update) {
    if (!entries[action]) return
    focus = null
    update({
      unReadEntriesFocus: focus,
      unReadEntries: entries[action].sort(sort).map(addPinToEntry)
    })
  },
  toPinEntry (data, action, update) {
    pinMap[action] = true
    update({unReadEntries: data.unReadEntries.map(x => x.data).sort(sort).map(addPinToEntry)})
  },
  removePinEntry (data, action, update) {
    pinMap[action] = null
    update({unReadEntries: data.unReadEntries.map(x => x.data).sort(sort).map(addPinToEntry)})
  },
  setToPinEntries (data, action, update) {
    pinMap = action.reduce((p, entry) => {
      pinMap[entry.link] = true
      return pinMap
    }, pinMap)
  },
  showPinList (data, action, update) {
    update({pinList: action.sort(sort).map(addPinToEntry)})
  },
  hidePinList (data, action, update) {
    update({pinList: []})
  },
  toggleEntriesViewMode (data, action, update) {
    viewModeIsFull = !viewModeIsFull
    update({entriesViewModeIsFull: viewModeIsFull})
  },
  incUnReadEntriesFocus (data, action, update) {
    changeUnReadEntriesFocus(+1, data, update)
  },
  decUnReadEntriesFocus (data, action, update) {
    changeUnReadEntriesFocus(-1, data, update)
  }
}

function changeUnReadEntriesFocus (n, data, update) {
  if (!data.unReadEntries.length) return
  if (focus == null) {
    focus = data.unReadEntries[0].data.link
    return update({unReadEntriesFocus: focus})
  }

  for (var i = 0; i < data.unReadEntries.length; i++) {
    if (data.unReadEntries[i].data.link === focus) {
      if (data.unReadEntries[i + n]) {
        focus = data.unReadEntries[i + n].data.link
      }
      if (focus == null) focus = data.unReadEntries[0].data.link
      return update({unReadEntriesFocus: focus})
    }
  }
}

function sort (a, b) {
  var aa = a.date
  var bb = b.date
  return aa > bb ? 1 : aa < bb ? -1 : 0
}

function addPinToEntry (entry) {
  var flg = !!pinMap[entry.link]
  return xtend({data: entry, meta: {pin: flg}})
}
