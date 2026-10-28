import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.join(__dirname, '../package.json');
const gradlePath = path.join(__dirname, '../android/app/build.gradle');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version; 

const parts = version.split('.').map(Number);
const versionCode = (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);

if (fs.existsSync(gradlePath)) {
  let gradleContent = fs.readFileSync(gradlePath, 'utf8');

  gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  gradleContent = gradleContent.replace(/versionName\s+["'].*?["']/, `versionName "${version}"`);

  fs.writeFileSync(gradlePath, gradleContent, 'utf8');
  console.log(`✓ Successfully synced Android version to ${version} (versionCode: ${versionCode})`);
}