var html = require('buoyancy/html')
var css = require('sheetify')
var xtend = require('xtend')
var sanitize = require('sanitize-html')
var timeago = require('timeago.js')

var prefix = css`
  :host {}
  :host>div {
    padding: 9px;
  }
  :host>div.focus {
    padding: 0;
    border: 9px dashed #ffaa00;
  }
  :host>div>div {
    padding: 3px;
  }
  :host>div>div.isPinned {
    background-color: #ffdd77;
  }
  :host header {
    border-bottom: 3px dashed #00aaff;
    margin: 6px 0;
  }
  :host header.isHide {
  }
  :host header.isFull {
  }
  :host header h3, :host header h4, :host header h5 {
    margin: 0;
    padding: 0;
  }

  :host header.isHide ul,
  :host header.isHide ol {
    margin: 0;
    padding : 0;
    list-style-type: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
  }
  :host header.isHide li {
    padding: 0 3px;
  }
  :host article {
    padding: 3px;
  }
`

module.exports = function (entry, data, actionsUp) {
  return html`
    <li class=${prefix}>
      ${addViewModeOfEntries(data.unReadEntriesFocus, entry, data, actionsUp)}
    </li>
  `
}

function addViewModeOfEntries (unReadEntriesFocus, entry, data, actionsUp) {
  var isFocus = unReadEntriesFocus === entry.data.link ? 'focus' : 'unFocus'
  return html`
    <div class=${isFocus}>
      ${addIsPinned(entry.meta.pin, entry, data, actionsUp)}
    </div>
  `
}

function addIsPinned (pinned, entry, data, actionsUp) {
  var isPinned = pinned ? 'isPinned' : 'isUnPinned'
  return html`
    <div class=${isPinned}>
      ${addHeader(data.entriesViewModeIsFull, entry, data, actionsUp)}
      ${addArticle(data.entriesViewModeIsFull, entry, data, actionsUp)}
    </div>
  `
}

function addHeader (entriesViewModeIsFull, entry, data, actionsUp) {
  var isViewMode = entriesViewModeIsFull ? 'isFull' : 'isHide'
  return html`
    <header class=${isViewMode}>
      <div>
        <h3>${entry.data.title || 'no title'}</h3>
      </div>
      <ul>
        <li>${buttonPin(entry.meta.pin, entry, actionsUp)}</li>
        <li>${timeago().format(entry.data.date)}</li>
        <li>${entry.data.author || 'some'}</li>
        <li>
          <a href=${entry.data.link}
            target='_blank'
            rel='noopener noreferrer'
          >
            ${entry.data.link}
          </a>
        </li>
      </ul>
    </header>
  `
}

function buttonPin (isPinned, entry, actionsUp) {
  return html`
    <button class='pinButton'
      onclick=${e => onclick(e)}
    >
      ${isPinned ? 'remove pin' : 'to pin'}
    </button>
  `

  function onclick (e) {
    e.stopPropagation()
    actionsUp('storage:togglePin', entry.data)
  }
}

function addArticle (entriesViewModeIsFull, entry, data, actionsUp) {
  return (entriesViewModeIsFull !== false)
    ? dangerouslySetInnerHTML(entry.data.description)
    : document.createTextNode('')
}

function dangerouslySetInnerHTML (description) {
  if (!description) return document.createTextNode('not found description :(')
  var e = document.createElement('article')
  var opt = xtend(sanitize.defaults)
  opt.allowedTags = opt.allowedTags.concat('img')
  e.innerHTML = sanitize(description, opt)
  return e
}
