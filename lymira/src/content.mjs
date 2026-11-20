// All site content lives here. Edit prices, links and copy in this file,
// then run `npm run build`.
//
// price: null  -> the page shows "See price in store" instead of a number.
// url: null    -> the buy button links to the main Payhip store page.

export const site = {
  name: 'Lymira Creations',
  tagline: 'Made to Reconnect',
  // Open item 4 in the brief: confirm this wording.
  subtagline:
    'From quiet self-care moments to milestone celebrations, creations crafted for every connection that matters.',
  domain: 'https://lymiracollective.com',
  store: 'https://payhip.com/LymiraCreations',
  whatsapp: 'https://wa.me/971501799508',
  email: 'hello@lymiracollective.com',
  legal: 'Lymira Creations is a trading name of Lymira FZ-LLC.',
  social: [
    { label: 'Instagram', url: 'https://instagram.com/lymira_creations' },
    { label: 'TikTok', url: 'https://tiktok.com/@lymira118' },
    { label: 'Facebook', url: 'https://facebook.com/LymiraCreations' },
    { label: 'Pinterest', url: 'https://pinterest.com/lymiracreations' },
  ],
  fiverr: {
    profile: 'https://www.fiverr.com/lymiracreations',
    invitations: 'http://www.fiverr.com/s/emm9Rj4',
    storybooks: 'http://www.fiverr.com/s/K33lYzV',
  },
}

export const categories = [
  {
    id: 'journals',
    name: 'Journals & Reflection',
    wash: 'lavender',
    world: 'Reconnect with yourself',
    blurb: 'Guided pages for the quiet minutes you keep for yourself.',
  },
  {
    id: 'little-hearts',
    name: 'Little Hearts Big Feelings',
    wash: 'sage',
    world: 'Reconnect with your child',
    blurb: 'The Poppy series: storybooks and activity books for ages 3 to 8.',
  },
  {
    id: 'becoming',
    name: 'Becoming',
    wash: 'rose',
    world: 'Reconnect with who you are becoming',
    blurb: 'An invitation bundle for healing, growth and new beginnings.',
  },
  {
    id: 'celebrations',
    name: 'Celebrations',
    wash: 'blue',
    world: 'Reconnect with loved ones',
    blurb: 'Editable invitations, cards and invitation websites.',
  },
]

const poppyReceive = [
  'A printable PDF, ready to print at home or at school',
  'An online flipbook link to read on a phone, tablet or laptop',
]

const canvaReceive = [
  'A thank-you PDF with your template link inside',
  'Your own editable copy of the design in Canva',
]

