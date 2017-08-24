module.exports = function (emitter) {
  emitter.on('*', function (params) {
    var ev = this.event
    console.log('this.event - %s', ev)
    if (/error/i.test(ev)) {
      console.error(params)
    } else {
      console.log(params)
    }
  })
}
