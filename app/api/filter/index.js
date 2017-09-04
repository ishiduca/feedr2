module.exports = function (emitter, getData) {
  emitter.on('filter:parse', v => {
    var str = v.trim()
    if (!str) return emitter.emit('setFilteredList', null)

    if (str.slice(0, 1) !== '$') str = '$title ' + str
    var b = str.split(' ').filter(Boolean)
    var selector = b.shift().slice(1)
    var match = b.join(' ')
    emitter.emit('setFilteredList', {selector: selector, match: match})
  })
}
