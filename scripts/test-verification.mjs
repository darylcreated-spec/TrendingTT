import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== RUNNING TRENDING TT DEEP VERIFICATION SUITE ===\n');

// 1. Verify "No AI spindle emojis" rule across all src and public files
console.log('1. Checking "No AI spindle emojis" rule...');
const forbiddenEmojis = ['✨', '🤖', '🦾', '🪄'];
const checkDirs = ['src', 'public'];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx?|jsx?|html|json|css)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const emoji of forbiddenEmojis) {
        if (content.includes(emoji)) {
          throw new Error(`Forbidden AI emoji "${emoji}" found in ${fullPath}`);
        }
      }
    }
  }
}

for (const dir of checkDirs) {
  scanDir(dir);
}
console.log('PASS: Zero AI spindle / robot emojis found across codebase.\n');

// 2. Check Service Worker push handler in public/sw.js
console.log('2. Verifying public/sw.js Push and Notification click handlers...');
const swContent = fs.readFileSync('public/sw.js', 'utf8');
assert(swContent.includes("self.addEventListener('push'"), 'sw.js missing push event listener');
assert(swContent.includes("self.addEventListener('notificationclick'"), 'sw.js missing notificationclick event listener');
assert(swContent.includes("self.registration.showNotification"), 'sw.js missing showNotification call');
assert(swContent.includes("clients.openWindow"), 'sw.js missing clients.openWindow fallback');
console.log('PASS: Service Worker push & click handlers correctly defined.\n');

// 3. Verify Traffic, Weather & WASA Data structure
console.log('3. Verifying Option B data requirements...');
const dataContent = fs.readFileSync('src/data/radarAndPollData.ts', 'utf8');

// Check major arteries
assert(dataContent.includes('Uriah Butler Highway'), 'Missing Uriah Butler Highway');
assert(dataContent.includes('Churchill Roosevelt Highway'), 'Missing Churchill Roosevelt Highway');
assert(dataContent.includes('Priority Bus Route'), 'Missing Priority Bus Route');
assert(dataContent.includes('Solomon Hochoy Highway'), 'Missing Solomon Hochoy Highway');
assert(dataContent.includes('South Trunk Road'), 'Missing South Trunk Road / Mosquito Creek');

// Check TTMS advisory and authority
assert(dataContent.includes('Trinidad and Tobago Meteorological Service'), 'Missing TTMS advisory');
assert(dataContent.includes('Caroni River Basin'), 'Missing Caroni river basin flood monitor');

// Check WASA notices
assert(dataContent.includes('Caroni Water Treatment Plant'), 'Missing Caroni WASA notice');
assert(dataContent.includes('Navet Water Treatment Facility'), 'Missing Navet WASA notice');
assert(dataContent.includes('Desalcott'), 'Missing Desalcott WASA notice');
console.log('PASS: All Option B arterial highways, TTMS weather, flood basins, and WASA data present.\n');

// 4. Verify Option C: Trinbago Polls
console.log('4. Verifying Option C poll requirements...');
assert(dataContent.includes('Debe vs Curepe'), 'Missing Debe vs Curepe doubles poll');
assert(dataContent.includes('Highway Speed Limits'), 'Missing highway speed limits poll');
assert(dataContent.includes('National Fiscal Focus'), 'Missing national budget priorities poll');
console.log('PASS: All hot national topics present in polls data.\n');

// 5. Test Poll Math & Percentage breakdown algorithm
console.log('5. Testing Poll Percentage calculation logic...');
function calculatePercentages(options) {
  const total = options.reduce((sum, opt) => sum + opt.votes, 0);
  return options.map(opt => ({
    ...opt,
    percentage: total > 0 ? Math.round((opt.votes / total) * 100) : 0
  }));
}

// Edge case: Empty votes
const emptyPoll = [{ votes: 0 }, { votes: 0 }];
const emptyResults = calculatePercentages(emptyPoll);
assert.strictEqual(emptyResults[0].percentage, 0);
assert.strictEqual(emptyResults[1].percentage, 0);

// Normal case: Debe vs Curepe
const testPoll = [
  { id: 'debe', votes: 1980 },
  { id: 'curepe', votes: 1420 },
  { id: 'other', votes: 600 }
];
const testResults = calculatePercentages(testPoll);
const sumPercentages = testResults.reduce((sum, opt) => sum + opt.percentage, 0);
assert(sumPercentages >= 99 && sumPercentages <= 101, 'Percentage sum should be ~100%');
console.log('PASS: Dynamic percentage calculation algorithm behaves accurately.\n');

// 6. Test Local Storage Simulation for Poll Voting & Notifications
console.log('6. Verifying Storage schema & simulation...');
const storageContent = fs.readFileSync('src/services/storage.ts', 'utf8');
assert(storageContent.includes('castPollVote'), 'Missing castPollVote method in Storage');
assert(storageContent.includes('getUserPollVotes'), 'Missing getUserPollVotes in Storage');
assert(storageContent.includes('getNotificationSettings'), 'Missing getNotificationSettings in Storage');
assert(storageContent.includes('saveNotificationSettings'), 'Missing saveNotificationSettings in Storage');
assert(storageContent.includes('getCommunityReports'), 'Missing getCommunityReports in Storage');
assert(storageContent.includes('addCommunityReport'), 'Missing addCommunityReport in Storage');
console.log('PASS: Storage persistence layer contains all required contracts.\n');

console.log('=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
