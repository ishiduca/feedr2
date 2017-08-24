var html = require('buoyancy/html')
var css = require('sheetify')

var prefix = css`
  :host {}
  :host ol, :host ul {
    padding: 0;
    margin: 0 0 120px;
  }
  :host li {
    list-style-type: none;
    border-bottom: solid 1px #33aaff;
  }
  :host li.focus {
    font-weight: bold;
  }
  :host li div {
    display: block;
    padding: 6px 3px 5px 3px;
    clear: both;
    cursor: pointer;
  }
  :host li div.read {
    color: #aaaaaa;
  }
  :host li div.unread {
    color: #0000ff;
  }
`

module.exports = function (data, actionsUp) {
  return html`
    <section id="FeedList" class=${prefix}>
      <ol>
        ${data.unReadList.map(x => li(x))}
      </ol>
    </section>
  `

  function li (x) {
    return x.meta.focus
      ? html`<li class="focus">${button(x)}</li>`
      : html`<li>${button(x)}</li>`
  }

  function button (x) {
    return html`<div
       class=${x.meta.read ? 'read' : 'unread'}
       onclick=${e => onclick(e, x.data.link)}
      >
        ${x.data.title} (${x.data.length})
      </div>`

    function onclick (e, link) {
      e.stopPropagation()
      actionsUp('ws:getUnReadEntries', link)
      actionsUp('getUnReadEntries', link)
      actionsUp('setUnReadListToRead', link)
      actionsUp('setUnReadListFocus', link)
    }
  }
}
