var xtend = require('xtend')
var unReadList = []
var readMap = {} // key: entry.link, value: true
var focus = null // entry.link

module.exports = {
  setUnReadList (data, action, update) {
//    unReadList = action
    unReadList = unReadList.concat(action).reduce(r, [])
    update({unReadList: unReadList.map(doesRead).map(doesFocus)})
  },
  setUnReadListToRead (data, action, update) {
    readMap[action] = true
    update({unReadList: unReadList.map(doesRead).map(doesFocus)})
  },
  setUnReadListFocus (data, action, update) {
    focus = action
    update({
      unReadListFocus: focus,
      unReadList: unReadList.map(doesRead).map(doesFocus)
    })
  },
  incUnReadListFocus (data, action, update) {
    changeUnReadListFocus(+1, data, update)
  },
  decUnReadListFocus (data, action, update) {
    changeUnReadListFocus(-1, data, update)
  }
}

function changeUnReadListFocus (n, data, update) {
  if (!unReadList.length) return
  if (focus == null) {
    focus = unReadList[0].link
    return update({
      unReadListFocus: focus,
      unReadList: unReadList.map(doesRead).map(doesFocus)
    })
//     return update({unReadList: unReadList.map(doesRead).map(doesFocus)})
  }

  for (var i = 0; i < unReadList.length; i++) {
    if (unReadList[i].link === focus) {
      focus = (unReadList[i + n] || {}).link
      if (focus == null) focus = unReadList[0].link
      return update({
        unReadListFocus: focus,
        unReadList: unReadList.map(doesRead).map(doesFocus)
      })
//      return update({unReadList: unReadList.map(doesRead).map(doesFocus)})
    }
  }
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

function r (a, x) {
  if (a.map(x => x.link).indexOf(x.link) === -1) return a.concat(x)
  return a
}
