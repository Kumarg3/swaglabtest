# SwagLab Playwright Test Automation

Automated E2E testing for SauceDemo's SwagLab application using Playwright with TypeScript, featuring encrypted credentials, video recording, and comprehensive artifact management.

## 🚀 Features

- **Cross-browser testing** - Chromium, Firefox, WebKit
- **TypeScript** - Type-safe test code
- **Encrypted credentials** - AES-256 encryption for sensitive data
- **Video recording** - Full test execution videos (WebM format)
- **Screenshot capture** - Timestamped screenshots at key test points
- **HTML reports** - Interactive test reports with embedded assets
- **Timestamped artifacts** - Organized test results with historical preservation
- **CI/CD ready** - GitHub Actions integration for automated testing

## 📋 Project Structure

```
SwagLab/
├── .github/workflows/
│   └── playwright.yml          # GitHub Actions CI/CD pipeline
├── config/
│   └── credentials.ts          # Encrypted credential management (AES-256)
├── hooks/
│   └── setup.ts                # Playwright setup hooks
├── tests/
│   ├── Navigate.spec.ts        # Login and checkout tests
│   └── AddAllItems.spec.ts     # Full cart checkout test
├── Screenshots/                # Timestamped screenshot folders
│   └── [DDMMYY_HHMMSS]/
├── Videos/                     # Timestamped video folders
│   └── [DDMMYY_HHMMSS]/
├── Reports/                    # Timestamped HTML reports
│   └── [DDMMYY_HHMMSS]/
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
├── archiveReports.ts          # Report archival utility
└── organizeVideos.ts          # Video organization utility
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- Git
- Windows 10+ (or Linux/macOS with appropriate adjustments)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Kumarg3/swaglabtest.git
cd SwagLab
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Playwright browsers**
```bash
npx playwright install
```

4. **Configure credentials** (optional)
Edit `config/credentials.ts` to update encrypted credentials as needed.

## 🔐 Security

### Encrypted Credentials
Credentials are encrypted using **AES-256-CBC** with SHA-256 key derivation:

- **Default credentials stored in:** `config/credentials.ts`
- **Encrypted format:** `IV:ENCRYPTED_DATA` (base64-encoded)
- **Access at runtime:** Use `getCredentials()` function

```typescript
import { getCredentials } from './config/credentials';

const { username, password } = getCredentials();
// Credentials are only decrypted at runtime
```

## 🧪 Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npx playwright test tests/Navigate.spec.ts
```

### Run with headed browser
```bash
npx playwright test --headed
```

### Run with debug mode
```bash
npx playwright test --debug
```

### Generate and view HTML report
```bash
npm run show:report
```

## 📊 Test Artifacts

### Organization Structure
All test artifacts are organized by execution timestamp (format: `DDMMYY_HHMMSS`):

```
Screenshots/
├── DDMMYY_HHMMSS/          # Test run folder
│   ├── DDMMYY_HHMMSS_Login_PASS.png
│   ├── DDMMYY_HHMMSS_Checkout_PASS.png
│   └── ...

Videos/
├── DDMMYY_HHMMSS/
│   └── DDMMYY_HHMMSS_video.webm

Reports/
├── DDMMYY_HHMMSS/
│   ├── index.html          # Interactive HTML report
│   └── data/              # Report assets (screenshots, videos)
```

### Post-Test Utilities

**Archive reports:**
```bash
npx ts-node archiveReports.ts
```

**Organize videos:**
```bash
npx ts-node organizeVideos.ts
```

## 🔄 CI/CD Pipeline

GitHub Actions automatically:

1. **On every push/PR:**
   - Checks out code
   - Installs dependencies  
   - Installs Playwright browsers
   - Runs all tests
   - Organizes videos and reports
   - Uploads artifacts (30-day retention)
   - Comments on PRs with test results

2. **Scheduled daily runs:**
   - Runs at 2 AM UTC
   - Maintains historical test data

### View Pipeline
- Go to: https://github.com/Kumarg3/swaglabtest/actions
- Click on any workflow run to see results, logs, and artifacts

## 📝 Test Files

### Navigate.spec.ts
- **Test 1:** Login to SauceDemo
- **Test 2:** Login and checkout single item (Bike Light)
- **Features:** Encrypted credentials, screenshots, report attachment

### AddAllItems.spec.ts
- **Test:** Add all 6 items to cart and complete checkout
- **Features:** Full video recording, multiple checkpoints, random checkout info
- **Artifacts:** 5 checkpoint screenshots + full test video

## 📈 Playwright Configuration

- **Browser:** Chromium (configurable in `playwright.config.ts`)
- **Video:** Enabled for all tests (WebM format)
- **Screenshots:** On failure + key test points
- **Trace:** On first retry
- **Timeout:** 30 seconds per test
- **Retries:** 0 (configurable)

## 🐛 Troubleshooting

### Credentials not decrypting
- Check `config/credentials.ts` encryption key
- Verify environment variable is set (if using custom key)

### No screenshots in reports
- Ensure `embedAssets: true` in `playwright.config.ts`
- Check screenshot directory permissions

### Videos not organizing
- Run: `npx ts-node organizeVideos.ts` manually
- Verify `test-results/` directory exists

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify SauceDemo site is accessible

## 📦 Dependencies

- **@playwright/test** - Test framework
- **typescript** - Type safety
- **Node.js built-ins** - crypto, fs, path for encryption & file management

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [SauceDemo Application](https://www.saucedemo.com)

## 👤 Author

Kumar G (kumarg3)  
Email: fastkumar09@gmail.com

## 📄 License

Private Repository - All rights reserved

---

**Last Updated:** April 4, 2026  
**Test Framework:** Playwright v1.40+  
**TypeScript:** v5.0+
