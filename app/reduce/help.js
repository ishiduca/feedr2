var flg = false
var help = {
  a: 'go to previous feed',
  s: 'go to next feed',
  j: 'go to next entry',
  k: 'go to previous entry',
  h: 'scroll down',
  l: 'scroll up',
  f: 'jump to find form',
  v: 'open link',
  c: 'show article / hide article (description)',
  o: 'show pin list',
  p: 'to pin / remove pin',
  r: 'update feed list',
  '?': 'show help / hide help'
}

module.exports = {
  toggleHelp (data, action, update) {
    flg = !flg
    if (flg) update({help: help})
    else update({help: null})
  }
}
