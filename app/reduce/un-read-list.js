// var jsonpath = require('jsonpath')
var xtend = require('xtend')
var unReadList = []
var readMap = {} // key: entry.link, value: true
var focus = null // entry.link
// filter
var filteredList = []
var match = null
var selector = null

function _setUnReadList (action) {
  unReadList = unReadList.concat(action).reduce(r, [])
  function r (a, x) {
    if (a.map(x => x.link).indexOf(x.link) === -1) return a.concat(x)
    return a
  }
}

function _setFilteredList () {
  filteredList = unReadList.slice(0)
}

function _xtendUnReadList () {
  return filteredList.map(doesRead).map(doesFocus)
}

function _changeUnReadListFocus (n, data, update) {
  if (!filteredList.length) return
  if (focus == null) {
    focus = filteredList[0].link
    return update({
      unReadListFocus: focus,
      unReadList: _xtendUnReadList()
    })
  }

  for (var i = 0; i < filteredList.length; i++) {
    if (filteredList[i].link === focus) {
      focus = (filteredList[i + n] || {}).link
      if (focus == null) focus = filteredList[0].link
      return update({
        unReadListFocus: focus,
        unReadList: _xtendUnReadList()
      })
    }
  }

  focus = filteredList[0].link

  update({
    unReadListFocus: focus,
    unReadList: _xtendUnReadList()
  })
}

function doesRead (x) {
  var flg = readMap[x.link]
  return xtend({data: x, meta: {read: flg}})
}

function doesFocus (xx) {
  return xtend(xx, {
    meta: xtend(xx.meta, {
      focus: xx.data.link === focus
    })
  })
}

module.exports = {
  setUnReadList (data, action, update) {
    _setUnReadList(action)
    _setFilteredList()
    update({unReadList: _xtendUnReadList()})
  },
  setFilteredList (data, action, update) {
    if (action == null) {
      match = null
      selector = null
      _setFilteredList()
      return update({unReadList: _xtendUnReadList()})
    }

    match = (action.match || '').toLowerCase()
    selector = action.selector

    filteredList = unReadList.map(x => {
      if (typeof x[selector] !== 'string') return null
      if (x[selector].toLowerCase().indexOf(match) !== -1) return x
      return null
    }).filter(x => !!x)
    // console.log(filteredList)
    update({unReadList: _xtendUnReadList()})
  },
  setUnReadListToRead (data, action, update) {
    readMap[action] = true
    update({unReadList: _xtendUnReadList()})
  },
  setUnReadListFocus (data, action, update) {
    focus = action
    update({
      unReadListFocus: focus,
      unReadList: _xtendUnReadList()
    })
  },
  incUnReadListFocus (data, action, update) {
    _changeUnReadListFocus(+1, data, update)
  },
  decUnReadListFocus (data, action, update) {
    _changeUnReadListFocus(-1, data, update)
  }
}
