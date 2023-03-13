class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = {
      x: -1 + Math.random() * 2,
      y: -1 + Math.random() * 2
    };
    this.radius = 3;
    this.element = document.createElement('div');
    this.element.classList.add('particle', color);
    document.body.appendChild(this.element);
  }

  update() {
    this.x += this.speed.x;
    this.y += this.speed.y;
    if (this.x > window.innerWidth || this.x < 0) {
      this.speed.x = -this.speed.x;
    }
    if (this.y > window.innerHeight || this.y < 0) {
      this.speed.y = -this.speed.y;
    }
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

const particles = [];

function createParticle(x, y) {
  const colors = ['red', 'green', 'blue', 'orange', 'purple'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const particle = new Particle(x, y, color);
  particles.push(particle);
}

function animate() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
  }
  requestAnimationFrame(animate);
}

document.addEventListener('click', (event) => {
  createParticle(event.clientX, event.clientY);
});

animate();
