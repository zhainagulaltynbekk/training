// The Comeback Fitness & Recomposition Plan (Tue / Thu / Sat version).
// type: 'reps' (weight + reps), 'bw' (bodyweight reps), 'time' (seconds hold), 'cardio' (minutes)

export const EXERCISES = {
  goblet_squat: {
    name: 'Goblet Squat', img: 'Goblet_Squat', type: 'reps', compound: true,
    cues: ['Hold one dumbbell vertically against your chest.', 'Sit between your heels, chest tall, knees track over toes.', 'Drive up through the whole foot.'],
  },
  leg_press: {
    name: 'Leg Press', img: 'Leg_Press', type: 'reps', compound: true,
    cues: ['Feet shoulder-width, mid-platform.', 'Lower until knees reach ~90°, lower back stays on the pad.', 'Do not lock knees hard at the top.'],
  },
  db_incline_press: {
    name: 'Dumbbell Incline Bench Press', img: 'Incline_Dumbbell_Press', type: 'reps', compound: true,
    cues: ['Bench at 30–45°.', 'Lower dumbbells to upper chest, elbows ~45° from body.', 'Press up and slightly together.'],
  },
  seated_cable_row: {
    name: 'Seated Cable Row', img: 'Seated_Cable_Rows', type: 'reps', compound: true,
    cues: ['Sit tall, slight knee bend.', 'Pull handle to lower ribs, squeeze shoulder blades.', 'Let arms extend fully without rounding your back.'],
  },
  db_row: {
    name: 'One-Arm Dumbbell Row', img: 'One-Arm_Dumbbell_Row', type: 'reps', compound: true, perSide: true,
    cues: ['One hand and knee on the bench, back flat.', 'Pull dumbbell to your hip.', 'Lower under control.'],
  },
  db_glute_bridge: {
    name: 'Dumbbell Glute Bridge', img: 'Barbell_Glute_Bridge', type: 'reps', compound: true,
    cues: ['Lie on your back, dumbbell resting on your hips.', 'Drive through heels, squeeze glutes hard at the top for 1 second.', 'Ribs down, do not over-arch the lower back.'],
  },
  hip_thrust: {
    name: 'Hip Thrust (Barbell / Machine)', img: 'Barbell_Hip_Thrust', type: 'reps', compound: true,
    cues: ['Upper back on the bench edge, bar padded over hips.', 'Drive hips up until torso is flat, chin tucked.', 'Pause and squeeze at the top.'],
  },
  db_curl: {
    name: 'Dumbbell Bicep Curls', img: 'Dumbbell_Bicep_Curl', type: 'reps',
    cues: ['Elbows pinned to your sides.', 'Curl up, rotate palms up.', 'Lower slowly (2–3 seconds).'],
  },
  plank: {
    name: 'Front Plank', img: 'Plank', type: 'time',
    cues: ['Elbows under shoulders, body in one straight line.', 'Squeeze glutes and brace abs.', 'Breathe slowly; stop when hips start to sag.'],
  },
  dead_bug: {
    name: 'Dead Bugs', img: 'Dead_Bug', type: 'time',
    cues: ['Lie on your back, arms up, knees at 90°.', 'Lower opposite arm and leg while pressing the lower back into the floor.', 'Alternate sides slowly.'],
  },
  db_rdl: {
    name: 'Dumbbell Romanian Deadlift', img: 'Stiff-Legged_Dumbbell_Deadlift', type: 'reps', compound: true,
    cues: ['Soft knees, push hips back.', 'Dumbbells slide down the front of your thighs, back flat.', 'Stop when you feel a hamstring stretch, then drive hips forward.'],
  },
  lat_pulldown: {
    name: 'Lat Pulldown', img: 'Wide-Grip_Lat_Pulldown', type: 'reps', compound: true,
    cues: ['Grip slightly wider than shoulders.', 'Pull the bar to your upper chest, elbows down and back.', 'Control the bar on the way up.'],
  },
  db_ohp: {
    name: 'Dumbbell Overhead Press', img: 'Dumbbell_Shoulder_Press', type: 'reps', compound: true,
    cues: ['Seated or standing, core braced.', 'Press dumbbells overhead without arching your back.', 'Lower to ear level.'],
  },
  bulgarian_split_squat: {
    name: 'Bulgarian Split Squat', img: 'Split_Squat_with_Dumbbells', type: 'reps', compound: true, perSide: true,
    cues: ['Rear foot on a bench, front foot far enough forward.', 'Drop the back knee straight down.', 'Push through the front heel. Reps are per leg.'],
  },
  reverse_lunge: {
    name: 'Reverse Lunge', img: 'Dumbbell_Rear_Lunge', type: 'reps', compound: true, perSide: true,
    cues: ['Step back, lower the back knee toward the floor.', 'Front shin stays fairly vertical.', 'Push through the front heel to stand. Reps are per leg.'],
  },
  tricep_pushdown: {
    name: 'Cable Tricep Pushdowns', img: 'Triceps_Pushdown_-_Rope_Attachment', type: 'reps',
    cues: ['Elbows locked at your sides.', 'Push down until arms are straight, spread the rope at the bottom.', 'Return slowly to ~90°.'],
  },
  wall_sit: {
    name: 'Wall Sit', svg: 'wallsit', type: 'time',
    cues: ['Back flat against a wall, slide down until thighs are close to parallel.', 'Knees above ankles, weight in heels.', 'Breathe through the burn — this builds leg stamina.'],
  },
  db_flat_press: {
    name: 'Flat Dumbbell Press', img: 'Dumbbell_Bench_Press', type: 'reps', compound: true,
    cues: ['Feet planted, shoulder blades pulled back.', 'Lower dumbbells to chest level.', 'Press up without bouncing.'],
  },
  push_ups: {
    name: 'Push-ups', img: 'Pushups', type: 'bw', compound: true,
    cues: ['Hands under shoulders, body straight.', 'Lower chest to just above the floor.', 'Too hard? Put hands on a bench (incline push-up).'],
  },
  chest_supported_row: {
    name: 'Chest-Supported Row', img: 'Dumbbell_Incline_Row', type: 'reps', compound: true,
    cues: ['Lie chest-down on an incline bench.', 'Row dumbbells toward your hips.', 'Squeeze shoulder blades, lower slowly.'],
  },
  calf_raise: {
    name: 'Standing Calf Raises', img: 'Standing_Calf_Raises', type: 'reps',
    cues: ['Balls of feet on a step or plate.', 'Rise as high as possible, pause 1 second.', 'Lower slowly into a full stretch.'],
  },
  cardio_incline_walk: {
    name: 'Incline Walk (Zone 2)', img: 'Walking_Treadmill', type: 'cardio',
    cues: ['Zone 2 = you can still talk in full sentences but feel warm.', 'Incline 5–10%, steady pace.', 'Do not hold the handrails.'],
  },
  cardio_row: {
    name: 'Rowing (Zone 2)', img: 'Rowing_Stationary', type: 'cardio',
    cues: ['Legs, then hips, then arms on the drive.', 'Reverse order on the return.', 'Steady, conversational pace.'],
  },
  cardio_swim: {
    name: 'Lap Swimming', svg: 'swim', type: 'cardio',
    cues: ['Easy, continuous laps — any stroke.', 'Rest at the wall when needed, keep total time.', 'Great for lungs and hips with zero joint impact.'],
  },
  // Stretches
  hip_flexor_stretch: {
    name: 'Kneeling Hip Flexor / Couch Stretch', img: 'Kneeling_Hip_Flexor', type: 'stretch', perSide: true,
    cues: ['Kneel on one knee, other foot in front.', 'Tuck pelvis and squeeze the glute of the kneeling leg.', 'Shift forward gently. Opens hips tight from sitting.'],
  },
  hamstring_stretch: {
    name: 'Hamstring Stretch', img: 'Hamstring_Stretch', type: 'stretch', perSide: true,
    cues: ['Seated or standing, one leg straight.', 'Hinge from the hips with a flat back.', 'Relieves lower-back tension.'],
  },
  calf_stretch: {
    name: 'Wall Calf Stretch', img: 'Calf_Stretch_Hands_Against_Wall', type: 'stretch', perSide: true,
    cues: ['Hands on wall, back leg straight, heel down.', 'Then bend the back knee slightly for the lower calf.', 'Do both straight-leg and bent-knee.'],
  },
  hip_9090: {
    name: '90/90 Hip Switches', svg: 'nineninety', type: 'stretch',
    cues: ['Sit with both knees bent at 90°, one in front, one to the side.', 'Rotate both knees to the other side, keep chest tall.', 'Use hands behind you for support at first.'],
  },
  deep_squat_hold: {
    name: 'Assisted Deep Squat Hold', img: 'Bodyweight_Squat', type: 'stretch',
    cues: ['Hold a rack or doorframe.', 'Sink into the deepest squat you can, heels down.', 'Relax and breathe; opens hips and ankles.'],
  },
  chest_stretch: {
    name: 'Doorway Chest Stretch', img: 'Chest_And_Front_Of_Shoulder_Stretch', type: 'stretch',
    cues: ['Forearms on the door frame, elbows at shoulder height.', 'Step forward until you feel the chest open.', 'Counteracts desk posture.'],
  },
  brisk_walk: {
    name: 'Brisk Walk', svg: 'walk', type: 'cardio',
    cues: ['Brisk pace: slightly out of breath but able to talk.', 'Build up gradually — leg fatigue should fade in 3–4 weeks.', 'Stand tall, swing your arms.'],
  },
};

