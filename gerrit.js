(function(exports){

var config = require('./config');
var extend = require('extend');
var child_process = require('child_process');

function request(path) {
  return new Promise(function(resolve, reject){
    var curl = child_process.spawn('/usr/bin/curl',
      ['-s',
       '--digest', '--user', [config.GERRIT_USER, config.GERRIT_HTTPPASSWD].join(':'),
       config.GERRIT_ROOT + path
      ],
      { stdio:['ignore', 'pipe', 'inherit'] });
    var body = '';
    curl.stdout.on('data', function(chunk){ body += chunk; });
    curl.on('close', function(){ resolve({ statusCode:299, body:body }); });
  });
}

function listChanges(proj) {
  return request('/a/changes/?q=status:open+project:' + proj + '&o=CURRENT_REVISION&o=CURRENT_FILES')
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

  return Promise.all(Object.keys(revision.files).map(function(filename){
    return request('/a/changes/' + change.id + '/revisions/' + currentRev + '/files/' + encodeURIComponent(filename) + '/content')
      .then(function(resp){
        var contents = new Buffer(resp.body, 'base64').toString('utf8');
        return Promise.resolve({ filename:filename, contents:contents });
      });
  }));
}

exports.listChanges = listChanges;
exports.fetchFiles = fetchFiles;
})(exports);
