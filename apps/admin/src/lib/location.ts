export const GUWAHATI_AREAS = [
  { name: "Jalukbari", lat: 26.1557, lng: 91.6631 },
  { name: "Maligaon", lat: 26.1578, lng: 91.6917 },
  { name: "Pan Bazar", lat: 26.1856, lng: 91.7472 },
  { name: "Paltan Bazar", lat: 26.1784, lng: 91.7512 },
  { name: "Ganeshguri", lat: 26.1507, lng: 91.7806 },
  { name: "Six Mile", lat: 26.1345, lng: 91.8054 },
  { name: "Beltola", lat: 26.1165, lng: 91.7941 },
  { name: "Dispur", lat: 26.1433, lng: 91.7898 },
  { name: "Noonmati", lat: 26.1895, lng: 91.7995 },
  { name: "Khanapara", lat: 26.1158, lng: 91.8217 },
];

export const findLocation = (query: string) => {
  return GUWAHATI_AREAS.find(area => area.name.toLowerCase().includes(query.toLowerCase()));
};
