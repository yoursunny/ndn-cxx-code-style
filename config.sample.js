module.exports = {
  GERRIT_ROOT: 'https://gerrit.named-data.net',
  GERRIT_USER: 'username',
  GERRIT_HTTPPASSWD: 'passw0rd',
  GERRIT_DRYRUN: false,
  COVER_INFO: '<https://github.com/yoursunny/ndn-cxx-code-style>',
  RECENT_DAYS: 30,
  JENKINS_ROOT: 'http://jenkins.named-data.net',
  JENKINS_USER: 'username@example.com',
  JENKINS_TOKEN: 'c87cfcddedffcb3fbf439c7ef82ae259',
  JENKINS_TOLERANCE_SECONDS: 1800,
  JENKINS_JOBS: {
    'ndn-cxx': 'ndn-cxx',
    'NFD': 'NFD',
    'ndn-tools': 'ndn-tools',
  }
};
