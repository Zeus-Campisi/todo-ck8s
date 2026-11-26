# My Todo Cloud K8s App

Deploy and Run applications with Docker, Kubernetes, and Rancher Udemy Course.

Starter app for Todo Cloud Kubernetes deployment.

## Application toolchain

The Node.js services and Angular frontend require Node.js 24.15 or newer. The
repository's `.nvmrc` selects Node.js 24.15.0. Each service has its own
`package.json` and lockfile; run `npm ci` from the directory of the service
you want to work on. For the frontend:

```bash
cd todo-view
npm ci
npm start
```

Run its production build and tests with `npm run build` and
`npm test -- --watch=false`. The cache service tests can be run with
`npm test` from `todo-cache-service`.