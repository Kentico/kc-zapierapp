# Publishing to zapier for Kontent.ai developers

1. To login with zapier-cli, use prepared command `npm run zapier-login` and fill in your credentials.
1. This should create a deploy key will create a file `.zappierrc` with it. Now you should be ready to use `npm run buildAndPush`. Don't worry, this will push private version. If it failed due to deploy key reason, continue with next step.
1. Login to https://developer.zapier.com/, click on your avatar and open settings. Navigate to deploy keys and copy it into your clipboard.
1. Open `.zappierrc` with your favourite editor and change the deploy key here with the one in your clipboard.
1. Now you should be able using `npm run buildAndPush` again. 