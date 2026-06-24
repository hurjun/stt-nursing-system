/**
 * Chart-ready normalizations for each rounding answer, aligned by index with
 * the `sampleReplies` of the matching question in `questions.ts`. This mirrors
 * the thesis idea that free speech is converted into a concise nursing-record
 * phrase before it is written to the chart.
 */
export const STRUCTURED_REPLIES: Record<string, string[]> = {
  'q-med': [
    'Reports medications taken as scheduled.',
    'Reports a missed morning dose — follow up with provider.',
    'Has not yet taken scheduled medication; reinforced regimen.',
  ],
  'q-elim': [
    'Voided this morning (~08:00); no difficulty reported.',
    'No bowel or bladder output since previous shift.',
    'Voided; reports mild difficulty ambulating to bathroom.',
  ],
  'q-pain': [
    'Denies pain at this time.',
    'Reports mild chest tightness — continue monitoring.',
    'Reports incisional pain rated 4/10; PRN analgesia available.',
  ],
  'q-nutr': [
    'Tolerated breakfast at 07:30 without nausea.',
    'Poor appetite; meal not taken. Dietitian consult considered.',
    'Consumed approximately 50% of meal.',
  ],
  'q-sleep': [
    'Slept well overnight.',
    'Frequent awakenings reported overnight.',
    'Reports difficulty initiating sleep.',
  ],
  'q-mob': [
    'Ambulates independently without difficulty.',
    'Reports dizziness on standing — fall precautions reinforced.',
    'Requires minimal assistance to stand.',
  ],
  'q-resp': [
    'Denies dyspnea; breathing comfortable on room air.',
    'Exertional dyspnea reported with activity.',
    'Reports mild lightheadedness.',
  ],
  'q-mood': [
    'Bright affect; reports feeling improved today.',
    'Anxious regarding pending test results; reassurance provided.',
    'Mood unchanged from prior shift.',
  ],
};
