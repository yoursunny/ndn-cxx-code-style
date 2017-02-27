(function(exports){
exports.provideRules = function(addRule) {

addRule('3.30', function(line, i) {
  if (/^ *virtual/.test(line)) {
    this.state = i;
  }
  if (/;/.test(line) || /^\s*\{\s*$/.test(this.lines[i + 1])) {
    if (this.state > 0) {
      var m = line.match(/(override|final)($|;)/);
      if (m) {
        this.comment('`virtual` should not be used with `' + m[1] + '`', this.state);
      }
    }
    this.state = 0;
  }
});

};
})(exports);
