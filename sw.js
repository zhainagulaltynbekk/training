// Offline cache. Bump VERSION when files change.
const VERSION = 'v1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css', 'js/app.js', 'js/plan.js', 'js/fedb.js', 'js/art.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png',
  'img/ex/Barbell_Glute_Bridge_0.jpg',
  'img/ex/Barbell_Glute_Bridge_1.jpg',
  'img/ex/Barbell_Hip_Thrust_0.jpg',
  'img/ex/Barbell_Hip_Thrust_1.jpg',
  'img/ex/Bodyweight_Squat_0.jpg',
  'img/ex/Bodyweight_Squat_1.jpg',
  'img/ex/Calf_Stretch_Hands_Against_Wall_0.jpg',
  'img/ex/Calf_Stretch_Hands_Against_Wall_1.jpg',
  'img/ex/Chest_And_Front_Of_Shoulder_Stretch_0.jpg',
  'img/ex/Chest_And_Front_Of_Shoulder_Stretch_1.jpg',
  'img/ex/Dead_Bug_0.jpg',
  'img/ex/Dead_Bug_1.jpg',
  'img/ex/Dumbbell_Bench_Press_0.jpg',
  'img/ex/Dumbbell_Bench_Press_1.jpg',
  'img/ex/Dumbbell_Bicep_Curl_0.jpg',
  'img/ex/Dumbbell_Bicep_Curl_1.jpg',
  'img/ex/Dumbbell_Incline_Row_0.jpg',
  'img/ex/Dumbbell_Incline_Row_1.jpg',
  'img/ex/Dumbbell_Rear_Lunge_0.jpg',
  'img/ex/Dumbbell_Rear_Lunge_1.jpg',
  'img/ex/Dumbbell_Shoulder_Press_0.jpg',
  'img/ex/Dumbbell_Shoulder_Press_1.jpg',
  'img/ex/Goblet_Squat_0.jpg',
  'img/ex/Goblet_Squat_1.jpg',
  'img/ex/Hamstring_Stretch_0.jpg',
  'img/ex/Hamstring_Stretch_1.jpg',
  'img/ex/Incline_Dumbbell_Press_0.jpg',
  'img/ex/Incline_Dumbbell_Press_1.jpg',
  'img/ex/Kneeling_Hip_Flexor_0.jpg',
  'img/ex/Kneeling_Hip_Flexor_1.jpg',
  'img/ex/Leg_Press_0.jpg',
  'img/ex/Leg_Press_1.jpg',
  'img/ex/One-Arm_Dumbbell_Row_0.jpg',
  'img/ex/One-Arm_Dumbbell_Row_1.jpg',
  'img/ex/Plank_0.jpg',
  'img/ex/Plank_1.jpg',
  'img/ex/Pushups_0.jpg',
  'img/ex/Pushups_1.jpg',
  'img/ex/Rowing_Stationary_0.jpg',
  'img/ex/Rowing_Stationary_1.jpg',
  'img/ex/Seated_Cable_Rows_0.jpg',
  'img/ex/Seated_Cable_Rows_1.jpg',
  'img/ex/Split_Squat_with_Dumbbells_0.jpg',
  'img/ex/Split_Squat_with_Dumbbells_1.jpg',
  'img/ex/Standing_Calf_Raises_0.jpg',
  'img/ex/Standing_Calf_Raises_1.jpg',
  'img/ex/Stiff-Legged_Dumbbell_Deadlift_0.jpg',
  'img/ex/Stiff-Legged_Dumbbell_Deadlift_1.jpg',
  'img/ex/Triceps_Pushdown_-_Rope_Attachment_0.jpg',
  'img/ex/Triceps_Pushdown_-_Rope_Attachment_1.jpg',
  'img/ex/Walking_Treadmill_0.jpg',
  'img/ex/Walking_Treadmill_1.jpg',
  'img/ex/Wide-Grip_Lat_Pulldown_0.jpg',
  'img/ex/Wide-Grip_Lat_Pulldown_1.jpg',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Cache-first for everything (app is fully static); falls back to network.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request).then((res) => {
    if (res.ok && new URL(e.request.url).origin === location.origin) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
    return res;
  })));
});
