(function(exports){
exports.provideRules = function(addRule) {

addRule('copyright', function(line, i) {
  if (this.repository == 'NFD/integration-tests') {
    return;
  }

  if (i == 0) {
    this.state = {
      found: false,
      commentStart: false
    };
  }

  if (this.state.found) {
    return;
  }

  if (i == -1) {
    this.comment('License boilerplate is missing.', 0);
  }

  if (/^\/[*]+$/.test(line)) {
    this.state.commentStart = {i:i, line:line};
  }

  var m = line.match(/Copyright \([cC]\) (?:\d{4}\-)?(\d{4})[ ,]/);
  if (m) {
    this.state.found = true;
    if (m[1] != new Date().getFullYear()) {
      this.comment('Copyright end year is not current.');
    }

    if (['ndn-cxx', 'NFD', 'ndn-tools'].includes(this.repository)) {
      if (this.state.commentStart.line == '/**') {
        this.comment('License boilerplate should start with /* instead of /**.', this.state.commentStart.i);
      }
    }
  }
}, ['hpp', 'cpp', 'java']);

addRule('trailingws', function(line) {
  if (/\s+$/.test(line)) {
    this.comment('Trailing whitespace should be avoided.\n' +
                 'Execute `cp .git/hooks/pre-commit.sample .git/hooks/pre-commit` in your local clone, and git can warn about whitespace errors prior to committing.');
  }
}, ['hpp', 'cpp', 'py', 'sh']);

addRule('trailingwsmd', function(line) {
  if (/\s$/.test(line) && !/\S  $/.test(line)) {
    this.comment('Trailing whitespace should be avoided, except two spaces producing a <br>.');
  }
}, ['md']);

addRule('ndncxx-common', function(line, i) {
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

addRule('redmine-http', function(line) {
  if (line.indexOf('http://redmine.named-data.net') >= 0) {
    this.comment('Use `https://redmine.named-data.net`.');
  }
});

addRule('include-self', function(line, i) {
  if (i == 0) {
    this.state = {
      hasOtherInclude: false
    };
  }

  var m = line.match(/^#include ["<]([^>]+)[">]$/);
  if (!m) {
    return;
  }

  var filename = this.filename.split('/');
  filename = filename[filename.length - 1].replace(/(?:\.t)?\.cpp$/, '.hpp').replace(/^test\-/, '');
  if (m[1] != filename && !m[1].endsWith('/' + filename)) {
    this.state.hasOtherInclude = true;
  }
  else if (this.state.hasOtherInclude) {
    this.comment('Implementation/test file should include the corresponding header before other includes, to ensure the header compiles on its own.');
  }
}, ['cpp']);

};
})(exports);
