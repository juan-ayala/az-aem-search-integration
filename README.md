# Real-Time Search Indexing with AEM Events & App Builder

Streamline search indexing in your AEM projects with real-time updates. [This post](https://www.theaemmaven.com/post/real-time-search-indexing-with-aem-events-app-builder) explores how AEM Events and Adobe App Builder can integrate with external search engines, ensuring content changes are quickly reflected in search results. It’s a scalable, efficient approach to keeping search experiences up to date.

## Setup

- Copy the `.dist.env` file to `.env`.
- Fill in the values following the comments on the env file.
- This file must **not** be committed to source control

## Local Dev

- `aio app run` to start your local Dev server
- App will run on `localhost:9080` by default

## Test & Coverage

- Run `aio app test` to run unit tests for ui and actions

## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

## Config

### `app.config.yaml`

- Main configuration file that defines an application's implementation. 
- More information on this file, application configuration, and extension configuration 
  can be found [here](https://developer.adobe.com/app-builder/docs/guides/appbuilder-configuration/#appconfigyaml)

#### Action Dependencies

- You have two options to resolve your actions' dependencies:

  1. **Packaged action file**: Add your action's dependencies to the root
   `package.json` and install them using `npm install`. Then set the `function`
   field in `app.config.yaml` to point to the **entry file** of your action
   folder. We will use `webpack` to package your code and dependencies into a
   single minified js file. The action will then be deployed as a single file.
   Use this method if you want to reduce the size of your actions.

  2. **Zipped action folder**: In the folder containing the action code add a
     `package.json` with the action's dependencies. Then set the `function`
     field in `app.config.yaml` to point to the **folder** of that action. We will
     install the required dependencies within that directory and zip the folder
     before deploying it as a zipped action. Use this method if you want to keep
     your action's dependencies separated.

## Debugging in VS Code

While running your local server (`aio app run`), both UI and actions can be debugged, to do so open the vscode debugger
and select the debugging configuration called `WebAndActions`.
Alternatively, there are also debug configs for only UI and each separate action.

## Typescript support for UI

To use typescript use `.tsx` extension for react components and add a `tsconfig.json` 
and make sure you have the below config added
```
 {
  "compilerOptions": {
      "jsx": "react"
    }
  } 
```
