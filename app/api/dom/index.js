var domwh = require('domwh')

module.exports = function (emitter, getData) {
  emitter.on('update', onResizeAndOnUpdate)
  window.addEventListener('resize', onResizeAndOnUpdate)

  emitter.on('dom:openNewTab', link => {
    if (link == null) return

    var a = document.createElement('a')
    a.href = link
    a.target = '_blank'
    var e = document.createEvent('MouseEvents')
    e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    if (!a.dispatchEvent(e)) {
      emitter.emit('error', new Error(`can not new tab. uri[${link}]`))
    }
  })

  function entriesReWidth () {
    var $entries = document.querySelector('#Entries')
    var windowWidth = domwh.window(window)[0]
    $entries.style.width = (windowWidth - 318) + 'px'
  }

  function onResizeAndOnUpdate () {
    entriesReWidth()

    var fcss = document.querySelectorAll('.focus')
    fcss && [].forEach.apply(fcss, [f => f.scrollIntoView(true)])

    if (getData().unReadEntriesFocus == null) {
      document.querySelector('#Entries').scroll(0, 0)
    }
  }
}
