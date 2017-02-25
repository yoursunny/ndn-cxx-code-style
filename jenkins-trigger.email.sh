#!/bin/bash

touch jenkins-trigger.email.list
echo -n "$1,$2 "
if grep "$1,$2" jenkins-trigger.email.list >/dev/null; then
  echo PREVIOUSLY-EMAILED
  exit
fi
echo "$1,$2" >> jenkins-trigger.email.list
echo EMAILING

(
  echo 'Hi Eric'
  echo ''
  echo 'Can you manually trigger a Jenkins build for https://gerrit.named-data.net/'$1' patchset'$2'?'
  echo ''
  echo 'Thanks.'
  echo 'Yours, Junxiao'
) |\
mail -a 'Content-Type: text/plain; charset=utf-8' \
     -s 'Jenkin retrigger Change '$1 \
     $(echo LWMgYWFAY3MudWNsYS5lZHUgLWIgc2hpanVueGlhb0BlbWFpbC5hcml6b25hLmVkdSBlbmV3YmVycnlAZW1haWwuYXJpem9uYS5lZHUK | base64 -d)
