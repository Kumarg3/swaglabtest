import { RunnerHook } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const hook: RunnerHook = async (config) => {
  // Ensure Screenshots folder exists
  const screenshotsDir = path.join(config.rootDir!, 'Screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
};

export default hook;
