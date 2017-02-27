(function(exports){
exports.provideRules = function(addRule) {

addRule('3.2', function(line, i) {
  if (i == 0) {
    this.state = {
      ifndef: -1,
      define: -1,
      endif: -1,
      name: ''
    };
  }
  if (i == -1) {
    if (this.state.ifndef < 0) {
      this.comment('Include guard is missing.', 0);
      return;
    }
    if (this.state.define < 0) {
      this.comment('#define is not found.', this.state.ifndef);
    }
    if (this.state.endif < 0) {
      this.comment('#endif is not found or has wrong comment format.', this.state.ifndef);
    }
  }
  var m = line.match(/^#(ifndef|define|endif \/\/) ([A-Z_]+)/);
  if (!m) {
    return;
  }
  if (this.state.ifndef < 0 && m[1] == 'ifndef') {
    this.state.ifndef = i;
    this.state.name = m[2];
  }
  else if (this.state.define < 0 && m[1] == 'define' && m[2] == this.state.name) {
    this.state.define = i;
    var filename = this.filename.split('/');
    filename = filename[filename.length - 1];
    var guardName = '_' + filename.replace(/[^0-9a-z]/gi, '_').toUpperCase();
    if (m[2].substr(m[2].length - guardName.length) != guardName) {
      this.comment('Include guard name should end with `' + guardName + '`.');
    }
  }
  else if (this.state.endif < 0 && m[1] == 'endif //' && m[2] == this.state.name) {
    this.state.endif = i;
  }
}, ['hpp']);

addRule('3.20', function(line, i) {
  if (/[=,]\s*NULL\s*[,);]/.test(line)) {
    this.comment('Use `nullptr`.');
  }
});

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

addRule('3.31', function(line, i) {
  var m = line.match(/^\s*throw\s+(std::[a-z_]+|[a-zA-Z:]*(?:Error|Exception))/);
  if (m) {
    this.comment('Use `BOOST_THROW_EXCEPTION`.\nDisregard if ' + m[1] + ' does not inherit from std::exception.');
  }
});

};
})(exports);