// Each slot: primary exercise id + alternatives; sets, rep range, purpose.
export const WORKOUTS = {
  A: {
    id: 'A', name: 'Full Body A', subtitle: 'Quads · Push · Core', where: 'Office Gym', duration: '45–50 min',
    slots: [
      { ex: ['goblet_squat', 'leg_press'], sets: 3, min: 10, max: 12, purpose: 'Quad strength & walking endurance' },
      { ex: ['db_incline_press'], sets: 3, min: 8, max: 10, purpose: 'Chest & shoulder thickness' },
      { ex: ['seated_cable_row', 'db_row'], sets: 3, min: 10, max: 12, purpose: 'Upper back & desk posture' },
      { ex: ['db_glute_bridge', 'hip_thrust'], sets: 3, min: 12, max: 15, purpose: 'Hip power & stamina' },
      { ex: ['db_curl'], sets: 2, min: 12, max: 15, purpose: 'Rebuild arm size' },
      { ex: ['plank', 'dead_bug'], sets: 3, min: 30, max: 45, purpose: 'Core & lower-back stability' },
    ],
  },
  B: {
    id: 'B', name: 'Full Body B', subtitle: 'Glutes/Hams · Pull · Leg Stamina', where: 'Office Gym', duration: '45–50 min',
    slots: [
      { ex: ['db_rdl'], sets: 3, min: 10, max: 12, purpose: 'Hamstrings, glutes & posterior chain' },
      { ex: ['lat_pulldown'], sets: 3, min: 8, max: 12, purpose: 'Back width & arm strength' },
      { ex: ['db_ohp'], sets: 3, min: 8, max: 10, purpose: 'Shoulder stability & upper body' },
      { ex: ['bulgarian_split_squat', 'reverse_lunge'], sets: 3, min: 8, max: 10, purpose: 'Single-leg endurance & balance' },
      { ex: ['tricep_pushdown'], sets: 2, min: 12, max: 15, purpose: 'Rebuild arm size' },
      { ex: ['wall_sit'], sets: 2, min: 30, max: 45, purpose: 'Isometric quad burn tolerance' },
    ],
  },
  C: {
    id: 'C', name: 'Full Body C', subtitle: 'Leg stamina · Cardio · Flexibility', where: 'MultiSport Gym / Pool', duration: '60–75 min',
    slots: [
      { ex: ['leg_press', 'goblet_squat'], sets: 3, min: 12, max: 15, purpose: 'High-rep leg stamina' },
      { ex: ['db_flat_press', 'push_ups'], sets: 3, min: 10, max: 12, purpose: 'Upper-body pushing volume' },
      { ex: ['chest_supported_row', 'seated_cable_row'], sets: 3, min: 10, max: 12, purpose: 'Pulling balance' },
      { ex: ['hip_thrust'], sets: 3, min: 12, max: 15, purpose: 'Peak glute/pelvic endurance' },
      { ex: ['calf_raise'], sets: 3, min: 15, max: 20, purpose: 'Stop lower-leg fatigue on walks' },
      { ex: ['cardio_incline_walk', 'cardio_row', 'cardio_swim'], sets: 1, min: 20, max: 30, purpose: 'Heart-rate stamina & belly-fat loss' },
    ],
    stretch: true,
  },
  W: {
    id: 'W', name: 'Walk + Mobility', subtitle: 'Brisk walk · hip & calf mobility', where: 'Home / Outdoors', duration: '25–30 min',
    slots: [
      { ex: ['brisk_walk'], sets: 1, min: 20, max: 30, purpose: 'Build walking tolerance' },
    ],
    stretch: true,
  },
};

