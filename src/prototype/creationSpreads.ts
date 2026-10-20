/** WEB quotations: Genesis 1 and Genesis 2:1–3. Retellings are distinct from quotations. */
export interface Spread {
 key: string; day: string; title: string; img: string; alt: string;
 narration: string[]; scripture: {text:string; ref:string};
 secondScripture?: {text:string; ref:string};
}
export const SPREADS: Spread[] = [
  {
    "key": "day1",
    "day": "Day One",
    "title": "Let there be light",
    "img": "/assets/creation-day-1.webp",
    "alt": "A single immense radiance expanding into darkness, with no sun, stars, land, or creatures.",
    "narration": [
      "The earth was formless and dark. Then God spoke: “Let there be light!” And light came into the darkness.",
      "God saw that the light was good. He separated the light from the darkness, calling the light Day and the darkness Night. There was evening and morning—the first day."
    ],
    "scripture": {
      "text": "God said, “Let there be light,” and there was light.",
      "ref": "Genesis 1:3"
    }
  },
  {
    "key": "day2",
    "day": "Day Two",
    "title": "Room for the sky",
    "img": "/assets/creation-day-2.webp",
    "alt": "A wide open sky stretches above the waters, with no land or creatures.",
    "narration": [
      "God spoke again. He made a wide, open space between the waters, separating the waters below from the waters above.",
      "God called the open space Sky. Above the waters stretched a great expanse. There was evening and morning—the second day."
    ],
    "scripture": {
      "text": "God called the expanse “sky”.",
      "ref": "Genesis 1:8, excerpt"
    }
  },
  {
    "key": "day3",
    "day": "Day Three",
    "title": "A world growing green",
    "img": "/assets/creation-day-3.webp",
    "alt": "Fruit trees and lush green plants grow on land beside the sea.",
    "narration": [
      "God gathered the waters, and dry land appeared. He called the dry land Earth and the gathered waters Seas. God saw that it was good.",
      "Then the land grew green with grass, seed-bearing plants, and trees bearing fruit. God saw that it was good. There was evening and morning—the third day."
    ],
    "scripture": {
      "text": "God called the dry land “earth”, and the gathering together of the waters he called “seas”. God saw that it was good.",
      "ref": "Genesis 1:10"
    }
  },
  {
    "key": "day4",
    "day": "Day Four",
    "title": "Lights for day and night",
    "img": "/assets/creation-day-4.webp",
    "alt": "Sunlight falls across the coast as the moon and stars shine in a poetic transition from day to night.",
    "narration": [
      "God made lights in the sky: the sun to rule the day, the moon to rule the night, and the stars.",
      "These lights marked the seasons, days, and years. God set them in the sky to give light to the earth. God saw that it was good. There was evening and morning—the fourth day."
    ],
    "scripture": {
      "text": "God made the two great lights: the greater light to rule the day, and the lesser light to rule the night. He also made the stars.",
      "ref": "Genesis 1:16"
    }
  },
  {
    "key": "day5",
    "day": "Day Five",
    "title": "Life in sea and sky",
    "img": "/assets/creation-day-5.webp",
    "alt": "Birds fly above the sea while fish and a great sea creature swim below.",
    "narration": [
      "God spoke, and the waters filled with living creatures. Great sea creatures and small swimming things moved through the seas. Birds flew across the sky.",
      "God saw that it was good. He blessed the creatures, telling them to multiply and fill the seas and the sky with life. There was evening and morning—the fifth day."
    ],
    "scripture": {
      "text": "God said, “Let the waters abound with living creatures, and let birds fly above the earth in the open expanse of the sky.”",
      "ref": "Genesis 1:20"
    }
  },
  {
    "key": "day6",
    "day": "Day Six",
    "title": "Animals—and people",
    "img": "/assets/creation-day-6.webp",
    "alt": "Land animals fill a flourishing garden; a man and woman are seen from behind, modestly screened by foliage.",
    "narration": [
      "God made the land animals: creatures that walked, leaped, and crept along the ground. Then God made people—male and female—in His own image.",
      "God blessed them and gave them responsibility to rule and care for His world. He looked at everything He had made. It was very good. There was evening and morning—the sixth day."
    ],
    "scripture": {
      "text": "God created man in his own image. In God’s image he created him; male and female he created them.",
      "ref": "Genesis 1:27"
    },
    "secondScripture": {
      "text": "God saw everything that he had made, and, behold, it was very good.",
      "ref": "Genesis 1:31, excerpt"
    }
  },
  {
    "key": "day7",
    "day": "Day Seven",
    "title": "The work was complete",
    "img": "/assets/creation-day-7.webp",
    "alt": "A peaceful, completed world with a river, flourishing trees, and resting animals.",
    "narration": [
      "The heavens and the earth were finished, with all their life and beauty. On the seventh day, God rested from His work.",
      "God was not tired. His work of creation was complete. He blessed the seventh day and made it holy—a day set apart. His good world was finished."
    ],
    "scripture": {
      "text": "God blessed the seventh day, and made it holy, because he rested in it from all his work of creation which he had done.",
      "ref": "Genesis 2:3"
    }
  }
];