export const products = [
  // ---------------- Little Hearts Big Feelings ----------------
  {
    slug: 'poppy-and-the-garden-of-feelings',
    title: 'Poppy and the Garden of Feelings',
    category: 'little-hearts',
    type: 'Storybook · Book 1',
    price: '$7.49',
    url: null, // [CONFIRM URL]
    featured: false,
    line: 'A first story about big feelings.',
    problem: 'For the moments a small child feels something big and has no word for it yet.',
    body: [
      'Book 1 in the Poppy series. Poppy the fox and her friend Lumi the butterfly help children understand big feelings, one gentle breath at a time.',
      'A social-emotional learning story written by a former teacher, for reading together at bedtime or on the classroom carpet.',
    ],
    receive: poppyReceive,
    poppy: true,
    alt: 'Poppy and the Garden of Feelings storybook shown on a tablet in a sunlit room',
  },
  {
    slug: 'poppys-feelings-activity-book',
    title: "Poppy's Feelings Activity Book",
    category: 'little-hearts',
    type: 'Interactive activity book',
    price: '$5.99',
    url: null, // [CONFIRM URL]
    line: 'Interactive activities with read-along audio.',
    problem: 'Keeps the conversation about feelings going after the story ends.',
    body: [
      'The interactive companion to Poppy and the Garden of Feelings, with read-along audio so younger children can follow on their own.',
    ],
    receive: ['An interactive activity book with read-along audio', ...poppyReceive],
    poppy: true,
    alt: "Poppy's Feelings Activity Book open on a tablet beside colouring pencils",
  },
  {
    slug: 'poppys-feelings-bundle',
    title: "Poppy's Feelings Bundle",
    category: 'little-hearts',
    type: 'Storybook + activity book',
    price: '$10.99',
    url: 'https://payhip.com/b/vSLQc',
    featured: true,
    line: 'The storybook and its activity book together.',
    problem: 'Read the story, then practise what Poppy learned, in one download.',
    body: [
      'Poppy and the Garden of Feelings with its interactive activity book. Read about big feelings first, then explore them through play.',
    ],
    receive: [
      'Poppy and the Garden of Feelings storybook',
      "Poppy's Feelings Activity Book with read-along audio",
      ...poppyReceive,
    ],
    poppy: true,
    alt: "Poppy's Feelings Bundle, the storybook and activity book shown side by side on two devices",
  },
  {
    slug: 'poppy-and-the-lonely-hedgehog',
    title: 'Poppy and the Lonely Hedgehog',
    category: 'little-hearts',
    type: 'Storybook · Book 2',
    price: '$8.49',
    url: 'https://payhip.com/b/03GrV',
    line: 'A story about empathy: Notice, Wonder, Care.',
    problem: 'Helps children spot when someone feels left out, and know what to do next.',
    body: [
      'Book 2 in the Poppy series. Poppy meets Hugo the hedgehog and learns three small steps of empathy: Notice, Wonder, Care.',
      'A social-emotional learning story for home and classroom, written by a former teacher.',
    ],
    receive: poppyReceive,
    poppy: true,
    alt: 'Poppy and the Lonely Hedgehog storybook shown on a tablet in soft morning light',
  },
  {
    slug: 'hugos-kindness-activity-book',
    title: "Hugo's Kindness Activity Book",
    category: 'little-hearts',
    type: 'Interactive activity book',
    price: '$5.99',
    url: 'https://payhip.com/b/oRIaA',
    line: 'Kindness and empathy games for ages 3 to 8.',
    problem: 'Turns "be kind" into something a young child can practise.',
    body: [
      'The interactive companion to Poppy and the Lonely Hedgehog, filled with kindness and empathy games for ages 3 to 8.',
    ],
    receive: ['An interactive activity book', ...poppyReceive],
    poppy: true,
    alt: "Hugo's Kindness Activity Book open on a tablet on a child's desk",
  },
  {
    slug: 'hugos-kindness-bundle',
    title: "Hugo's Kindness Bundle",
    category: 'little-hearts',
    type: 'Storybook + activity book',
    price: '$11.99',
    url: 'https://payhip.com/b/M1d7O',
    featured: true,
    line: 'The Lonely Hedgehog story with its activity book.',
    problem: 'A story about empathy and the games to practise it, in one download.',
    body: [
      "Poppy and the Lonely Hedgehog with Hugo's Kindness Activity Book. Meet Hugo in the story, then practise Notice, Wonder, Care through play.",
    ],
    receive: [
      'Poppy and the Lonely Hedgehog storybook',
      "Hugo's Kindness Activity Book",
      ...poppyReceive,
    ],
    poppy: true,
    alt: "Hugo's Kindness Bundle, the storybook and activity book shown together on two devices",
  },

  // ---------------- Journals & Reflection ----------------
  {
    slug: 'bloom-where-you-are',
    title: 'Bloom Where You Are',
    subtitle: '30 Days of Self-Care',
    category: 'journals',
    type: 'Self-care journal',
    price: '$8.49',
    url: null, // [CONFIRM URL]
    featured: true,
    line: 'A 30-day self-care journal.',
    problem: 'For when you look after everyone else first and your own day never comes.',
    body: [
      'A gentle journal to nurture your mind, body & bloom. Thirty days of guided pages, one small pause at a time.',
      'Made for everyday women and teenage girls, and used by teachers and counsellors too. This is the creation Lymira began with.',
    ],
    receive: ['A 42-page journal in A4', 'An instant digital download'],
    alt: 'Bloom Where You Are self-care journal shown on a tablet beside a cup of tea in morning sun',
  },

  // ---------------- Celebrations: invitations and cards ----------------
  {
    slug: 'christmas-as-we-lived-it',
    title: 'Christmas As We Lived It',
    category: 'celebrations',
    group: 'cards',
    type: 'Festive cards · Set of two',
    price: '$4.49',
    url: null, // [CONFIRM URL]
    featured: true,
    line: 'A greeting card and a photo card in one set.',
    problem: 'One card to say it, one to show it: your wishes and your year, sent together.',
    body: [
      'Two Festive cards in one set. The first is a ready-written greeting card. The second is a photo card for your favourite moments of the year.',
    ],
    receive: canvaReceive,
    canva: true,
    size: '5 x 7 in',
    alt: 'Christmas As We Lived It card set, a greeting card and a photo card displayed on a phone',
  },
  {
    slug: 'diwali-radiant-cards',
    title: 'Diwali Radiant Cards',
    category: 'celebrations',
    group: 'cards',
    type: 'Radiant cards · Greeting card',
    price: '$2.60',
    url: null, // [CONFIRM URL]
    line: 'A greeting card in landscape and portrait.',
    problem: 'A Diwali greeting with detail in it, for sending to the people you cannot visit.',
    body: [
      'A watercolour Diwali greeting card, supplied as both a landscape and a portrait template so it suits however you share it.',
    ],
    receive: canvaReceive,
    canva: true,
    size: '5 x 7 in',
    alt: 'Diwali Radiant card in watercolour shown on a phone screen',
  },
  {
    slug: 'halloween-party-invitation',
    title: 'Halloween Party Invitation',
    category: 'celebrations',
    group: 'cards',
    type: 'Invitation · Dreamy pastel',
    price: '$2.60',
    url: null, // [CONFIRM URL]
    line: 'A dreamy pastel party invitation.',
    problem: 'A Halloween invitation that is sweet instead of scary, ready to send tonight.',
    body: [
      'A dreamy pastel watercolour invitation for a Halloween party. Add your date, time and place, then send it on WhatsApp or by text.',
    ],
    receive: canvaReceive,
    canva: true,
    size: '5 x 7 in',
    alt: 'Dreamy pastel Halloween party invitation shown on a phone',
  },
  {
    slug: 'silly-goose-baby-shower-invitation',
    title: 'Silly Goose Baby Shower Invitation',
    category: 'celebrations',
    group: 'cards',
    type: 'Invitation · 3D Pop',
    price: null, // [CONFIRM]
    url: null,
    line: 'A playful 3D Pop baby shower invitation.',
    problem: 'A baby shower invitation with character, for hosts who want guests to smile before they arrive.',
    body: [
      'The first creation in the 3D Pop style: soft sculpted artwork and puffy, glossy lettering. Add the shower details and send it on WhatsApp or by text.',
    ],
    receive: canvaReceive,
    canva: true,
    size: '5 x 7 in',
    alt: 'Silly Goose baby shower invitation in 3D Pop style shown on a phone',
  },

  // ---------------- Celebrations: invitation websites ----------------
  {
    slug: 'tailor-made-wedding-website',
    title: 'Tailor-Made Wedding Website Invitation',
    category: 'celebrations',
    group: 'websites',
    type: 'Invitation website · Tailor-made',
    price: null,
    priceNote: 'WhatsApp us for price details',
    whatsapp: true,
    showcase: 'Wedding',
    line: 'Designed for you, in the style you choose.',
    problem: 'Everything your guests need for the day, in one link they can open on their phone.',
    body: [
      'A mobile-first wedding invitation website designed around you. Typical pages are a welcome envelope, the invitation, the details, RSVP and your love story.',
      'Offered in several styles, from watercolour to a more formal, luxurious look. Multi-event weddings are quoted per event. Engagements and save the dates are part of the same range.',
    ],
    receive: [
      'A finished invitation website with one link to share',
      'A countdown to the day',
      'Your site live until the day of the event',
    ],
    website: true,
    alt: 'Tailor-made wedding invitation website shown on a phone held in warm sunlight',
  },
  {
    slug: 'wedding-website-template',
    title: 'Wedding Website Invitation Template',
    category: 'celebrations',
    group: 'websites',
    type: 'Invitation website · DIY Canva template',
    price: null, // [CONFIRM]
    url: null,
    line: 'A dusty blue wedding site to edit yourself.',
    problem: 'A wedding website you can finish in an evening, without hiring a designer.',
    body: [
      'A dusty blue wedding invitation website as an editable Canva template. Add your names, details and photos, publish from Canva and share the link.',
    ],
    receive: canvaReceive,
    canva: true,
    website: true,
    alt: 'Dusty blue wedding invitation website template shown on a phone',
  },
  {
    slug: 'princess-unicorn-birthday-website',
    title: 'Princess Unicorn Birthday Invite',
    category: 'celebrations',
    group: 'websites',
    type: 'Invitation website · Canva template',
    price: null, // [CONFIRM]
    url: null,
    showcase: 'Birthday',
    line: "A children's birthday invitation website.",
    problem: 'A birthday invitation that keeps the time, the place and the RSVP in one link.',
    body: [
      "A children's birthday invitation website in the 3D Pop style, as an editable Canva template. Add the party details and share the link with parents.",
    ],
    receive: canvaReceive,
    canva: true,
    website: true,
    alt: 'Princess Unicorn birthday invitation website shown on a phone',
  },
  {
    slug: 'santas-coming-to-town-website',
    title: "Santa's Coming to Town",
    category: 'celebrations',
    group: 'websites',
    type: 'Invitation website · Canva template',
    price: null, // [CONFIRM]
    url: null,
    showcase: 'Christmas',
    line: 'A Christmas party invitation website.',
    problem: 'A Christmas party invitation guests can open, read and answer from their phone.',
    body: [
      'A Christmas party invitation website in a vintage stitched and lace style, as an editable Canva template.',
    ],
    receive: canvaReceive,
    canva: true,
    website: true,
    alt: "Santa's Coming to Town Christmas party invitation website shown on a phone",
  },
  {
    slug: 'cherry-on-top-bachelorette',
    title: 'Cherry On Top Bachelorette High Tea',
    category: 'celebrations',
    group: 'websites',
    type: 'Invitation website · Canva template',
    price: null,
    comingSoon: true,
    showcase: 'Bachelorette',
    line: 'A Paris café high tea, in pink gingham and cherries.',
    problem: 'A bachelorette invitation that introduces the whole party before the day.',
    body: [
      'A bachelorette high tea invitation website set in a Paris café, with pink gingham and cherries. Eight pages: Welcome, Invitation, Details, Meet the Cherries, The Afternoon, The Vibe, Good to Know and RSVP.',
    ],
    receive: canvaReceive,
    canva: true,
    website: true,
    alt: 'Cherry On Top bachelorette high tea invitation website shown on a phone',
  },
]

export const reviews = [
  {
    quote:
      'Excellently presented with a lot of thought put into it… would highly recommend their services.',
    name: 'Nutan',
    about: 'Wedding website',
  },
  {
    quote:
      'Encouraged me to slow down, reconnect with myself and take a little time each day for my own wellbeing… every detail feels like it was created with genuine care.',
    name: 'Lauren',
    about: 'Bloom Where You Are',
  },
  {
    quote:
      'Introduces children to different feelings in such a gentle and simple way… warm, comforting and meaningful.',
    name: 'Tyrone',
    about: 'Poppy and the Garden of Feelings',
  },
  {
    quote:
      'Does not feel like just another generic digital card. There is a lot of thought and detail behind it.',
    name: 'Tyrone',
    about: 'Diwali card',
  },
]