export const STRETCHES = ['hip_flexor_stretch', 'hamstring_stretch', 'calf_stretch', 'hip_9090', 'deep_squat_hold', 'chest_stretch'];
export const STRETCH_SECONDS = 50; // plan: 45–60 s each

// 0 = Sunday
export const WEEK = {
  0: { w: null, label: 'Complete rest', note: 'Rest day (or do Full Body C today if Saturday was busy).' },
  1: { w: 'W', label: 'Brisk walk + 10 min hip & calf mobility' },
  2: { w: 'A', label: 'Full Body A — Office Gym' },
  3: { w: 'W', label: 'Easy walk + light stretching (active recovery)' },
  4: { w: 'B', label: 'Full Body B — Office Gym' },
  5: { w: null, label: 'Complete rest', note: 'Recovery is when muscle is rebuilt. Hit your protein and steps.' },
  6: { w: 'C', label: 'Full Body C + Zone 2 cardio + deep flexibility — MultiSport' },
};

export const TARGETS = {
  kcal: [1900, 2050],
  protein: [135, 155],
  restCompound: 90,
  restIso: 60,
};

// Steps: 6–7k in weeks 1–2, +1000 every two weeks, cap 9–10k.
export function stepTarget(week) {
  const lo = Math.min(6000 + Math.floor((Math.max(week, 1) - 1) / 2) * 1000, 9000);
  return [lo, lo + 1000];
}

export function phaseFor(week) {
  if (week <= 4) return { n: 1, name: 'Re-acclimation', tip: 'Finish every set with 2–3 reps left in the tank (RIR 2–3). No grinding.' };
  if (week <= 12) return { n: 2, name: 'Recomposition & Stamina', tip: 'Progressive overload: when you hit the top of the rep range on all sets, add 2.5 kg or 1–2 reps next time.' };
  return { n: 3, name: 'Keep building', tip: 'Keep progressing. Consider a new plan block — the basics still apply.' };
}

export const WARMUP = [
  '5 min brisk incline walk or stationary bike',
  'Leg swings — 10 each leg, front/back and side to side',
  'Arm circles — 10 forward, 10 back',
];
