var dateFormat = require('date-format');
var config = require('./config');
var gerrit = require('./gerrit');
var jenkins = require('./jenkins');
var child_process = require('child_process');

var minDate = new Date();
minDate.setDate(minDate.getDate() - config.RECENT_DAYS);
var after = dateFormat.asString('yyyy-MM-dd hh:mm:ss O', minDate);
var maxDate = new Date();
maxDate.setTime(maxDate.getTime() - config.JENKINS_TOLERANCE_SECONDS * 1000);
var before = dateFormat.asString('yyyy-MM-dd hh:mm:ss O', maxDate);

gerrit.listChanges('is:watched is:open label:Verified=0 after:"' + after + '" before:"' + before + '"')
.then(function(changes){
  var changeByJob = {};
  changes.forEach(function(change){
    var jenkinsJob = config.JENKINS_JOBS[change.project];
    if (!jenkinsJob) {
      return;
    }
    if (!changeByJob[jenkinsJob]) {
      changeByJob[jenkinsJob] = [];
    }
    changeByJob[jenkinsJob].push(change);
  });

  return Promise.all(Object.keys(changeByJob).map(function(jenkinsJob){
    return jenkins.listBuildsByGerritChange(jenkinsJob)
    .then(function(builds){
      var untriggeredBuilds = changeByJob[jenkinsJob].filter(function(change){
        var revision = change.revisions[change.current_revision];
        return !builds.some(function(build){
          return build.gerritChange == change._number && build.gerritPatchset == revision._number;
        });
      });
      return Promise.resolve(untriggeredBuilds);
    });
  }));
})
.then(function(untriggeredBuildsByJob){
  return Promise.resolve([].concat.apply([], untriggeredBuildsByJob));
})
.then(function(untriggeredBuilds){
  return Promise.all(untriggeredBuilds.map(callEmailScript));
})
.catch(console.warn);

function callEmailScript(change) {
  var revision = change.revisions[change.current_revision];

  return new Promise(function(resolve, reject){
    var bash = child_process.spawn('bash', ['./jenkins-trigger.email.sh', change._number, revision._number], { stdio:'inherit' });
    bash.on('close', resolve);
  });
}
