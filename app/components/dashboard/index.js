var html = require('buoyancy/html')
var css = require('sheetify')
var feedlist = require('./feedlist')
var entries = require('./entries')
var pinlist = require('./pinlist')
var help = require('./help')
var filterform = require('./filterform')

var prefix = css`
  :host {
    font-family: Tahoma,Arial,"ヒラギノ角ゴ Pro W3","Hiragino Kaku Gothic Pro",Osaka,"メイリオ",Meiryo,"ＭＳ Ｐゴシック","MS PGothic",sans-serif;
  }
  #FeedList {
    position: fixed;
    top: 0;
    left: 0;
    width: 298px;
    height: 100%;
    overflow-y: auto;
    z-index: 99;
    border-right: 2px solid #33aaff;
    background-color: rgba(254, 254, 254, .8);
  }
  #Entries {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    overflow-y: auto;
    overflow-x: auto;
    padding-left: 306px;
  }

  a:hover {
    background-color: #ffffaa;
  }
`

module.exports = function dashboard (data, params, route, actionsUp) {
  var el = html`
    <main role="application" class=${prefix}>
      ${feedlist(data, actionsUp)}
      ${entries(data, actionsUp)}
      ${filterform(data, actionsUp)}
      ${pinlist(data, actionsUp)}
      ${help(data, actionsUp)}
    </main>
  `
  return el
}
