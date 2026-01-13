const backgrounds = [
  'background1.jpg',
  'background2.jpg'
];

let currentIndex = 0;
document.body.style.backgroundImage = `url(${backgrounds[0]})`;

setInterval(() => {
  currentIndex = (currentIndex + 1) % backgrounds.length;
  document.body.style.backgroundImage = `url(${backgrounds[currentIndex]})`;
}, 30000);
