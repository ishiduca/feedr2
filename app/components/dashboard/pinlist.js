var html = require('buoyancy/html')
var css = require('sheetify')

var prefix = css`
  :host {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9000;
    background-color: rgba(0, 0, 0, .8);
    overflow-y: auto;
  }
  :host>header {
    text-align: center;
    padding: 12px;
  }
  :host>heder h2,
  :host>heder h3,
  :host>heder h4 {
    margin: 6px;
    color: #ccbbaa;
  }
  :host>ol {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  :host>ol>li {
    margin: 6px;
  }
  :host>ol>li>a {
    display: inline-block;
    padding: 6px;
    background-color: #aaaaaa;
    border-radius: 1em;
  }
`

module.exports = function (data, actionsUp) {
  if (data.pinList.length === 0) return document.createTextNode('')

  return html`
    <section class=${prefix}>
      <header>
        <h2>Pins (${data.pinList.length})</h2>
      </header>
      <ol>${data.pinList.map(x => ent(x, data, actionsUp))}</ol>
    </section>
  `
}

function ent (entry, data, actionsUp) {
  return html`
    <li>
      <a
        href=${entry.data.link}
        rel='noopener noreferrer'
        target='_blank'
        onclick=${e => actionsUp('storage:togglePin', entry.data)}
      >
        ${entry.data.title || entry.data.link}
      </a>
    </li>
  `
}
