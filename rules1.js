(function(exports){
exports.provideRules = function(addRule) {

addRule('1.1-1', function(line) {
  if (line[0] == '\t') {
    this.comment('Do not use tabs for indentation.');
  }
});

addRule('1.1-2', function(line) {
  var m = line.match(/^( *)([*]?)/);
  if (!m) {
    return;
  }
  if (m[2] == '*') {
    // This is probably a multi-line comment.
    return;
  }
  if (m[1].length % 2 != 0) {
    this.comment('Indentation spacing is 2 spaces. This line has odd number of spaces.');
  }
});

addRule('1.1-3', function(line) {
  if (line.length > 130) {
    this.comment('Line should not exceed 130 columns. http://redmine.named-data.net/issues/2614');
  }
});

addRule('1.3', function(line, i) {
  if (i == 0) {
    this.state = {
      openNamespaces: [] // { ns:"example", i: }
    };
  }

  var m = line.match(/^( *)namespace( +)(\S+)( +){$/);
  if (m) {
    if (m[1] != '') {
      this.comment('Namespace declaration should not be indented.');
    }
    if (m[2] != ' ' || m[4] != ' ') {
      this.comment('Only one space should be used around namespace name.');
    }
    this.state.openNamespaces.push({ ns:m[3], i:i });
  }

  m = line.match(/^( *)}( +)\/\/( +)namespace( +)(\S+)$/);
  if (m) {
    if (m[1] != '') {
      this.comment('Namespace declaration should not be indented.');
    }
    if (m[2] != ' ' || m[3] != ' ' || m[4] != ' ') {
      this.comment('Only one space should be used around `// namespace`.');
    }
    if (this.state.openNamespaces.length == 0) {
      this.comment('Matching namespace open declaration is not found.');
    }
    else {
      var innerNs = this.state.openNamespaces.pop();
      if (innerNs.ns != m[5]) {
        this.comment('Namespace name does not match open declaration on line ' + innerNs.i + '.');
      }
    }
  }

  if (i == -1) {
    this.state.openNamespaces.forEach(function(openNs){
      this.comment('Matching namespace close comment is not found.', openNs.i);
    }, this);
  }
});

};
})(exports);
