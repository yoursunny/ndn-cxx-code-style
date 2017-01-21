(function(exports){

var config = require('./config');
var extend = require('extend');
var child_process = require('child_process');

function request(path, postbody, method) {
  return new Promise(function(resolve, reject){
    var args = ['-s',
                '--digest', '--user', [config.GERRIT_USER, config.GERRIT_HTTPPASSWD].join(':')
               ];
    if (postbody) {
      args.push('-H');
      args.push('Content-Type: application/json');
      args.push('-T');
      args.push('-');
      args.push('-X');
      args.push(method || 'POST');
    }
    args.push(config.GERRIT_ROOT + path);

    var curl = child_process.spawn('curl', args,
      { stdio:[postbody?'pipe':'ignore', 'pipe', 'inherit'] });
    if (postbody) {
      curl.stdin.write(postbody);
      curl.stdin.end();
    }

    var body = '';
    curl.stdout.on('data', function(chunk){ body += chunk; });
    curl.on('close', function(){ resolve({ statusCode:299, body:body }); });
  });
}

function listChanges(query) {
  return request('/a/changes/?q=' + encodeURIComponent(query) + '&o=CURRENT_REVISION&o=CURRENT_FILES')
    .then(function(resp){
      var j = JSON.parse(resp.body.replace(/^\)]}'\n/, ''));
      return Promise.resolve(j);
    });
}

function fetchFiles(change) {
  if (!change.id) {
    return Promise.reject('change.id missing');
  }
  var currentRev = change.current_revision;
  if (!currentRev) {
    return Promise.reject('change.current_revision missing');
  }
  var revision = change.revisions[currentRev];
  if (!revision) {
    return Promise.reject('revision missing');
  }
  if (!revision.files) {
    return Promise.reject('revision.files missing');
  }

  return Promise.all(Object.keys(revision.files)
    .filter(function(filename){
      return revision.files[filename].status != 'D';
    })
    .map(function(filename){
      return request('/a/changes/' + change.id + '/revisions/' + currentRev + '/files/' + encodeURIComponent(filename) + '/content')
        .then(function(resp){
          var contents = new Buffer(resp.body, 'base64').toString('utf8');
          return Promise.resolve({ filename:filename, contents:contents });
        });
    }));
}

function postComments(change, fileComments) {
  var j = {
    labels: {},
    comments: {}
  };
  var nComments = 0;
  Object.keys(fileComments).forEach(function(filename){
    var comments = fileComments[filename];
    j.comments[filename] = comments.map(function(comment){
      ++nComments;
      return {
        line: comment.line,
        message: 'rule ' + comment.rule + '\n' + comment.msg
      };
    });
  });
  j.message = config.COVER_INFO;
  j.labels = { "Code-Style": (nComments > 0 ? -1 : +1) };

  if (config.GERRIT_DRYRUN) {
    console.log(JSON.stringify(j, null, 2));
    return Promise.resolve('OK');
  }
  else {
    return request('/a/changes/' + change.id + '/revisions/' + change.current_revision + '/review', JSON.stringify(j));
  }
}

exports.listChanges = listChanges;
exports.fetchFiles = fetchFiles;
exports.postComments = postComments;
})(exports);
