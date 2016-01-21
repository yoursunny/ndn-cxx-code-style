module.exports = {
  GERRIT_ROOT: 'http://gerrit.named-data.net',
  GERRIT_USER: 'username',
  GERRIT_HTTPPASSWD: 'passw0rd',
  GERRIT_DRYRUN: false,
  COVER_GOOD: 'I only reviewed code-style and didn\'t find obvious issues.\n<https://github.com/yoursunny/ndn-cxx-code-style>',
  COVER_BAD: 'I only reviewed code-style and found some possible issues.\n<https://github.com/yoursunny/ndn-cxx-code-style>',
  COVER_REGEX: /ndn-cxx-code-style/,
  RECENT_DAYS: 7
};
