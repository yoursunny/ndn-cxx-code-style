(function(exports){
exports.provideRules = function(addRule) {

addRule('2.3', function(line, i) {
  var m = line.match(/^namespace (\S+)/);
  if (!m) {
    return;
  }

  if (/[A-Z]/.test(m[1]) && !['CryptoPP'].includes(m[1])) {
    this.comment('Namespace name should be all lowercase.');
  }
});

};
})(exports);
