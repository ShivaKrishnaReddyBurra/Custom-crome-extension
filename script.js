const backgrounds = ['background1.jpg', 'background2.jpg'];
let currentIndex = 0;
document.body.style.backgroundImage = `url(${backgrounds[0]})`;

setInterval(() => {
  currentIndex = (currentIndex + 1) % backgrounds.length;
  document.body.style.backgroundImage = `url(${backgrounds[currentIndex]})`;
}, 30000);

// State management
let mouseActive = false;
let inactivityTimer = null;
let shortcuts = JSON.parse(localStorage.getItem('shortcuts') || '[]');
let animationInterval = null;

const plusIcon = document.getElementById('plusIcon');
const modal = document.getElementById('modal');
const form = document.getElementById('shortcutForm');
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Famous website icons mapping
const famousIcons = {
  'youtube': 'https://www.youtube.com/favicon.ico',
  'google': 'https://www.google.com/favicon.ico',
  'facebook': 'https://www.facebook.com/favicon.ico',
  'twitter': 'https://abs.twimg.com/favicons/twitter.ico',
  'instagram': 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
  'linkedin': 'https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
  'github': 'https://github.githubassets.com/favicons/favicon.svg',
  'reddit': 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png',
  'amazon': 'https://www.amazon.com/favicon.ico',
  'netflix': 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico',
  'gmail': 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
  'drive': 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png',
  'spotify': 'https://www.spotify.com/favicon.ico',
  'discord': 'https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png',
  'twitch': 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png'
};

// Get icon for URL
function getIconForUrl(url, name) {
  const hostname = new URL(url).hostname.toLowerCase();
  const domain = hostname.replace('www.', '').split('.')[0];
  
  if (famousIcons[domain]) {
    return famousIcons[domain];
  }
  
  for (let key in famousIcons) {
    if (name.toLowerCase().includes(key)) {
      return famousIcons[key];
    }
  }
  
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
}

// Mouse activity detection
function resetInactivityTimer() {
  mouseActive = true;
  clearTimeout(inactivityTimer);
  stopAnimations();
  showShortcuts();
  plusIcon.classList.remove('hidden');
  
  inactivityTimer = setTimeout(() => {
    mouseActive = false;
    hideShortcuts();
    plusIcon.classList.add('hidden');
    startAnimations();
  }, 5000);
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);

// Shortcut positioning
function positionShortcuts() {
  const shortcuts = document.querySelectorAll('.shortcut');
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const radius = 150;
  
  shortcuts.forEach((shortcut, index) => {
    const angle = (index / shortcuts.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle) - 35;
    const y = centerY + radius * Math.sin(angle) - 35;
    
    shortcut.style.left = `${x}px`;
    shortcut.style.top = `${y}px`;
  });
}

function showShortcuts() {
  const shortcuts = document.querySelectorAll('.shortcut');
  shortcuts.forEach((shortcut, index) => {
    setTimeout(() => {
      shortcut.style.opacity = '1';
      shortcut.style.transform = 'scale(1)';
    }, index * 50);
  });
}

function hideShortcuts() {
  const shortcuts = document.querySelectorAll('.shortcut');
  shortcuts.forEach(shortcut => {
    shortcut.style.opacity = '0';
    shortcut.style.transform = 'scale(0)';
  });
}

// Create shortcut element
function createShortcutElement(shortcut) {
  const div = document.createElement('div');
  div.className = 'shortcut';
  div.style.opacity = '0';
  div.style.transform = 'scale(0)';
  div.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  
  const img = document.createElement('img');
  img.src = shortcut.icon;
  img.onerror = () => {
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35"><rect fill="%23667eea" width="35" height="35" rx="5"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="18" font-weight="bold">' + shortcut.name.charAt(0).toUpperCase() + '</text></svg>';
  };
  
  const name = document.createElement('div');
  name.className = 'shortcut-name';
  name.textContent = shortcut.name;
  
  div.appendChild(img);
  div.appendChild(name);
  
  div.addEventListener('click', () => {
    window.location.href = shortcut.url;
  });
  
  div.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (confirm(`Delete "${shortcut.name}" shortcut?`)) {
      shortcuts = shortcuts.filter(s => s.id !== shortcut.id);
      localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
      div.remove();
      positionShortcuts();
    }
  });
  
  document.body.appendChild(div);
  return div;
}

