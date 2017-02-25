(function(exports){
var config = require('./config');
var curl = require('./curl');

var request = curl.request.bind(this, config.JENKINS_ROOT, ['--user', [config.JENKINS_USER, config.JENKINS_TOKEN].join(':')]);

function getJob(proj, params) {
  return request('/job/' + proj + '/api/json?' + params)
    .then(function(resp){
      var j = JSON.parse(resp.body);
      return Promise.resolve(j);
    });
}

function listBuildsByGerritChange(proj) {
  return getJob(proj, 'tree=builds[number,actions[parameters[name,value]]]')
    .then(function(j){
      var builds = [];
      j.builds.forEach(function(build){
        var gerritChange, gerritPatchset;
        build.actions.forEach(function(action){
          if (action._class != 'hudson.model.ParametersAction') {
            return;
          }
          action.parameters.forEach(function(parameter){
            if (parameter.name == 'GERRIT_CHANGE_NUMBER') {
              gerritChange = parameter.value;
            }
            else if (parameter.name == 'GERRIT_PATCHSET_NUMBER') {
              gerritPatchset = parameter.value;
            }
          });
        });
        if (!gerritChange || !gerritPatchset) {
          return;
        }
        builds.push({
          number: build.number,
          gerritChange: gerritChange,
          gerritPatchset: gerritPatchset
        });
      });
      return Promise.resolve(builds);
    });
}

exports.getJob = getJob;
exports.listBuildsByGerritChange = listBuildsByGerritChange;
})(exports);
