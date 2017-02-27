(function(exports){
exports.provideRules = function(addRule) {

addRule('copyright', function(line, i) {
  if (this.repository == 'NFD/integration-tests') {
    return;
  }

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
}, ['hpp', 'cpp', 'java']);

addRule('trailingws', function(line) {
  if (/\s+$/.test(line)) {
    this.comment('Trailing whitespace should be avoided.\n' +
                 'Execute `cp .git/hooks/pre-commit.sample .git/hooks/pre-commit` in your local clone, and git can warn about whitespace errors prior to committing.');
  }
}, ['hpp', 'cpp', 'py', 'sh']);

};
})(exports);
