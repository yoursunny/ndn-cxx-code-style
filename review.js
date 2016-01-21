(function(exports){

var RULES = [];
function addRule(id, f, fileTypes) {
  fileTypes = fileTypes || ['hpp', 'cpp']
  RULES.push({ id:id, f:f, fileTypes:fileTypes });
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
require('./rules2').provideRules(addRule);

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
      rule: rule,
      lines: lines,
      filename: filename,
      repository: repository,
      state: undefined,
      comment: commentFunc
    };
  });

  var fileType = filename.split('.');
  fileType = fileType[fileType.length - 1];
  for (i = 0; i <= lines.length; ++i) {
    contexts.forEach(function(context){
      currentRuleId = context.id;
      if (context.rule.fileTypes.indexOf(fileType) < 0) {
        return;
      }
      context.rule.f.call(context, lines[i] || '', i == lines.length ? -1 : i);
    });
  }

  return comments;
}

exports.RULES = RULES;
exports.reviewFile = reviewFile;
})(exports);
