(function(exports){

var RULES = [];
function addRule(id, f) {
  RULES.push({ id:id, f:f });
}
// f(line, i)
// i: line index; 0 for begin of file, -1 for end of file
// line: line string
// this.id: rule id
// this.lines: all lines
// this.filename: filename, may be empty
// this.repository: repository remote address, may be empty
// this.state: (rw) internal state of rule checker
// this.comment(msg, [i]): add a comment on line i

require('./rules0').provideRules(addRule);
require('./rules1').provideRules(addRule);

function reviewFile(input, filename, repository) {
  var lines = input.split('\n');
  lines.unshift('');

  var comments = [];
  var i = 0;
  var currentRuleId = '';
  var commentFunc = function(msg, i2) {
    comments.push({
      line: typeof i2 == 'undefined' ? i : i2,
      rule: currentRuleId,
      msg: msg
    });
  };

  var contexts = RULES.map(function(rule){
    return {
      id: rule.id,
      f: rule.f,
      lines: lines,
      filename: filename,
      repository: repository,
      state: undefined,
      comment: commentFunc
    };
  });

  for (i = 0; i <= lines.length; ++i) {
    contexts.forEach(function(context){
      currentRuleId = context.id;
      context.f(lines[i] || '', i == lines.length ? -1 : i);
    });
  }

  return comments;
}

exports.RULES = RULES;
exports.reviewFile = reviewFile;
})(exports);
