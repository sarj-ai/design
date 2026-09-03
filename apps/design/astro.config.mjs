import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

import cloudflareArtifacts from './src/integrations/cloudflare-artifacts.ts';

export default defineConfig({
  site: 'https://design.sarj.ai',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  markdown: { syntaxHighlight: 'prism' },
  security: {
    csp: {
      directives: [
        "base-uri 'self'",
        "connect-src 'self' https://cloudflareinsights.com",
        "default-src 'none'",
        "font-src 'self'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "img-src 'self' data:",
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: [
          { resource: "'self'", kind: 'element' },
          { resource: 'https://static.cloudflareinsights.com', kind: 'element' },
        ],
      },
      styleDirective: { resources: [{ resource: "'unsafe-inline'", kind: 'attribute' }] },
    },
  },
  integrations: [
    starlight({
      title: 'Sarj Design',
      description: 'Public component and color scheme library for Sarj.',
      favicon: '/favicon.svg',
      logo: {
        alt: 'Sarj',
        dark: './public/sarj-logo-dark.png',
        light: './public/sarj-logo-light.png',
        replacesTitle: true,
      },
      disable404Route: true,
      customCss: ['@sarj/design/starlight.css', './src/styles/global.css'],
      sidebar: [
        { label: 'About', link: '/' },
        { label: 'Components', link: '/components/' },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/sarj-ai/design' }],
      pagefind: false,
      tableOfContents: false,
      credits: false,
      components: {
        PageTitle: '@sarj/design/PageAnchor.astro',
        Search: './src/components/NoSearch.astro',
      },
    }),
    cloudflareArtifacts(),
  ],
});
