import type { QuestionSet, RoundingQuestion } from '@/types/clinical';

/**
 * Bedside rounding questions. The Korean prompts and the structured record
 * phrasing are taken directly from the thesis appendix ("예상 질문 및 기록"); the
 * English is a clinical equivalent for the bilingual interface. `sampleReplies`
 * drive the bedside simulation when a live microphone is unavailable.
 */
export const ROUNDING_QUESTIONS: RoundingQuestion[] = [
  {
    id: 'q-med',
    category: 'medication',
    prompt: { en: 'Did you take your medication as prescribed?', ko: '약을 올바르게 복용하셨나요?' },
    sampleReplies: [
      { en: 'Yes, I took it this morning with breakfast.', ko: '네, 아침 식사하면서 복용했어요.' },
      { en: 'I think I missed the morning dose.', ko: '아침 약을 한 번 빠뜨린 것 같아요.' },
      { en: 'I have not taken it yet.', ko: '아직 복용하지 않았어요.' },
    ],
  },
  {
    id: 'q-elim',
    category: 'elimination',
    prompt: { en: 'Have you been to the bathroom recently?', ko: '화장실은 다녀오셨어요?' },
    sampleReplies: [
      { en: 'I went around 8 this morning.', ko: '아침 8시쯤 화장실 다녀왔어요.' },
      { en: 'Not since last night.', ko: '어젯밤 이후로는 못 갔어요.' },
      { en: 'I went, but walking was a little uncomfortable.', ko: '다녀왔는데 거동이 조금 불편했어요.' },
    ],
  },
  {
    id: 'q-pain',
    category: 'pain',
    prompt: { en: 'Are you having any pain or discomfort?', ko: '특별히 아프거나 불편한 데 있으세요?' },
    sampleReplies: [
      { en: 'No pain right now.', ko: '지금은 통증이 없어요.' },
      { en: 'My chest feels a little tight.', ko: '가슴이 조금 답답해요.' },
      { en: 'The surgical site aches, maybe a 4 out of 10.', ko: '수술 부위가 욱신거려요, 십 점에 사 점 정도요.' },
    ],
  },
  {
    id: 'q-nutr',
    category: 'nutrition',
    prompt: { en: 'What time did you have your meal?', ko: '식사는 몇 시에 하셨나요?' },
    sampleReplies: [
      { en: 'I had breakfast at 7:30.', ko: '아침은 일곱 시 반에 먹었어요.' },
      { en: 'I had no appetite, so I skipped the meal.', ko: '입맛이 없어서 식사를 못 했어요.' },
      { en: 'I only ate about half of it.', ko: '절반 정도만 먹었어요.' },
    ],
  },
  {
    id: 'q-sleep',
    category: 'sleep',
    prompt: { en: 'Did you sleep well last night?', ko: '지난밤 잠은 잘 주무셨나요?' },
    sampleReplies: [
      { en: 'I slept well, thank you.', ko: '잘 잤어요, 고맙습니다.' },
      { en: 'I kept waking up during the night.', ko: '밤에 자꾸 깼어요.' },
      { en: 'It was hard to fall asleep.', ko: '잠들기가 힘들었어요.' },
    ],
  },
  {
    id: 'q-mob',
    category: 'mobility',
    prompt: { en: 'Any difficulty standing up or walking on your own?', ko: '혼자 일어나 걷는 데 불편함은 없으세요?' },
    sampleReplies: [
      { en: 'I can walk on my own without trouble.', ko: '혼자서 걷는 데 문제 없어요.' },
      { en: 'I feel dizzy when I stand up.', ko: '일어설 때 어지러워요.' },
      { en: 'I need a little help to get up.', ko: '일어날 때 도움이 조금 필요해요.' },
    ],
  },
  {
    id: 'q-resp',
    category: 'respiratory',
    prompt: { en: 'Any shortness of breath or dizziness?', ko: '숨쉬기 답답하거나 어지러우신가요?' },
    sampleReplies: [
      { en: 'My breathing is fine.', ko: '숨쉬는 건 괜찮아요.' },
      { en: 'I get short of breath when I move.', ko: '움직이면 숨이 차요.' },
      { en: 'I feel a little lightheaded.', ko: '약간 어지러워요.' },
    ],
  },
  {
    id: 'q-mood',
    category: 'mood',
    prompt: { en: 'How are you feeling today?', ko: '오늘 기분은 어떠세요?' },
    sampleReplies: [
      { en: 'I feel much better today.', ko: '오늘은 훨씬 나아요.' },
      { en: 'I am a little anxious about the test results.', ko: '검사 결과 때문에 좀 불안해요.' },
      { en: 'About the same as yesterday.', ko: '어제랑 비슷해요.' },
    ],
  },
];

export const QUESTION_SETS: QuestionSet[] = [
  {
    id: 'set-standard',
    name: { en: 'Standard Medication Round', ko: '표준 투약 회진' },
    description: { en: 'Medication adherence, elimination, pain and nutrition.', ko: '투약, 배설, 통증, 식사 확인.' },
    questionIds: ['q-med', 'q-elim', 'q-pain', 'q-nutr'],
  },
  {
    id: 'set-morning',
    name: { en: 'Morning Assessment', ko: '아침 사정' },
    description: { en: 'Overnight sleep, pain, appetite, elimination and mood.', ko: '수면, 통증, 식사, 배설, 기분 사정.' },
    questionIds: ['q-sleep', 'q-pain', 'q-nutr', 'q-elim', 'q-mood'],
  },
  {
    id: 'set-resp',
    name: { en: 'Respiratory Check', ko: '호흡 점검' },
    description: { en: 'Breathing, dizziness, mobility and pain.', ko: '호흡, 어지럼, 기동, 통증 확인.' },
    questionIds: ['q-resp', 'q-pain', 'q-mob'],
  },
  {
    id: 'set-full',
    name: { en: 'Full Bedside Assessment', ko: '전체 침상 사정' },
    description: { en: 'A complete eight-domain bedside interview.', ko: '8개 영역 전체 침상 면담.' },
    questionIds: ['q-med', 'q-elim', 'q-pain', 'q-nutr', 'q-sleep', 'q-mob', 'q-resp', 'q-mood'],
  },
];
