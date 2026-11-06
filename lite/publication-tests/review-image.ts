import type { Page, TestInfo } from '@playwright/test';

export async function reviewImage(page: Page, info: TestInfo, name: string) {
  if (process.env.SAMMAKKO_CAPTURE === name) {
    await page.screenshot({path: info.outputPath(name), animations: 'disabled'});
  }
}
