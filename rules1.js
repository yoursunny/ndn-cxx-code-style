(function(exports){
exports.provideRules = function(addRule) {

addRule('1.1-1', function(line) {
  if (line[0] == '\t') {
    this.comment('Do not use tabs for indentation.');
  }
});

addRule('1.1-2', function(line) {
  var m = line.match(/^( *)/);
  if (m && (m[1].length % 2 != 0)) {
    this.comment('Indentation spacing is 2 spaces. This line has odd number of spaces.');
  }
});

addRule('1.1-3', function(line) {
  if (line.length > 130) {
    this.comment('Line should not exceed 130 columns. http://redmine.named-data.net/issues/2614');
  }
});

};
})(exports);
