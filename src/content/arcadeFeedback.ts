import passages from './arcadeScripture.json';
import type { TriviaQ } from './arcadeTrivia';

const teachingNotes: Record<string, string> = {
  "How many books are in the Bible?": "The 66-book Protestant Bible has 39 Old Testament books and 27 New Testament books: 39 + 27 = 66.",
  "What are Matthew, Mark, Luke, and John called?": "These four books are the Gospels. Each tells the good news of Jesus’ life, death, and resurrection.",
  "What part of the Bible tells about Jesus' life?": "Matthew, Mark, Luke, and John—the four Gospels—tell about Jesus’ earthly life and ministry.",
  "What part of the Bible comes before Jesus was born?": "The Old Testament records events before Jesus’ birth and promises the coming Messiah.",
  "What part of the Bible comes after Jesus was born?": "The New Testament begins with the Gospels and tells about Jesus and the early church.",
  "How many books are in the Old Testament?": "The Old Testament has 39 books, from Genesis through Malachi in this Bible’s order.",
  "How many books are in the New Testament?": "The New Testament has 27 books, from Matthew through Revelation.",
  "Which book comes after Acts?": "In the New Testament’s order, Acts is followed by Romans, the first of Paul’s letters.",
  "Which book comes before Psalms?": "The wisdom-book sequence begins Job, Psalms, Proverbs. Job comes immediately before Psalms.",
  "Which Gospel comes first?": "The Gospels appear in this order: Matthew, Mark, Luke, John.",
  "Which book tells about the early church?": "Acts continues after the Gospels, describing the Holy Spirit’s work through the apostles and the spread of the early church.",
  "Which New Testament book comes last?": "Revelation follows Jude and concludes the New Testament.",
  "Which section includes Isaiah and Jeremiah?": "Isaiah and Jeremiah are grouped with the Major Prophets. Major refers to the length of the writings, not greater importance.",
  "Which section includes Psalms and Proverbs?": "Psalms and Proverbs belong to Poetry/Wisdom alongside Job, Ecclesiastes, and Song of Solomon.",
  "Which section includes Romans and Corinthians?": "Romans and 1 and 2 Corinthians are letters written by Paul, so they belong to Paul’s Letters.",
  "Which Gospel is the shortest?": "Mark is the shortest of the four Gospels and moves quickly through Jesus’ ministry.",
  "Which empire ruled during most of the New Testament?": "The New Testament takes place under Roman imperial rule, including the reigns of Augustus and Tiberius.",
  "Which New Testament book contains the seven churches?": "Revelation 2–3 contains Jesus’ messages to seven churches in Asia Minor.",
  'What is the first book of the Bible?': 'Genesis opens the Bible with creation and the beginnings of God’s dealings with humanity.',
  'What is the last book of the Bible?': 'Revelation concludes the New Testament and the Bible’s 66-book order.',
  'What book tells about the beginning?': 'Genesis begins with God creating the heavens and the earth.',
  'What book tells about Moses leading Israel out of Egypt?': 'Exodus tells how God brought Israel out of slavery in Egypt through Moses.',
  'What book has many songs and prayers?': 'Psalms is a collection of songs and prayers of praise, sorrow, trust, and thanksgiving to God.',
  'Which Gospel alone records the raising of Lazarus?': 'John 11 tells how Jesus called Lazarus out of the tomb. The other three Gospels do not record this event.',
  'Which Old Testament book contains the suffering servant prophecy?': 'Isaiah 53 describes the suffering servant who bears the sins of others.',
  "Which psalm is the longest chapter in the Bible, praising God's law?": 'Psalm 119 has 176 verses. Its repeated theme is delight in God’s word and commandments.',
  'Which resurrection chapter is 1 Corinthians best known for?': 'In 1 Corinthians 15, Paul explains Christ’s resurrection and the future resurrection of believers.',
};

/** Quoted evidence is kept separate from our explanatory notes. */
export function triviaFeedback(q: TriviaQ) {
  const passage = (passages as Record<string, string>)[q.ref];
  const answer = q.opts[q.a];
  let note = teachingNotes[q.q];
  if (!note && /^Who (.+)\?$/.test(q.q)) {
    note = `${answer} ${q.q.replace(/^Who /, '').replace(/\?$/, '')}.`;
  }
  return { note: note ?? `The passage below is the Scripture context for “${answer}.”`, passage,
    url: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(q.ref.replace(/ \(WEB\)$/, ''))}&version=WEB` };
}