// Load shortcuts
function loadShortcuts() {
  shortcuts.forEach(shortcut => {
    createShortcutElement(shortcut);
  });
  positionShortcuts();
}

// Plus icon click
plusIcon.addEventListener('click', () => {
  modal.classList.add('show');
  document.getElementById('shortcutName').focus();
});

document.getElementById('cancelBtn').addEventListener('click', () => {
  modal.classList.remove('show');
  form.reset();
  document.getElementById('iconPreview').innerHTML = '<span style="color: rgba(255,255,255,0.3); font-size: 12px;">Icon Preview</span>';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show');
    form.reset();
    document.getElementById('iconPreview').innerHTML = '<span style="color: rgba(255,255,255,0.3); font-size: 12px;">Icon Preview</span>';
  }
});

// URL input change - preview icon
document.getElementById('shortcutUrl').addEventListener('input', (e) => {
  const url = e.target.value;
  const name = document.getElementById('shortcutName').value;
  
  if (url.startsWith('http')) {
    try {
      const icon = getIconForUrl(url, name);
      const preview = document.getElementById('iconPreview');
      preview.innerHTML = `<img src="${icon}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23667eea%22 width=%2260%22 height=%2260%22 rx=%225%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2224%22 font-weight=%22bold%22>${name.charAt(0).toUpperCase()}</text></svg>'">`;
    } catch (e) {}
  }
});

// Custom icon upload
document.getElementById('iconFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = document.getElementById('iconPreview');
      preview.innerHTML = `<img src="${event.target.result}">`;
    };
    reader.readAsDataURL(file);
  }
});

// Form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('shortcutName').value;
  const url = document.getElementById('shortcutUrl').value;
  const fileInput = document.getElementById('iconFile');
  const preview = document.getElementById('iconPreview').querySelector('img');
  
  let icon;
  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = (event) => {
      icon = event.target.result;
      saveShortcut(name, url, icon);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else if (preview && preview.src) {
    icon = preview.src;
    saveShortcut(name, url, icon);
  } else {
    icon = getIconForUrl(url, name);
    saveShortcut(name, url, icon);
  }
});

function saveShortcut(name, url, icon) {
  const shortcut = {
    id: Date.now(),
    name,
    url,
    icon
  };
  
  shortcuts.push(shortcut);
  localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
  
  createShortcutElement(shortcut);
  positionShortcuts();
  
  modal.classList.remove('show');
  form.reset();
  document.getElementById('iconPreview').innerHTML = '<span style="color: rgba(255,255,255,0.3); font-size: 12px;">Icon Preview</span>';
}

