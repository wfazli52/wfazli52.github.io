# Publish this portfolio on GitHub Pages

The website files are ready for the GitHub account `wfazli52`. The connected GitHub app can upload files to an existing repository, but it cannot create the first repository or change the Pages publishing setting.

## One-time repository setup

1. On GitHub, create a new **public** repository named exactly `wfazli52.github.io`.
2. Leave the repository empty if GitHub gives you that option. A README is also okay.
3. Make sure the ChatGPT GitHub app is allowed to access the new repository.
4. Return to the ChatGPT conversation and say: `The repository is created.`

After that, ChatGPT can upload the website files to the repository.

## One-time Pages setting

After the files are uploaded:

1. Open the repository's **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/(root)`.
5. Save.

The intended public address is:

```text
https://wfazli52.github.io/
```

## Privacy check before publishing

The current site uses the public GitHub handle and GitHub profile link. It does not publish the email address returned by the connected GitHub account. Add a professional email, real name, location, or LinkedIn URL in `config.js` only when you want those details public.
