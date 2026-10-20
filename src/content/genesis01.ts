// Chapter 1 — A World Made Good (Genesis 1:1–2:3), Ellis (Grade 1).
// Encoded from content/genesis-01-ellis.md. Scripture = WEB (shown distinct from retelling).
import type { UnderstandingKey } from '../lib/record';

export interface StoryPage {
  day?: string;
  heading: string;
  retelling: string;
  scripture?: { text: string; ref: string };
}

export interface Choice {
  id: string;
  text: string;
  correct: boolean;
  feedback: string; // specific — names what to reconsider
}

export interface OrderCard {
  id: string;
  label: string;
  hint: string; // day label shown after placing
  img: string; // illustrated creation card
}

export const GENESIS_01 = {
  id: 'genesis-01',
  title: 'A World Made Good',
  passage: 'Genesis 1:1–2:3',
  bookTitle: 'Genesis',
  // The guide reads and points to Scripture; never an eyewitness.
  guide: { name: 'Ezra', role: 'Keeper of the Scroll' },

  intro:
    'Before anything you have ever seen — before the sun, before the sea, before a single bird — there was God. Let us read how it all began.',

  story: [
    {
      heading: 'In the beginning',
      retelling: 'There was no light, no land, no sky. Only God. And God was about to make everything.',
      scripture: { text: 'In the beginning, God created the heavens and the earth.', ref: 'Genesis 1:1' },
    },
    {
      day: 'Day 1',
      heading: 'Light',
      retelling: 'It was dark. Then God spoke: “Let there be light!” — and there was light. God called the light Day, and the dark He called Night.',
      scripture: { text: 'God said, “Let there be light,” and there was light.', ref: 'Genesis 1:3' },
    },
    {
      day: 'Day 2',
      heading: 'Sky',
      retelling: 'God made the wide open sky and stretched it high above the waters.',
    },
    {
      day: 'Day 3',
      heading: 'Land, Sea, and Plants',
      retelling: 'God gathered the waters so dry land could rise. He called the land Earth and the waters Seas. Then — green! Grass, plants, and trees full of fruit.',
      scripture: { text: 'God saw that it was good.', ref: 'Genesis 1:12' },
    },
    {
      day: 'Day 4',
      heading: 'Sun, Moon, and Stars',
      retelling: 'God set the bright sun to shine in the day, and the moon and stars for the night — to mark the days and seasons and years.',
    },
    {
      day: 'Day 5',
      heading: 'Fish and Birds',
      retelling: 'The seas filled with swimming things, great and small. And birds rose up to fly across the sky.',
    },
    {
      day: 'Day 6',
      heading: 'Animals and People',
      retelling: 'God made the animals — creeping, walking, leaping. And then God made people, in His own image. He blessed them and gave them a job: to fill the earth and care for it.',
      scripture: { text: 'God created man in his own image. In God’s image he created him; male and female he created them.', ref: 'Genesis 1:27' },
    },
    {
      heading: 'And it was very good',
      retelling: 'God looked at everything He had made.',
      scripture: { text: 'God saw everything that he had made, and, behold, it was very good.', ref: 'Genesis 1:31' },
    },
    {
      day: 'Day 7',
      heading: 'Rest',
      retelling: 'Everything was finished. On the seventh day God rested, and He made that day holy. God’s rest means His work was complete — not that He was tired.',
      scripture: { text: 'God… rested on the seventh day… God blessed the seventh day, and made it holy.', ref: 'Genesis 2:2–3' },
    },
  ] as StoryPage[],

  keyWords: [
    { w: 'Created', d: 'God brought it into being. He made it so.' },
    { w: 'Very good', d: 'Just the way God wanted it. Exactly right.' },
    { w: 'Care for', d: 'To watch over something and help it, as God asked people to do.' },
  ],

  questions: [
    {
      key: 'creator' as UnderstandingKey,
      prompt: 'Who made the world and everything in it?',
      banner: '/assets/scene-eden.webp',
      choices: [
        { id: 'god', text: 'God', correct: true, feedback: 'Yes! “In the beginning, God created.” Everything we see began with Him.' },
        { id: 'sun', text: 'The sun', correct: false, feedback: 'The sun is bright, but the sun was made — on Day 4. Who made it?' },
        { id: 'sea', text: 'The sea', correct: false, feedback: 'The sea is wide and deep, but it was made too. Who made the sea?' },
      ] as Choice[],
    },
    {
      key: 'good' as UnderstandingKey,
      prompt: 'When God looked at everything He had made, what did He say about it?',
      banner: '/assets/scene-eden.webp',
      choices: [
        { id: 'verygood', text: 'It was very good', correct: true, feedback: 'That’s it — “God saw everything… and it was very good.”' },
        { id: 'finished', text: 'It was finished', correct: false, feedback: 'It was finished — but look at what God said when He saw it. Genesis 1:31.' },
        { id: 'big', text: 'It was big', correct: false, feedback: 'It is big! But that is not what God said about it. Look again at Genesis 1:31.' },
      ] as Choice[],
    },
  ],

  memory: {
    ref: 'Genesis 1:1',
    full: 'In the beginning, God created the heavens and the earth.',
    before: 'In the beginning, God',
    answer: 'created',
    after: 'the heavens and the earth.',
    // distractors for the supported fill-in
    options: ['created', 'saw', 'called'],
  },

  activity: {
    title: 'Put these four creation moments in order',
    instruction: 'These are four of the days God made the world. Tap them in the order God made them.',
    help: 'It was dark at first — what did God make before anything could be seen? Start there, then move forward through the days.',
    cards: [
      { id: 'light', label: 'Light', hint: 'Day 1', img: '/assets/card-light.webp' },
      { id: 'sky', label: 'Sky', hint: 'Day 2', img: '/assets/card-sky.webp' },
      { id: 'land', label: 'Land & Plants', hint: 'Day 3', img: '/assets/card-land.webp' },
      { id: 'lights', label: 'Sun, Moon & Stars', hint: 'Day 4', img: '/assets/card-lights.webp' },
    ] as OrderCard[],
    correctOrder: ['light', 'sky', 'land', 'lights'],
    // specific feedback keyed by the wrong card a child tries to place next
    feedback: {
      lightsEarly:
        'Look again at Light and the Sun. God made light on Day 1, but the sun, moon, and stars on Day 4. Which came first?',
      generic: 'Not next — think about which day came before this one, and try again.',
    },
  },

  writing: {
    prompt: 'Choose something God made. Tell one thing you notice about it.',
    example: 'God made birds. Birds have wings and feathers.',
    starter: 'God made ____. I notice ____.',
    subjects: [
      { id: 'birds', label: 'birds', img: '/assets/card-fishbirds.webp' },
      { id: 'trees', label: 'trees', img: '/assets/card-land.webp' },
      { id: 'sea', label: 'the sea', img: '/assets/card-sky.webp' },
      { id: 'animals', label: 'animals', img: '/assets/card-animals.webp' },
      { id: 'light', label: 'light', img: '/assets/card-light.webp' },
      { id: 'stars', label: 'stars', img: '/assets/card-lights.webp' },
    ],
    connectBack: (label: string) => `${cap(label)} are part of the creation God called very good.`,
    gratitudeInvite: 'If you like, add why you are thankful for it.',
  },

  // Application is its own care-able scenario, decoupled from the writing subject.
  application: {
    key: 'application' as UnderstandingKey,
    prompt: 'God gives us the job of caring for His world. Which is a good way to care for a plant?',
    icon: '🪴',
    image: '/assets/card-land.webp',
    choices: [
      { id: 'water', text: 'Give it water and light', correct: true, feedback: 'Yes! Plants need water and light to grow. That is caring for it.' },
      { id: 'dark', text: 'Hide it in the dark', correct: false, feedback: 'A plant needs light to live. Would hiding it in the dark help it grow?' },
      { id: 'leaves', text: 'Pull off its leaves', correct: false, feedback: 'Pulling off its leaves would hurt the plant. What does a plant need to stay healthy?' },
    ] as Choice[],
  },
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export type Genesis01 = typeof GENESIS_01;
