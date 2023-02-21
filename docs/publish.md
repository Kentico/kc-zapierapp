# Publishing to zapier for Kontent.ai developers

1. To login with zapier-cli, use prepared command `npm run zapier-login` and fill in your credentials.
1. This should create a deploy key in zapier, and locally it will create a file `.zappierrc` with the generated key.
1. Change the version in `package.json`.
1. Now you should be ready to use `npm run buildAndPush`. By default, if there is no version already at zapier this will push a new private version. If the publishing failed due to missing deploy key, continue with next step.

    > Note: If you forgot to change the version in `package.json` it running `npm run buildAndPush` override the existing integration! Be careful to not override the existing public

1. Login to https://developer.zapier.com/, click on your avatar and open settings. Navigate to deploy keys and copy it into your clipboard.
1. Open `.zappierrc` with your favourite editor and change the deploy key here with the one in your clipboard.
1. Now you should be able using `npm run buildAndPush` again.
