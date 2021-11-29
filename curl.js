(function(exports){
var child_process = require('child_process');

function request(root, credentials, path, postbody, method) {
  return new Promise(function(resolve, reject){
    var args = ['-s', '-g'].concat(credentials);
    args.push('-A');
    args.push('yoursunny ndn-cxx-code-style');
    if (postbody) {
      args.push('-H');
      args.push('Content-Type: application/json');
      args.push('-T');
      args.push('-');
      args.push('-X');
      args.push(method || 'POST');
    }
    args.push(root + path);

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

exports.request = request;
})(exports);
