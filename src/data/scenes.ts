// Bible scenes for the landing carousel — ported verbatim from the preview.
export interface Scene {
  image: string;
  position?: string;
  title: string;
  passage: string;
  theme: string;
  alt: string;
}

export const BIBLE_SCENES: Scene[] = [
  {
    image: '/assets/scene-jesus-children.webp',
    position: 'center 31%',
    title: 'Let the children come.',
    passage: 'MARK 10:13–16',
    theme: 'Jesus welcomes the little ones.',
    alt: 'Jesus welcoming and blessing children beneath an olive tree in a sunlit Judean village',
  },
  {
    image: '/assets/scene-moses.webp',
    title: 'A way through the sea.',
    passage: 'EXODUS 14',
    theme: 'God delivers His people.',
    alt: 'Moses and the Israelites crossing between the parted walls of the Red Sea',
  },
  {
    image: '/assets/scene-david.webp',
    position: 'center 16%',
    title: 'The battle belongs to the Lord.',
    passage: '1 SAMUEL 17',
    theme: 'A shepherd faces a giant with faith in God.',
    alt: 'Over David’s softly blurred shoulder, Goliath stands in sharp focus across the Valley of Elah',
  },
  {
    image: '/assets/scene-jonah.webp',
    title: 'Even here, God hears.',
    passage: 'JONAH 1–2',
    theme: 'Mercy reaches into the depths.',
    alt: 'A great fish in the stormy sea near an ancient sailing ship, illustrating Jonah',
  },
  {
    image: '/assets/scene-elijah.webp',
    position: 'center 43%',
    title: 'The Lord—He is God.',
    passage: '1 KINGS 18:30–39',
    theme: 'Fire falls on Elijah’s altar at Mount Carmel.',
    alt: 'Elijah standing before a stone altar as fire descends from heaven',
  },
  {
    image: '/assets/scene-noah.webp',
    title: 'A promise after the storm.',
    passage: 'GENESIS 7–9',
    theme: 'God remembers Noah and every living creature.',
    alt: 'Noah’s wooden ark beneath a rainbow, with a dove returning through the light',
  },
  {
    image: '/assets/scene-empty-tomb.webp',
    position: 'center 50%',
    title: 'He is risen.',
    passage: 'JOHN 20:1–9',
    theme: 'The tomb is empty. Jesus lives.',
    alt: 'A close-up of the empty rock-cut tomb, with its round stone rolled aside and linen cloths inside',
  },
];
