(function(exports){
exports.provideRules = function(addRule) {

addRule('copyright', function(line, i) {
  if (i == 0) {
    this.state = {
      found: false
    };
  }

  if (this.state.found) {
    return;
  }

  if (i == -1) {
    this.comment('Copyright boilerplate is missing.', 0);
  }

  var m = line.match(/Copyright \(c\) (?:\d{4}\-)?(\d{4})[ ,]/);
  if (m) {
    this.state.found = true;
    if (m[1] != new Date().getFullYear()) {
      this.comment('Copyright end year is not current.');
    }
  }
});

};
})(exports);
