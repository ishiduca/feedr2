var html = require('buoyancy/html')
var css = require('sheetify')
// var onload = require('on-load')

var prefix = css`
  :host {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: rgba(245, 245, 245, .8);
    cursor: pointer;
  }
  :host>header {
    text-align: center;
    padding: 12px;
  }
  :host>header h2,
  :host>header h3,
  :host>header h4 {
    margin: 6px;
    color: #aaaaaa;
  }
  :host>dl {
    margin: 12px 200px;
    border: 3px solid #888888;
    border-radius: 3em;
    padding: 2em 2em 2em 3em;
  }
  :host dt {
    font-weight: bold;
  }
`

module.exports = function (data, actionsUp) {
  if (data.help == null) return document.createTextNode('')

  return html`
    <section id="help" class=${prefix} onclick=${onclick}>
      <header>
        <h4>keyboard short cut help</h4>
      </header>
      <dl>
        ${Object.keys(data.help).map(key => html`
          <div>
            <dt>${key}</dt>
            <dd>${data.help[key]}</dd>
          </div>
        `)}
      </dl>
    </section>
  `

  function onclick (e) {
    e.stopPropagation()
    actionsUp('toggleHelp')
  }
}
