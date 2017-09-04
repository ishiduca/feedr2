var domwh = require('domwh')

var SCROLL = {}
SCROLL.LINES = 240
SCROLL.PITCH_HEIGHT = 24
SCROLL.INTERVAL = 8

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

  emitter.on('dom:scrollUp', () => scroll(-SCROLL.PITCH_HEIGHT))
  emitter.on('dom:scrollDown', () => scroll(SCROLL.PITCH_HEIGHT))
  emitter.on('dom:focusFilterField', () => {
    document.querySelector('#FilterInput').focus()
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

  function scroll (pitch) {
    var e = document.querySelector('#Entries')
    if (!e) return console.warn('not found "#Entries"')

    var line = SCROLL.LINES
    var id = window.setInterval(() => {
      if (line < 0) return clear()
      e.scrollBy(0, pitch)
      line = line - Math.abs(pitch)
    }, SCROLL.INTERVAL)

    function clear () {
      window.clearInterval(id)
      id = null
    }
  }
}
