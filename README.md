# Auto Deploy Delight

Connect this project directly to my connected GitHub account and use my existing repository. Push all generated files to the `main` branch automatically. Keep GitHub synchronized after every change.

Generate or update a production-ready GitHub Actions workflow that automatically builds and deploys this project to GitHub Pages on every push to `main`, with support for `workflow_dispatch`.

Before pushing:

- Verify the project builds successfully.

- Regenerate `package-lock.json` if needed so it matches `package.json`.

- Ensure dependencies install successfully.

- Fix any build or deployment errors automatically.

- Configure the correct build output directory and GitHub Pages base path.

- Ensure React/Vite routing and assets work correctly after deployment.

After pushing, verify that the GitHub Pages deployment succeeds and that the website is live without requiring any manual changes.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9bbda710-5166-4433-ae3f-8acb8ceb90cb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
