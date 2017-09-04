var xtend = require('xtend')
var buoyancy = require('buoyancy')
var app = buoyancy({
  unReadListFocus: null,
  unReadEntriesFocus: null,
  entriesViewModeIsFull: true,
  help: null,
  filterField: null,
  pinList: [],
  unReadList: [],
  unReadEntries: []
})

app.reduce(xtend(
  require('./reduce/help'),
  require('./reduce/un-read-list'),
  require('./reduce/un-read-entries')
))

app.use(require('./api/combokeys'))
app.use(require('./api/websocket'))
app.use(require('./api/localstorage'))
app.use(require('./api/logger'))
app.use(require('./api/dom'))
app.use(require('./api/filter'))

app.route('/', require('./components/dashboard'))

document.body.appendChild(app('/'))
