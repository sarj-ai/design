# Sarj Design

Public component and color scheme library for Sarj, published as the
`@sarj/design` Astro/Starlight package with a live contract reference at
[design.sarj.ai](https://design.sarj.ai/).

## Development

Use Node 24 and npm 12. Install and verify both independently locked projects:

```sh
npm run install:locked
npm run check
```

The publishable package lives in `packages/design`. The private reference site
lives in `apps/docs-ui` and consumes the latest released package exactly as an
external consumer does.

## Releases

Package releases are created from `design-v*` tags by the protected npm
trusted-publishing workflow. Site deployments are built once on `main` and
promoted through the protected Cloudflare production environment.

Security reports are handled according to [SECURITY.md](SECURITY.md).
