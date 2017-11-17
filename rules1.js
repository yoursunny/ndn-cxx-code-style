(function(exports){
exports.provideRules = function(addRule) {

addRule('1.1-1', function(line) {
  if (line[0] == '\t') {
    this.comment('Do not use tabs for indentation.');
  }
});

addRule('1.1-3', function(line, i) {
  if (i == 0) {
    this.state = {
      rawLiteralDelim: undefined
    };
  }
  if (!this.state.rawLiteralDelim) {
    var m = line.match(/R"([a-zA-Z]+)\(/);
    if (m) {
      this.state.rawLiteralDelim = m[1];
    }
  }
  if (!this.state.rawLiteralDelim && line.length > 130) {
    this.comment('Line should not exceed 130 columns. https://redmine.named-data.net/issues/2614\n' +
                 'Disregard if the line is a single literal or URI.');
  }
  if (this.state.rawLiteralDelim && line.indexOf(')' + this.state.rawLiteralDelim + '"') >= 0) {
    this.state.rawLiteralDelim = undefined;
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

  var m = line.match(/^( *)namespace( +)(\S+)( +){/);
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

addRule('1.6', function(line) {
  if (line.indexOf('} else') >= 0) {
    this.comment('There should be a newline between `}` and `else`.');
  }
});

[['1.6-if{', 'if'], ['1.6-else{', 'else'], ['1.7-{', 'for'], ['1.8-{', 'while'], ['1.9-{', 'do']].forEach(function(pair){
addRule(pair[0], function(line) {
  if (this.state && line.substr(0, this.state.length + 3) == this.state + '  {') {
    this.comment('GNU-style indentation of braces is not permitted.');
    return;
  }
  this.state = false;

  var m = line.match(/^(\s*)(\S+)/);
  if (m && m[2] == pair[1]) {
    this.state = m[1];
  }
});
});

addRule('1.10', function(line, i) {
  if (i == 0) {
    this.state = {
      openSwitches: []
    };
  }
  if (i == -1) {
    this.state.openSwitches.forEach(function(openSwitch){
      this.comment('`switch` closing `}` is not found at the correct indentation level.', openSwitch.i);
    }, this);
  }
  var m = line.match(/^(\s*)switch(\s*)\(/);
  if (m) {
    if (m[2] != ' ') {
      this.comment('There should be one whitespace before `switch` and `(`.');
    }
    this.state.openSwitches.unshift({i:i, indent:m[1], indent2:m[1]+'  '});
  }
  if (this.state.openSwitches.length) {
    var m = line.match(/^(\s*)case(\s*).*:(\s*{)?/);
    if (m) {
      if (m[1] != this.state.openSwitches[0].indent && m[1] != this.state.openSwitches[0].indent2) {
        this.comment('`case` is not at correct indentation level.');
      }
      else if (m[3] && m[1] != this.state.openSwitches[0].indent2) {
        this.comment('`case` must be indented if curly braces are used.');
      }
    }
    if (line == this.state.openSwitches[0].indent + '}') {
      this.state.openSwitches.shift();
    }
  }
});

addRule('1.11', function(line) {
  var m = line.match(/catch(\s*)(\([^)]+\))/);
  if (m) {
    if (m[1] != ' ') {
      this.comment('There should be one whitespace before `catch` and `(`.');
    }
    var pos = m[2].indexOf('&');
    if (pos >= 0) {
      if (m[2].substr(0, 7) != '(const ') {
        this.comment('Use constant reference.');
      }
      if (!/[ )]/.test(m[2].substr(pos + 1, 1))) {
        this.comment('There should be one whitespace after `&`.');
      }
    }
  }
});

addRule('1.15', function(line) {
  var m = line.match(/\[\s*\]\s*(?:\(\s*\)\s*)?\{\s*\}/);
  if (m && m[0] != '[]{}') {
    this.comment('No-op lambda should be shortened as `[]{}`.');
  }
  m = line.match(/\[[^\]]*\] (\s*\(\s*\)\s*)?\{/);
  if (m && m[1]) {
    this.comment('`()` should be omitted when lambda function has no parameters.');
  }
});

};
})(exports);
