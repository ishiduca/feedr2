var html = require('buoyancy/html')
var css = require('sheetify')

var prefix = css`
  :host {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 99;
    background-color: #33aaff;
    padding: 12px 0;
  }
  :host>form {
    text-align: center;
    padding: 6px;
  }
  :host input[type="search"] {
    width: 69em;
    line-height: 2em;
    border: 0;
  }
`

module.exports = function (data, actionsUp) {
  return html`
    <section id="FilterField" class=${prefix}>
      <form action="javascript:void(0)">
        <input
          id="FilterInput"
          type="search"
          placeholder="Find"
          oninput=${oninput}
        />
      </form>
    </section>
  `

  function oninput (e) {
    e.stopPropagation()
    actionsUp('filter:parse', e.target.value)
  }
}
