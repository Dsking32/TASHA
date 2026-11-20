// Photos are served from Unsplash's CDN (free to use under the Unsplash
// License; hotlinking is what Unsplash asks for). `img(id, w)` returns a
// resized, auto-format URL so phones don't download desktop-sized files.
// Swap any of these for TASHA's own fleet/terminal photos when available.

export const img = (id, w = 1200, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70&w=${w}${h ? `&h=${h}` : ''}`;

export const PHOTOS = {
  // Loaded bus on a northern highway at dawn
  hero: '1613463918637-3574cd5d34c0',
  // Toyota HiAce, rear view
  hiace: '1650807486050-a142ea418b19',
  // Couple in matching pink aso-ebi — group/event travel
  couple: '1589199051916-92cd36b97ffa',
  // Woman on pink backdrop holding a phone — ticket on your phone
  phone: '1680879275304-bbe20f7e28fb',
  // Woman celebrating in front of a white bus
  traveller: '1726273858078-cb94feb4cf53',
  // Woman leaning out of a bus window
  window: '1770283553940-e72cbeeb9342',

  // Faces for the hero avatar row
  faces: [
    '1522529599102-193c0d76b5b6',
    '1589635021366-24ce21374163',
    '1526379879527-8559ecfcaec0',
    '1602342323893-b11f757957c9',
  ],

  // Destination cities
  abujaMosque: '1609657726788-44564a8f304a',
  abujaFlags: '1733122051092-c19022119205',
  lagosBridge: '1719314073622-9399d167725b',
  lagosSkyline: '1618828665011-0abd973f7bb8',
  durbar: '1668246153111-07549350eda7',
  northernAttire: '1779950656422-85b9c5253237',
};
