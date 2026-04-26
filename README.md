# Sixpack TypeScript Playwright Sample

This sample shows how to turn Playwright UI journeys into reusable test-data flows and expose selected flows as Sixpack generators.

It demonstrates two levels:

- `createCustomer`: a simple exported Playwright flow that uses only the built-in `page` fixture.
- `createApprovedCustomer`: a wrapped flow using `definePlaywrightFlow(...)`, flow-level defaults, a role page, and injected operator credentials.

## Run The Sample

Install dependencies:

```sh
npm install
npx playwright install chromium
```

Run the Playwright tests:

```sh
npm test
```

The tests run headed and slowed down by default so the flow is visible. They start the local demo app automatically.

To watch the tests run against a visible local app, start the app in one terminal:

```sh
npm run dev
```

Then run:

```sh
npm test
```

Playwright reuses the running app outside CI. If no app is running, it starts one automatically.

For headless CI runs:

```sh
npm run test:ci
```

To run flows from the CLI, keep the app running in one terminal:

```sh
npm run dev
```

Then run:

```sh
npm run flow:list
npm run flow:inspect
npm run flow:generate
```

## Run As Sixpack Generators

Create `config/` files and a `.env` file from `.env.example`, then set:

- `SIXPACK_ACCOUNT`
- `SIXPACK_AUTH_TOKEN`
- `SIXPACK_CLIENT_CERT_PATH`
- `SIXPACK_CLIENT_KEY_PATH`
- `SIXPACK_ENVIRONMENT`
- `SIXPACK_URL`

Start the demo app:

```sh
npm run dev
```

Validate the adapter contract:

```sh
npm run adapter:validate
```

Start the supplier:

```sh
npm run start:supplier
```

The approved customer generator includes a stock template with omitted optional fields. The flow fills those fields with unique values at runtime, so the same flow works from Playwright tests, the flow CLI, and Sixpack generator execution.
