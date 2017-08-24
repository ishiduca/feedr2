var html = require('buoyancy/html')
var css = require('sheetify')
var addEntry = require('./entry')

var prefix = css`
  :host {}
  :host>header {
    border-bottom: 3px solid #33aaff;
  }
  :host>ol {
    list-style-type: none;
    margin: 0;
    padding: 6px 0 500px 0;
  }
  :host>header p {
    font-size: x-small;
  }
`

module.exports = function (data, actionsUp) {
  if (data.unReadEntries.length === 0) {
    return html`<section id='Entries'><p>:(</p></section>`
  }

  return html`
    <section id='Entries' class=${prefix}>
      <header>
        <h2>
          <a
            rel='noopener noreferrer'
            target='_blank'
            href=${data.unReadEntries[0].data.meta.link}
          >
            ${
              data.unReadEntries[0].data.meta.title ||
              data.unReadEntries[0].data.meta.link
            }
          </a>
        </h2>
        ${data.unReadEntries[0].data.description &&
          html`<p>${data.unReadEntries[0].data.description}</p>`
        }
      </header>
      <ol>${data.unReadEntries.map(x => addEntry(x, data, actionsUp))}</ol>
    </section>
  `
}
