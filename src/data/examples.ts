export interface ExampleText {
  id: string;
  title: string;
  source: string;
  text: string;
}

export const EXAMPLE_TEXTS: ExampleText[] = [
  {
    id: "1",
    title: "Corporate Earnings Report",
    source: "Quarterly Report",
    text: "The company announced today that quarterly profits exceeded expectations despite challenges in the global market and ongoing supply chain disruptions that have plagued the industry for months. Shareholders expressed cautious optimism about the future while analysts warned that uncertainty remains the only constant in an ever-shifting economic landscape. Growth targets were revised upward but tempered by realistic assessments of consumer spending patterns and the persistent shadow of inflation hovering over every transaction.",
  },
  {
    id: "2",
    title: "I Have a Dream (Excerpt)",
    source: "Martin Luther King Jr., 1963",
    text: "I have a dream that one day this nation will rise up and live out the true meaning of its creed. We hold these truths to be self-evident that all men are created equal. I have a dream that one day on the red hills of Georgia the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood.",
  },
  {
    id: "3",
    title: "The Metamorphosis (Opening)",
    source: "Franz Kafka",
    text: "One morning when Gregor Samsa woke from troubled dreams he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back and if he lifted his head a little he could see his brown belly slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment.",
  },
  {
    id: "4",
    title: "Terms of Service",
    source: "Generic App ToS",
    text: "By accessing or using our services you agree to be bound by these terms. We reserve the right to modify or terminate the service for any reason without notice at any time. Your continued use of the platform following the posting of any changes constitutes acceptance of those changes. You are responsible for safeguarding the password that you use and for any activities or actions under your password. We encourage you to use strong unique passwords.",
  },
  {
    id: "5",
    title: "Weather Forecast",
    source: "Morning News",
    text: "Clouds will gather across the northern regions bringing scattered showers by late afternoon. Temperatures will remain below seasonal averages as a persistent cold front refuses to release its grip on the coast. Residents are advised to carry umbrellas and dress in layers. By evening the skies may clear briefly revealing stars that have been hidden for weeks behind the grey curtain of winter.",
  },
];
