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

addRule('ndncxxcommon', function(line, i) {
  if (this.repository == 'ndn-cxx') {
    return;
  }
  if (i == 0) {
    this.state = {
      disabled: false
    };
  }
  if (/namespace\s+ndn\s*{/.test(line)) {
    this.state.disabled = true;
  }
  if (this.state.disabled) {
    return;
  }

  if (/\bndn::(shared_ptr|unique_ptr|weak_ptr|make_shared|enable_shared_from_this|static_pointer_cast|dynamic_pointer_cast|const_pointer_cast|function|bind|ref|cref|noncopyable)\b/.test(line)) {
    this.comment('Aliases imported in ndn-cxx/common.hpp should not be used outside of ndn-cxx.\n' +
                 'https://redmine.named-data.net/issues/2098');
  }
});

addRule('redminehttp', function(line) {
  if (line.indexOf('http://redmine.named-data.net') >= 0) {
    this.comment('Use `https://redmine.named-data.net`.');
  }
});

};
})(exports);