// Diwali-style Fireworks Animations
class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.exploded = false;
    this.vy = -(8 + Math.random() * 4);
    this.vx = (Math.random() - 0.5) * 2;
    this.trail = [];
    this.hue = Math.random() * 360;
    this.targetY = window.innerHeight * (0.2 + Math.random() * 0.3);
  }

  createExplosion() {
    const colors = [
      [this.hue, (this.hue + 30) % 360, (this.hue + 60) % 360],
      [this.hue, (this.hue + 120) % 360, (this.hue + 240) % 360],
      [this.hue, this.hue, this.hue]
    ];
    
    const colorSet = colors[Math.floor(Math.random() * colors.length)];
    const particleCount = 80 + Math.random() * 100;
    const style = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < particleCount; i++) {
      let angle, speed, hue;
      
      switch(style) {
        case 0: // Chrysanthemum
          angle = (i / particleCount) * Math.PI * 2;
          speed = 2 + Math.random() * 4;
          hue = colorSet[Math.floor(Math.random() * colorSet.length)];
          break;
        case 1: // Peony
          angle = Math.random() * Math.PI * 2;
          speed = 2 + Math.random() * 5;
          hue = colorSet[Math.floor(Math.random() * colorSet.length)];
          break;
        case 2: // Willow
          angle = Math.random() * Math.PI * 2;
          speed = 1 + Math.random() * 3;
          hue = colorSet[0];
          break;
        case 3: // Ring
          angle = (i / particleCount) * Math.PI * 2;
          speed = 3 + Math.random() * 2;
          hue = colorSet[i % colorSet.length];
          break;
      }
      
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        hue: hue,
        brightness: 70 + Math.random() * 30,
        style: style,
        trail: []
      });
    }
  }

  update() {
    if (!this.exploded) {
      this.vy += 0.15;
      this.x += this.vx;
      this.y += this.vy;
      
      this.trail.push({ x: this.x, y: this.y, life: 1 });
      if (this.trail.length > 10) this.trail.shift();
      
      if (this.y <= this.targetY || this.vy > 0) {
        this.exploded = true;
        this.createExplosion();
      }
    } else {
      this.particles = this.particles.filter(p => {
        p.vx *= 0.98;
        p.vy += (p.style === 2) ? 0.15 : 0.08; // Willow falls faster
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;
        
        if (p.style === 0 || p.style === 3) {
          p.trail.push({ x: p.x, y: p.y, life: p.life });
          if (p.trail.length > 5) p.trail.shift();
        }
        
        return p.life > 0;
      });
    }
    
    this.trail = this.trail.filter(t => {
      t.life -= 0.05;
      return t.life > 0;
    });
  }

  draw(ctx) {
    if (!this.exploded) {
      // Draw rocket trail
      this.trail.forEach((t, i) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2 * t.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${t.life * 0.5})`;
        ctx.fill();
      });
      
      // Draw rocket
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${this.hue}, 100%, 80%)`;
      ctx.fill();
    } else {
      // Draw explosion particles
      this.particles.forEach(p => {
        // Draw particle trail
        if (p.trail.length > 0) {
          p.trail.forEach((t, i) => {
            const size = 2 * (i / p.trail.length) * t.life;
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${t.life * 0.3})`;
            ctx.fill();
          });
        }
        
        // Draw main particle
        const size = 3 * p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, ${p.brightness}%, ${p.life})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 100%, ${p.brightness - 20}%, ${p.life * 0.8})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 100%, ${p.brightness - 40}%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add sparkle effect
        if (Math.random() < 0.1) {
          ctx.fillStyle = `hsla(60, 100%, 100%, ${p.life})`;
          ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        }
      });
    }
  }

  isDead() {
    return this.exploded && this.particles.length === 0 && this.trail.length === 0;
  }
}

let fireworks = [];

function launchFirework() {
  const x = window.innerWidth * (0.2 + Math.random() * 0.6);
  const y = window.innerHeight;
  fireworks.push(new Firework(x, y));
}

function animateFireworks() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  fireworks = fireworks.filter(fw => {
    fw.update();
    fw.draw(ctx);
    return !fw.isDead();
  });
  
  if (!mouseActive) {
    requestAnimationFrame(animateFireworks);
  }
}

function startAnimations() {
  if (animationInterval) return;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Launch initial fireworks
  for (let i = 0; i < 3; i++) {
    setTimeout(() => launchFirework(), i * 300);
  }
  
  // Continue launching fireworks
  animationInterval = setInterval(() => {
    if (Math.random() < 0.7) {
      launchFirework();
    }
    if (Math.random() < 0.3) {
      setTimeout(() => launchFirework(), 200);
    }
  }, 800);
  
  animateFireworks();
}

function stopAnimations() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  
  fireworks = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Initialize
loadShortcuts();
resetInactivityTimer();