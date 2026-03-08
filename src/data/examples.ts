export interface ExampleText {
  id: string;
  title: string;
  source: string;
  text: string;
}

export const EXAMPLE_TEXTS: ExampleText[] = [
  {
    id: "1",
    title: "Love & Growing Apart",
    source: "Personal Essay",
    text: "She told me she needed space, but what she really meant was that I had become too small for the person she was trying to become. We loved each other, but love isn't always enough when two people are growing in different directions. I watched her pack her suitcase and thought about all the ways we had tried to fit together, all the compromises that felt like sacrifices.",
  },
  {
    id: "2",
    title: "Time Management Advice",
    source: "Productivity Blog",
    text: "Time management experts suggest breaking large tasks into smaller, more manageable pieces. They recommend setting clear goals and deadlines. But even with the best systems, we often find ourselves running out of time, chasing something we can't quite name, hoping tomorrow will be different than today.",
  },
  {
    id: "3",
    title: "The Grocery Store Clerk",
    source: "Short Fiction",
    text: "The grocery store clerk told me she dreams about scanning items every night. Beep after beep, an endless line of customers, cans of soup and boxes of cereal passing under the red light. She said sometimes she can't tell if she's awake or still dreaming when she's at work.",
  },
  {
    id: "4",
    title: "A Mother's Worry",
    source: "Personal Reflection",
    text: "My mother used to say that worry was just love with nowhere to go. She would stand at the window watching for my return, imagining every possible disaster. I didn't understand then that her fear was proof of how much she cared, how the world felt dangerous because I was in it.",
  },
  {
    id: "5",
    title: "City Life",
    source: "Urban Observation",
    text: "In the coffee shop, everyone is alone together. Headphones in, eyes down, carefully avoiding the proximity of strangers. We've built invisible walls in public spaces, protecting ourselves from the possibility of connection. Sometimes I wonder if we're hiding or just afraid of being seen.",
  },
];
