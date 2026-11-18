export type CoverVariant = 'botanical' | 'light' | 'orchard' | 'weather' | 'cinder' | 'arch';

export interface Book {
  id: string;
  title: string;
  titleLines: string[];
  author: string;
  category: string;
  progress: number;
  saved: boolean;
  chapterNumber: number;
  chapterTitle: string;
  minutesLeft: number;
  cover: CoverVariant;
  coverDescription: string;
  excerpt: string[];
}

export const initialBooks: Book[] = [
  {
    id: 'cartographer',
    title: 'The Cartographer of Quiet',
    titleLines: ['The Cartographer', ' of Quiet'],
    author: 'Rowan Vale',
    category: 'Essays',
    progress: 42,
    saved: true,
    chapterNumber: 4, chapterTitle: 'The unmapped hour',
    minutesLeft: 12,
    cover: 'botanical',
    coverDescription: 'Two marigold and magenta leaves pressed over an aubergine grid.',
    excerpt: [
      'Before the town learned to name its streets, there was a path that appeared only after rain. It began beside the old washhouse and ended wherever the walker stopped wanting an answer.',
      'Mara kept no record of destinations. Instead, she collected intervals: the hush after a bell, the blue pause before dawn, the generous silence between two people who no longer needed to fill it.',
      'On the last page of her notebook she drew a door without a wall. Beneath it she wrote: some places are found by staying long enough to notice them.',
    ],
  },
  {
    id: 'yellow-light',
    title: 'A Field Guide to Yellow Light',
    titleLines: ['A Field Guide', 'to Yellow Light'],
    author: 'Mina Sol',
    category: 'Poetry',
    progress: 68,
    saved: true,
    chapterNumber: 9, chapterTitle: 'Late apricots',
    minutesLeft: 8,
    cover: 'light',
    coverDescription: 'A warm sun sinking behind fine architectural arcs.',
    excerpt: [
      'At five, the orchard turns briefly honest. Every leaf admits its edges; every pear carries a small country of gold.',
      'I have stopped calling this hour an ending. A window opens in the kitchen. Someone downstairs sets a spoon against a cup, and the sound is enough to gather the day.',
      'Let the light leave slowly. Let it take only what it borrowed.',
    ],
  },
  {
    id: 'orchard',
    title: 'The Orchard at Night',
    titleLines: ['The Orchard', 'at Night'],
    author: 'Ilex Wren',
    category: 'Fiction',
    progress: 0,
    saved: false,
    chapterNumber: 1, chapterTitle: 'The gate left open',
    minutesLeft: 18,
    cover: 'orchard',
    coverDescription: 'A crescent moon above an abstract flowering branch.',
    excerpt: [
      'The gate had learned to sigh before I did. On the last evening of summer, I pushed it open and found the orchard keeping its own counsel beneath a wool-dark sky.',
      'Each tree held one lamp, though no wire joined them. Their light fell in small circles, like places set for guests who might arrive at any moment.',
      'I chose the nearest chair. From somewhere inside the house came the sound of my name, spoken gently and twenty years too late.',
    ],
  },
  {
    id: 'weather',
    title: 'Small Weather',
    titleLines: ['Small', 'Weather'],
    author: 'June Arlo',
    category: 'Essays',
    progress: 24,
    saved: true,
    chapterNumber: 3, chapterTitle: 'A pocket of rain',
    minutesLeft: 15,
    cover: 'weather',
    coverDescription: 'A ribbon of rain crossing a precise printed weather grid.',
    excerpt: [
      'Rain arrived without the ceremony predicted by the radio. It darkened one slate, then another, until the whole roof held a softer version of the sky.',
      'There are forecasts we make for ourselves: by Tuesday, courage; by winter, a little less longing. They rarely hold, and still we pin them beside the window.',
      'Today I will measure only what fits in the palm of my hand: three drops, a warm coin, the green stem of something beginning.',
    ],
  },
  {
    id: 'cinder',
    title: 'Salt & Cinder',
    titleLines: ['Salt', '& Cinder'],
    author: 'Noa Bell',
    category: 'Fiction',
    progress: 100,
    saved: true,
    chapterNumber: 12, chapterTitle: 'What the fire kept',
    minutesLeft: 0,
    cover: 'cinder',
    coverDescription: 'Curving ember ribbons on a dark, tactile field.',
    excerpt: [
      'By morning the kiln was cool enough to touch. We opened it together, the way we had opened every difficult letter since childhood: quickly, and with our faces turned away.',
      'Inside, the blue bowl was whole. A single white line crossed its rim where the ash had rested, fine as a sentence whispered through a wall.',
      'Nessa lifted it into the light. Outside, the sea repeated its oldest instruction, and for once we did not mistake it for goodbye.',
    ],
  },
  {
    id: 'almost',
    title: 'The Museum of Almost',
    titleLines: ['The Museum', 'of Almost'],
    author: 'Elia North',
    category: 'Stories',
    progress: 0,
    saved: false,
    chapterNumber: 1, chapterTitle: 'Rooms without doors',
    minutesLeft: 14,
    cover: 'arch',
    coverDescription: 'An open architectural arch framing a geometric flower.',
    excerpt: [
      'The museum opened only on the days between appointments. Its curator wore grey gloves and spoke of each exhibit as though it had once belonged to someone famous.',
      'Here was the train not taken. There, the letter carried in a coat pocket for forty years. Upstairs, behind a rope of braided silk, waited every version of home.',
      'I asked if anything was ever returned. The curator smiled and handed me a ticket stamped with tomorrow’s date.',
    ],
  },
];

export interface ReadingNote {
  id: number;
  bookId: string;
  text: string;
  createdAt: string;
  page?: number;
  completed?: boolean;
  personal?: boolean;
}

export const initialNotes: ReadingNote[] = [
  {
    id: 1,
    bookId: 'yellow-light',
    text: 'The ordinary sounds are the scene. A spoon against a cup can hold the whole day.',
    createdAt: '2026-11-14T12:00:00',
    page: 86,
  },
  {
    id: 2,
    bookId: 'cartographer',
    text: 'A map of pauses, not places. Return to this idea for Thursday’s reading circle.',
    createdAt: '2026-11-11T12:00:00',
    page: 41,
  },
  {
    id: 3,
    bookId: 'cinder',
    text: 'An ending that makes repair feel possible without making it feel easy.',
    createdAt: '2026-11-02T12:00:00',
    completed: true,
  },
];
