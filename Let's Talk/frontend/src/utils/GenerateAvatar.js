const generateUIAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&font-size=0.6`;

const avatarNames = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley",
  "Avery", "Blake", "Cameron", "Dakota", "Ellis", "Finley"
];

export const generateAvatar = () => {
  const data = [];

  // Generate 6 random avatars using different names
  for (let i = 0; i < 6; i++) {
    const randomName = avatarNames[Math.floor(Math.random() * avatarNames.length)];
    const res = generateUIAvatar(randomName);
    data.push(res);
  }

  return data;
};
