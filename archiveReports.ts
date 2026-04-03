import * as fs from 'fs';
import * as path from 'path';

// Extract report timestamp from screenshot folders or filenames
function getReportTimestampFromScreenshots(): string | null {
  const screenshotsDir = path.join(__dirname, 'Screenshots');
  
  if (fs.existsSync(screenshotsDir)) {
    const items = fs.readdirSync(screenshotsDir);
    
    // First priority: Look for timestamped folders (DDMMYY_HHMMSS format)
    const timestampedFolders = items.filter(item => {
      const itemPath = path.join(screenshotsDir, item);
      return fs.statSync(itemPath).isDirectory() && /^\d{6}_\d{6}$/.test(item);
    }).sort().reverse(); // Sort reverse to get most recent first
    
    if (timestampedFolders.length > 0) {
      return timestampedFolders[0]; // Return most recent timestamp
    }
    
    // Fallback: Extract from flat .png filenames if no timestamped folders
    const pngFiles = items.filter(f => f.endsWith('.png'));
    if (pngFiles.length > 0) {
      // Extract timestamp from first screenshot filename
      // Format: DDMMYY_HHMMSS_TestName_STATUS.png
      const match = pngFiles[0].match(/^(\d{6}_\d{6})_/);
      if (match) {
        return match[1];
      }
    }
  }
  
  return null;
}

// Utility function to generate timestamp in DDMMYY_HHMMSS format (fallback only)
function getTimestamp(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const hh = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${dd}${mm}${yy}_${hh}${mins}${ss}`;
}

// Get report timestamp
function getReportTimestamp(): string {
  // First priority: Extract from screenshot filenames
  const screenshotTimestamp = getReportTimestampFromScreenshots();
  if (screenshotTimestamp) {
    console.log(`Using timestamp from screenshots: ${screenshotTimestamp}`);
    return screenshotTimestamp;
  }
  
  // Fallback: Generate new timestamp
  console.log('No screenshots found, generating new timestamp');
  return getTimestamp();
}

// Function to move and rename reports
function archiveReports(): void {
  const timestamp = getReportTimestamp();
  const reportsDir = path.join(__dirname, 'playwright-report');
  const reportsArchiveDir = path.join(__dirname, 'Reports', timestamp);
  
  if (fs.existsSync(reportsDir)) {
    // Create Reports directory if it doesn't exist
    const reportsDirParent = path.join(__dirname, 'Reports');
    if (!fs.existsSync(reportsDirParent)) {
      fs.mkdirSync(reportsDirParent, { recursive: true });
    }
    
    // Create timestamped folder
    if (!fs.existsSync(reportsArchiveDir)) {
      fs.mkdirSync(reportsArchiveDir, { recursive: true });
    }
    
    // Copy entire report folder to timestamped location
    function copyDirSync(src: string, dest: string) {
      const files = fs.readdirSync(src);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      files.forEach((file: string) => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        if (fs.statSync(srcFile).isDirectory()) {
          copyDirSync(srcFile, destFile);
        } else {
          fs.copyFileSync(srcFile, destFile);
        }
      });
    }
    
    copyDirSync(reportsDir, reportsArchiveDir);
    console.log(`Reports archived to: Reports/${timestamp}`);
    
    // Clean up temporary timestamp files
    try {
      fs.unlinkSync(path.join(__dirname, '.test-timestamp'));
      fs.unlinkSync(path.join(__dirname, '.report-timestamp'));
      console.log('Temporary timestamp files cleaned up');
    } catch (e) {
      // Files may not exist, that's OK
    }
  }
}

archiveReports();
