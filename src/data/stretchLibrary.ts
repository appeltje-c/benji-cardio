import type { BodyRegion, StretchExercise } from '../types';

/**
 * Built-in, read-only library of stretch exercises. Images are bundled under
 * `public/stretches/<id>/{0,1}.jpg` (start / end position) and sourced from the
 * public-domain free-exercise-db (github.com/yuhonas/free-exercise-db, Unlicense).
 * How-to steps are adapted from that dataset; `benefits` are authored for this app.
 *
 * Users select these into routines via the stretch editor — they are never edited.
 */

function img(id: string): [string, string] {
  return [`/stretches/${id}/0.jpg`, `/stretches/${id}/1.jpg`];
}

export const STRETCH_LIBRARY: StretchExercise[] = [
  // ---------- Neck ----------
  {
    id: 'Chin_To_Chest_Stretch',
    name: 'Chin To Chest',
    region: 'Neck',
    images: img('Chin_To_Chest_Stretch'),
    howTo: [
      'Sit or stand tall with your shoulders relaxed and down.',
      'Interlock your fingers behind your head, thumbs pointing down, elbows forward.',
      'Let the weight of your hands gently draw your chin toward your chest.',
      'Hold for 20–30 seconds, breathing slowly. Don’t pull hard.',
    ],
    benefits:
      'Releases the muscles at the back of the neck and upper spine — the classic morning fix for stiffness from sleeping or screen time.',
    defaultReps: 2,
    perSide: false,
  },
  {
    id: 'Side_Neck_Stretch',
    name: 'Side Neck Stretch',
    region: 'Neck',
    images: img('Side_Neck_Stretch'),
    howTo: [
      'Sit or stand with shoulders relaxed and down.',
      'Gently tilt your head so one ear drops toward that shoulder.',
      'Rest the same-side hand lightly on your head to add a soft pull.',
      'Hold 20–30 seconds, then switch sides.',
    ],
    benefits:
      'Lengthens the upper trapezius and side of the neck, easing tension headaches and the tightness that builds from hunching.',
    defaultReps: 2,
    perSide: true,
  },

  // ---------- Shoulders ----------
  {
    id: 'Shoulder_Stretch',
    name: 'Cross-Body Shoulder',
    region: 'Shoulders',
    images: img('Shoulder_Stretch'),
    howTo: [
      'Bring one arm straight across the front of your body.',
      'Hook the opposite forearm under it and draw it toward your chest.',
      'Keep the shoulder down — don’t shrug it toward your ear.',
      'Hold 20–30 seconds, then switch sides.',
    ],
    benefits:
      'Opens the rear deltoid and shoulder capsule, improving reaching mobility and relieving stiffness across the upper back.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Arm_Circles',
    name: 'Arm Circles',
    region: 'Shoulders',
    images: img('Arm_Circles'),
    howTo: [
      'Stand and extend both arms out to the sides, parallel to the floor.',
      'Make slow circles about a foot wide, breathing normally.',
      'Continue ~10 seconds, then reverse direction.',
    ],
    benefits:
      'A dynamic warm-up that gets blood into the shoulders and lubricates the joint — ideal at the start of a routine.',
    defaultReps: 10,
    perSide: false,
  },
  {
    id: 'Shoulder_Circles',
    name: 'Shoulder Rolls',
    region: 'Shoulders',
    images: img('Shoulder_Circles'),
    howTo: [
      'Let your arms hang loosely at your sides or rest in your lap.',
      'Roll your shoulders forward, up, back, and down in a smooth circle.',
      'Reverse the direction after several rolls.',
    ],
    benefits:
      'Loosens the shoulder girdle and upper traps with zero strain — a gentle way to wake up tight shoulders first thing.',
    defaultReps: 10,
    perSide: false,
  },
  {
    id: 'Upward_Stretch',
    name: 'Overhead Reach',
    region: 'Shoulders',
    images: img('Upward_Stretch'),
    howTo: [
      'Interlace your fingers and turn the palms up toward the ceiling.',
      'Reach straight overhead, pressing up and slightly back.',
      'Keep your back straight and ribs down. Hold 15–20 seconds.',
    ],
    benefits:
      'Decompresses the spine and stretches the shoulders, lats and side body — a full-body “reset” reach for the morning.',
    defaultReps: 3,
    perSide: false,
  },

  // ---------- Arms ----------
  {
    id: 'Triceps_Stretch',
    name: 'Overhead Triceps',
    region: 'Arms',
    images: img('Triceps_Stretch'),
    howTo: [
      'Raise one arm overhead and bend the elbow so the hand drops behind your head.',
      'Use the other hand to gently press the elbow back and down.',
      'Hold 10–20 seconds, then switch sides.',
    ],
    benefits:
      'Stretches the triceps and the underside of the shoulder, helpful after pushing work or for overhead mobility.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Standing_Biceps_Stretch',
    name: 'Standing Biceps',
    region: 'Arms',
    images: img('Standing_Biceps_Stretch'),
    howTo: [
      'Clasp your hands behind your back with palms together.',
      'Straighten your arms, then rotate so the palms face down.',
      'Lift your arms up behind you until you feel the stretch. Hold 15–20 seconds.',
    ],
    benefits:
      'Opens the biceps, chest and front of the shoulders all at once — a great counter to a rounded, desk-bound posture.',
    defaultReps: 2,
    perSide: false,
  },
  {
    id: 'Kneeling_Forearm_Stretch',
    name: 'Kneeling Forearm',
    region: 'Arms',
    images: img('Kneeling_Forearm_Stretch'),
    howTo: [
      'Kneel and place your palms flat on the floor, fingers pointing back toward your knees.',
      'Keep the palms down and slowly lean back.',
      'Stop when you feel a stretch through the wrists and forearms. Hold 20–30 seconds.',
    ],
    benefits:
      'Relieves the forearm and wrist flexors — valuable for anyone who types, lifts, or climbs.',
    defaultReps: 2,
    perSide: false,
  },

  // ---------- Chest ----------
  {
    id: 'Dynamic_Chest_Stretch',
    name: 'Dynamic Chest Opener',
    region: 'Chest',
    images: img('Dynamic_Chest_Stretch'),
    howTo: [
      'Stand with arms extended straight in front, hands together.',
      'Keeping arms straight, sweep them back as far as comfortable, like an exaggerated clap.',
      'Return to the front and repeat, building speed gently.',
    ],
    benefits:
      'Actively opens the chest and warms the shoulders — primes the upper body and counteracts forward-rounded posture.',
    defaultReps: 10,
    perSide: false,
  },
  {
    id: 'Elbows_Back',
    name: 'Elbows Back',
    region: 'Chest',
    images: img('Elbows_Back'),
    howTo: [
      'Stand tall and place both hands on your lower back, fingers pointing down, elbows out.',
      'Gently draw your elbows back toward each other.',
      'Lift your chest as you do so. Hold 15–20 seconds.',
    ],
    benefits:
      'Stretches the chest and front of the shoulders while engaging the upper back — a quick posture corrector.',
    defaultReps: 3,
    perSide: false,
  },

  // ---------- Back ----------
  {
    id: 'Cat_Stretch',
    name: 'Cat Stretch',
    region: 'Back',
    images: img('Cat_Stretch'),
    howTo: [
      'Start on your hands and knees, wrists under shoulders, knees under hips.',
      'Draw your belly in and round your spine toward the ceiling, letting your head drop.',
      'Hold ~15 seconds, then release to a flat back.',
    ],
    benefits:
      'Mobilises the entire spine and stretches the back muscles — one of the best gentle wake-ups for a stiff morning back.',
    defaultReps: 5,
    perSide: false,
  },
  {
    id: 'Childs_Pose',
    name: "Child's Pose",
    region: 'Back',
    images: img('Childs_Pose'),
    howTo: [
      'From hands and knees, walk your hands forward and sit your hips back onto your heels.',
      'Let your arms reach forward and your forehead rest on the floor.',
      'Breathe into your back and relax. Hold 20–30 seconds. (Skip if you have knee issues.)',
    ],
    benefits:
      'A restful stretch for the lower back, hips and shoulders that also calms the nervous system — perfect to open or close a routine.',
    defaultReps: 2,
    perSide: false,
  },
  {
    id: 'Hug_Knees_To_Chest',
    name: 'Knees To Chest',
    region: 'Back',
    images: img('Hug_Knees_To_Chest'),
    howTo: [
      'Lie on your back and draw both knees up toward your chest.',
      'Hold your arms under the knees (not over them) to protect the joints.',
      'Gently pull the knees toward your shoulders. Hold 20–30 seconds.',
    ],
    benefits:
      'Decompresses and stretches the lower back and glutes — eases the stiffness that accumulates overnight.',
    defaultReps: 2,
    perSide: false,
  },
  {
    id: 'Spinal_Stretch',
    name: 'Seated Spinal Twist',
    region: 'Back',
    images: img('Spinal_Stretch'),
    howTo: [
      'Sit tall in a chair, feet flat, fingers interlaced behind your head.',
      'Twist your upper body to one side as far as is comfortable.',
      'Lean forward and reach your elbow toward the inside of the opposite knee.',
      'Return upright and repeat to the other side.',
    ],
    benefits:
      'Rotates and lengthens the spine and obliques, restoring twisting mobility and relieving mid-back tension.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Upper_Back_Stretch',
    name: 'Upper Back Stretch',
    region: 'Back',
    images: img('Upper_Back_Stretch'),
    howTo: [
      'Clasp your fingers together with thumbs pointing down.',
      'Round your shoulders and reach your hands forward, away from your chest.',
      'Let the upper back spread open. Hold 15–20 seconds.',
    ],
    benefits:
      'Targets the rhomboids and muscles between the shoulder blades, releasing knots from desk work.',
    defaultReps: 3,
    perSide: false,
  },

  // ---------- Core ----------
  {
    id: 'Standing_Lateral_Stretch',
    name: 'Standing Side Bend',
    region: 'Core',
    images: img('Standing_Lateral_Stretch'),
    howTo: [
      'Stand slightly wider than hip width, knees soft.',
      'Place one hand on your hip and reach the other arm overhead.',
      'Incline your torso toward the hand-on-hip side, keeping weight even on both feet.',
      'Hold 15–20 seconds, then switch sides.',
    ],
    benefits:
      'Lengthens the obliques, lats and the whole side body — opens up the waist and improves side-to-side mobility.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Seated_Overhead_Stretch',
    name: 'Seated Side Reach',
    region: 'Core',
    images: img('Seated_Overhead_Stretch'),
    howTo: [
      'Sit tall with the soles of your feet together, a little in front of your hips.',
      'Place one hand on the floor beside you and the other behind your head.',
      'Lift that elbow to the ceiling as you lean your torso to the opposite side.',
      'Hold 10–20 seconds, then switch sides.',
    ],
    benefits:
      'Stretches the side waist and ribcage while opening the hips — a grounding seated stretch for the core.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Lower_Back_Curl',
    name: 'Cobra (Back Extension)',
    region: 'Core',
    images: img('Lower_Back_Curl'),
    howTo: [
      'Lie face down with your arms out to the sides.',
      'Using your lower-back muscles, lift your chest off the floor — don’t push with your arms.',
      'Keep your head up and gaze forward, then lower with control.',
    ],
    benefits:
      'Gently strengthens the lower back while stretching the abdominals — a counter-pose to all the forward folding we do.',
    defaultReps: 10,
    perSide: false,
  },

  // ---------- Hips & Glutes ----------
  {
    id: 'Knee_Across_The_Body',
    name: 'Lying Knee Across',
    region: 'Hips & Glutes',
    images: img('Knee_Across_The_Body'),
    howTo: [
      'Lie on your back with one leg straight.',
      'Bend the other knee and lower it across your body, guiding it down with the opposite hand.',
      'Stretch the other arm out and turn your head away from the knee.',
      'Let your tailbone settle toward the floor. Hold 20–30 seconds, then switch.',
    ],
    benefits:
      'A gentle spinal twist that releases the lower back and outer hip — soothing and safe for tight mornings.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'One_Knee_To_Chest',
    name: 'One Knee To Chest',
    region: 'Hips & Glutes',
    images: img('One_Knee_To_Chest'),
    howTo: [
      'Lie on your back with one leg extended straight along the floor.',
      'Draw the other knee toward your chest, holding just under the knee.',
      'Gently tug the knee toward your nose. Hold 20–30 seconds, then switch.',
    ],
    benefits:
      'Stretches the glute and lower back of the bent leg and the hip flexor of the straight leg at the same time.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Ankle_On_The_Knee',
    name: 'Figure-4 Glute',
    region: 'Hips & Glutes',
    images: img('Ankle_On_The_Knee'),
    howTo: [
      'Lie on your back with both knees bent, feet on the floor.',
      'Cross one ankle over the opposite knee to make a figure 4.',
      'Reach through and pull the bottom thigh toward your chest. Relax neck and shoulders.',
      'Hold 20–30 seconds, then switch sides.',
    ],
    benefits:
      'Deeply targets the glutes and piriformis, relieving hip tightness and sciatic-type tension from sitting.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Side_Lying_Groin_Stretch',
    name: 'Side-Lying Inner Thigh',
    region: 'Hips & Glutes',
    images: img('Side_Lying_Groin_Stretch'),
    howTo: [
      'Lie on one side and bend the bottom knee in front of you for stability.',
      'Rest your head on your hand. Lift the top leg and hold behind the knee (easier) or the foot (harder).',
      'Draw the knee toward your shoulder while pressing it down. Hold 20–30 seconds, then switch.',
    ],
    benefits:
      'Opens the inner thigh and adductors, improving hip range and balance for the lower body.',
    defaultReps: 2,
    perSide: true,
  },

  // ---------- Legs ----------
  {
    id: '90_90_Hamstring',
    name: '90/90 Hamstring',
    region: 'Legs',
    images: img('90_90_Hamstring'),
    howTo: [
      'Lie on your back with one leg extended along the floor.',
      'Bend the other hip and knee to 90 degrees, bracing the thigh with your hands.',
      'Extend that leg straight up, pause at the top, then lower it back to 90 degrees.',
      'Repeat, then switch legs.',
    ],
    benefits:
      'Lengthens the hamstrings with a controlled, joint-friendly motion — safer for tight backs than a standing toe-touch.',
    defaultReps: 10,
    perSide: true,
  },
  {
    id: 'Standing_Toe_Touches',
    name: 'Standing Forward Fold',
    region: 'Legs',
    images: img('Standing_Toe_Touches'),
    howTo: [
      'Stand with feet hip-width apart.',
      'Hinge at the hips and let your upper body hang down, knees soft.',
      'Let your arms, hands and head dangle. Hold 10–20 seconds.',
    ],
    benefits:
      'Stretches the hamstrings and whole back line while decompressing the spine — a simple, deep release.',
    defaultReps: 3,
    perSide: false,
  },
  {
    id: 'Runners_Stretch',
    name: "Runner's Lunge",
    region: 'Legs',
    images: img('Runners_Stretch'),
    howTo: [
      'From standing, step one leg back and lower your torso toward the floor.',
      'Keep the front heel down (slide the back leg further if it lifts).',
      'Place your hands either side of the front foot; lift the hips, then ease them back down.',
      'Hold 20–30 seconds, then switch sides.',
    ],
    benefits:
      'Opens the hip flexor of the back leg and the hamstring of the front — a foundational mobility stretch for the lower body.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'On_Your_Side_Quad_Stretch',
    name: 'Side-Lying Quad',
    region: 'Legs',
    images: img('On_Your_Side_Quad_Stretch'),
    howTo: [
      'Lie on one side with the bottom knee bent forward for stability.',
      'Bend the top knee and hold that foot with the same-side hand.',
      'Press the hip forward and the foot back into your hand. Hold 20–30 seconds, then switch.',
    ],
    benefits:
      'Stretches the quadriceps and hip flexor in a supported position — kinder on balance than the standing version.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Kneeling_Hip_Flexor',
    name: 'Kneeling Hip Flexor',
    region: 'Legs',
    images: img('Kneeling_Hip_Flexor'),
    howTo: [
      'Kneel and step one foot forward so that knee is over the ankle.',
      'Extend the other leg back, top of the foot on the floor.',
      'Shift your weight forward until you feel a stretch at the front of the back hip.',
      'Hold ~15 seconds, then switch sides.',
    ],
    benefits:
      'Directly targets the hip flexors that shorten from sitting all day — key for posture and an easy stride.',
    defaultReps: 2,
    perSide: true,
  },

  // ---------- Calves ----------
  {
    id: 'Calf_Stretch_Hands_Against_Wall',
    name: 'Wall Calf Stretch',
    region: 'Calves',
    images: img('Calf_Stretch_Hands_Against_Wall'),
    howTo: [
      'Face a wall a couple of feet away and stagger your stance, one foot forward.',
      'Lean in and rest your hands on the wall, back heel, hip and head in a line.',
      'Keep the back heel on the floor. Hold 20–30 seconds, then switch sides.',
    ],
    benefits:
      'Stretches the gastrocnemius (upper calf), improving ankle mobility and protecting against calf and Achilles strain.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Seated_Calf_Stretch',
    name: 'Seated Calf Stretch',
    region: 'Calves',
    images: img('Seated_Calf_Stretch'),
    howTo: [
      'Sit tall with one knee bent, foot flat for stability.',
      'Straighten the other leg and flex the ankle.',
      'Use a towel or your hands to draw the toes toward you. Hold 10–20 seconds, then switch.',
    ],
    benefits:
      'Lengthens the calf and back of the lower leg with full control — a good option when balance or space is limited.',
    defaultReps: 2,
    perSide: true,
  },
  {
    id: 'Standing_Soleus_And_Achilles_Stretch',
    name: 'Soleus & Achilles',
    region: 'Calves',
    images: img('Standing_Soleus_And_Achilles_Stretch'),
    howTo: [
      'Stand with feet hip-distance apart, one foot slightly ahead.',
      'Bend both knees while keeping the back heel on the floor.',
      'Feel the stretch lower in the calf and Achilles. Hold 20–30 seconds, then switch.',
    ],
    benefits:
      'Reaches the deeper soleus muscle and Achilles tendon — essential for ankle health, walking and running.',
    defaultReps: 2,
    perSide: true,
  },
];

export const BODY_REGIONS: BodyRegion[] = [
  'Neck',
  'Shoulders',
  'Arms',
  'Chest',
  'Back',
  'Core',
  'Hips & Glutes',
  'Legs',
  'Calves',
];

const byId = new Map(STRETCH_LIBRARY.map((e) => [e.id, e]));

export function getStretch(id: string): StretchExercise | undefined {
  return byId.get(id);
}

export function stretchesByRegion(region: BodyRegion): StretchExercise[] {
  return STRETCH_LIBRARY.filter((e) => e.region === region);
}
