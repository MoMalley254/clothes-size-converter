# Contributing

Bug reports and pull requests are welcome. This file covers running the tests and cutting a release.

## Running the tests

Tests use [Jest](https://jestjs.io) and live in `src/__tests__/`.

```bash
npm install
npm test                # run the suite
npm run test:coverage   # also print coverage and enforce the thresholds
npm run test:types      # type-check index.d.ts
```

- Converter tests (`shirt`, `trouser`, `dress`, `shoe`, `mapSizeToUS`) check each public function, including its error strings.
- `lookups.test.js` tests the shared lookup module against a small fixture chart, so it does not depend on brand data.
- `data.test.js` validates every JSON chart: `[min, max]` ranges in cm, allowed measurement keys per garment, and sizes ordered smallest to largest.
- `index.test.js` checks that every garment is exported with the same API.

Coverage thresholds (95% statements, lines and functions, 90% branches) are set in the `jest` block of `package.json`.

`npm run test:types` compiles `types/check.ts` against `index.d.ts`. It includes `@ts-expect-error` lines that must keep failing to compile.

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on every pull request:

- **Test**: `npm ci` then `npm run test:coverage` on Node 18, 20, 22 and 24. The coverage report from the Node 22 run is uploaded as a build artifact.
- **Type definitions**: `npm run test:types`.
- **CI passed**: a single summary check. Require this one in branch protection (Settings → Branches) so the Node matrix can change without editing the rule.

## Releasing

Releases are published by GitHub Actions using [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC), so no npm token or one-time code is needed. From an up-to-date `main` with a clean working tree:

```bash
npm version patch          # or minor / major; bumps package.json and creates the tag
git push --follow-tags
```

Pushing a `v*.*.*` tag runs `.github/workflows/publish.yml`, which:

1. checks that the tag matches `package.json`, that the commit is on `main`, and that the version is not already on npm;
2. runs the tests and the type check;
3. publishes to npm with provenance (after approval, if the `npm` environment has required reviewers);
4. creates a GitHub release with generated notes.

A version with a suffix, such as `1.1.0-beta.1`, is published under the `next` dist-tag and marked as a pre-release, so `npm install` keeps resolving to the last stable version.

The trusted publisher is configured on npmjs.com (package → Settings → Trusted Publisher → GitHub Actions) with user `MoMalley254`, repository `clothes-size-converter`, workflow `publish.yml`, environment `npm`, and allowed action "Allow npm publish". The workflow file name and environment name must match those settings exactly.
