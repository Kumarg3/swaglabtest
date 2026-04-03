import * as fs from 'fs';
import * as path from 'path';

// Extract report timestamp from screenshot folders
function getReportTimestampFromScreenshots(): string | null {
  const screenshotsDir = path.join(__dirname, 'Screenshots');
  
  if (fs.existsSync(screenshotsDir)) {
    const folders = fs.readdirSync(screenshotsDir, { withFileTypes: true });
    
    // Find the most recent timestamped folder
    const timestampedFolders = folders
      .filter(f => f.isDirectory() && /^\d{6}_\d{6}$/.test(f.name))
      .sort()
      .reverse();
    
    if (timestampedFolders.length > 0) {
      return timestampedFolders[0].name;
    }
  }
  
  return null;
}

// Move and rename videos into timestamped folders
function organizeVideos(): void {
  const reportTimestamp = getReportTimestampFromScreenshots();
  if (!reportTimestamp) {
    console.log('No timestamped screenshot folders found, skipping video organization');
    return;
  }
  
  console.log(`Using report timestamp: ${reportTimestamp}`);
  
  const testResultsDir = path.join(__dirname, 'test-results');
  const videosDir = path.join(__dirname, 'Videos');
  const timestampedVideosDir = path.join(videosDir, reportTimestamp);
  
  // Create timestamped Videos directory if it doesn't exist
  if (!fs.existsSync(timestampedVideosDir)) {
    fs.mkdirSync(timestampedVideosDir, { recursive: true });
  }
  
  // Find and move video files
  if (fs.existsSync(testResultsDir)) {
    const files = fs.readdirSync(testResultsDir, { recursive: true });
    let videoCount = 0;
    
    files.forEach((file: any) => {
      if (typeof file === 'string' && file.endsWith('.webm')) {
        const sourceFile = path.join(testResultsDir, file);
        const fileName = path.basename(file);
        const newFileName = `${reportTimestamp}_${fileName}`;
        const destFile = path.join(timestampedVideosDir, newFileName);
        
        try {
          fs.copyFileSync(sourceFile, destFile);
          console.log(`✓ Video copied to: Videos/${reportTimestamp}/${newFileName}`);
          videoCount++;
        } catch (e) {
          console.error(`Failed to copy video: ${fileName}`);
        }
      }
    });
    
    if (videoCount > 0) {
      console.log(`\n✓ Total videos organized: ${videoCount}`);
      console.log(`Videos location: Videos/${reportTimestamp}/`);
    } else {
      console.log('No video files found to organize');
    }
  }
}

organizeVideos();
