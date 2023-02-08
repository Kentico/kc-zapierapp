# Publishing to zapier for Kontent.ai developers

1. Even though the zapier-cli is in devDependencies you need to install it globally to be able to login. 
    -  `npm install -g zapier-platform-cli`
1. Use `zapier login` and login with corresponding credentials
1. This will create a file `.zappierrc` somewhere in `C:\Users\{user}`
1. Login to https://developer.zapier.com/, click on your avatar and open settings. Navigate to deploy keys and copy it into your clipboard.
1. Open `.zappierrc` with your favourite editor and change the deploy key here with the one in your clipboard.
1. Now you should be ready to use `npm run buildAndPush`. Don't worry, this will push private version.