module.exports = function (emitter, getData) {
  emitter.on('update', (el) => {
    var focuses = document.querySelectorAll('.focus')
    focuses && [].forEach.apply(focuses, [f => f.scrollIntoView(true)])

    if (getData().unReadEntriesFocus == null) {
      document.querySelector('#Entries').scroll(0, 0)
    }
  })

  emitter.on('dom:openNewTab', link => {
    if (link == null) return

    var a = document.createElement('a')
    a.href = link
    a.target = '_blank'
    var e = document.createEvent('MouseEvents')
    e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    if (!a.dispatchEvent(e)) {
      emitter.emit('error', new Error('can not new tab. uri[' + link + ']'))
    }
  })
}
