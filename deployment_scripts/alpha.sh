rm -rf /dist/.*
REVISION=$(git rev-parse HEAD)
RELEASE=ALPHA_$(git rev-parse --short HEAD)
echo $RELEASE
echo $REVISION
NODE_ENV=alpha RELEASE=$RELEASE webpack --config ./config/webpack.config.prod.js --progress
curl https://sentry.io/api/0/organizations/tabtor/releases/ \
  -X POST \
  -H 'Authorization: Bearer c369e3ce3af2454bad96cc9d85722f7a7bf8b8892ddd4e3189b8158498dcd374' \
  -H 'Content-Type: application/json' \
  -d '
  {
    "version": "'$RELEASE'",
    "refs": [{
        "repository":"PrazAs/student-app-web",
        "commit": "'$REVISION'"
    }],
    "projects":["student-web-app"]
}
';
for file in dist/js/*
do
  curl https://app.getsentry.com/api/0/projects/tabtor/student-web-app/releases/$RELEASE/files/ -u fe1e2ed8096f4ff8bce7a5e22b1c9a5c: -X POST -F file=@$file -F name=$file
done
cp -vr static/* dist/ 
mv -v dist/index.prod.html dist/index.html
sed -i -e s/app.min.js/app.min.$RELEASE.js/g dist/index.html 
sed -i -e s/ENV_RELEASE/$RELEASE/g dist/index.html 
sed -i -e s/ENV_ENVIRONMENT/alpha/g dist/index.html 
gzip -r -9 dist/
for f in `find dist/ -iname '*.gz'`; do
  mv $f ${f%.gz} 
done
aws s3 sync dist/ s3://studentapp-alpha.hellothinkster.com --content-encoding gzip --cache-control public,max-age=30672000