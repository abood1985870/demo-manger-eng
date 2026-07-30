import { expect, test } from '@playwright/test';

test('production login page serves its JavaScript and CSS assets', async ({ page, request }) => {
  const response = await page.goto('/login');
  expect(response?.ok()).toBeTruthy();
  const assets = await page.locator('link[rel="stylesheet"], script[src]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute(node.tagName === 'LINK' ? 'href' : 'src')).filter(Boolean));
  expect(assets.length).toBeGreaterThan(0);
  for (const asset of assets) {
    const assetResponse = await request.get(asset!);
    expect(assetResponse.ok(), `${asset} must be served by production standalone`).toBeTruthy();
  }
});
