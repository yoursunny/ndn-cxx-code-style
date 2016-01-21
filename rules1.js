(function(exports){
exports.provideRules = function(addRule) {

addRule('1.1-1', function(line) {
  if (line[0] == '\t') {
    this.comment('Do not use tabs for indentation.');
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
  if (i == -1) {
    this.state.openNamespaces.forEach(function(openNs){
      this.comment('Matching namespace close comment is not found.', openNs.i);
    }, this);
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
});

addRule('1.4', function(line, i) {
  if (i == 0) {
    this.state = {
      openClasses: []
    };
  }
  if (i == -1) {
    this.state.openClasses.forEach(function(openCls){
      this.comment('Class closing `};` is not found at the correct indentation level.', openCls.i);
    }, this);
  }

  var m = line.match(/^(\s*)clas[s]\s+([^\s;]+)\s*(;?)/);
  if (m) {
    if (m[3] == ';') {
      // This is a forward declaration.
      return;
    }
    this.state.openClasses.push({ i:i, indent:m[1], foundOpen:false,
                                  lastProtection:-1, hasProtectionLoosen:false });
  }

  if (this.state.openClasses.length == 0) {
    return;
  }
  var innerCls = this.state.openClasses[this.state.openClasses.length - 1];
  if (line.substr(0, innerCls.indent.length) != innerCls.indent) {
    return;
  }
  var unindented = line.substr(innerCls.indent.length);

  if (unindented[0] == '{') {
    innerCls.foundOpen = true;
  }

  if (/^};/.test(unindented)) {
    this.state.openClasses.pop();
    if (!innerCls.foundOpen) {
      this.comment('Class opening `{` is not found at the correct indentation level.', innerCls.i);
    }
    return;
  }

  m = unindented.match(/^(\s*)(publi[c]|protecte[d]|privat[e]):/);
  if (m) {
    if (m[1]) {
      this.comment('Do not indent access specifier.');
    }
    var pl = ['public', 'protected', 'private'].indexOf(m[2]);
    if (pl < innerCls.lastProtection) {
      if (innerCls.hasProtectionLoosen) {
        this.comment('Access specifiers should be ordered as public-protected-private and cannot interleave.');
      }
      else {
        innerCls.hasProtectionLoosen = true;
      }
    }
    innerCls.lastProtection = pl;
  }
});

};
})(exports);
