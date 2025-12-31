const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
const newYearMessageEl = document.getElementById('newYearMessage');
const subtitleEl = document.getElementById('subtitle');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

const gravity = 0.05;
let fireworks = [];
let particles = [];
const scandinavianColors = ['#FFD700', '#C0C0C0', '#FFFFFF'];

// --- Helper Functions ---
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// --- Particle Class ---
class Particle {
    constructor(x, y, color, velocity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.lifespan = 80; // Shorter lifespan for explosion particles
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    update() {
        this.velocity.y += gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 1 / this.lifespan;
        this.lifespan--;
        this.draw();
    }
}

// --- Firework Class ---
class Firework {
    constructor() {
        this.x = random(width * 0.2, width * 0.8);
        this.y = height;
        this.targetY = random(height * 0.1, height * 0.4);
        this.color = scandinavianColors[Math.floor(Math.random() * scandinavianColors.length)];
        this.velocity = { x: 0, y: -random(4, 7) };
        this.trail = [];
    }

    draw() {
        // Draw the main firework rocket
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw the trail
        this.trail.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = i / this.trail.length;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    explode() {
        const particleCount = 100;
        const angleIncrement = (Math.PI * 2) / particleCount;
        for (let i = 0; i < particleCount; i++) {
            const angle = angleIncrement * i;
            const power = random(2, 5);
            const velocity = {
                x: Math.cos(angle) * power,
                y: Math.sin(angle) * power
            };
            particles.push(new Particle(this.x, this.y, this.color, velocity));
        }
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) {
            this.trail.shift();
        }

        if (this.y > this.targetY) {
            this.y += this.velocity.y;
            this.draw();
        } else {
            this.explode();
            return true; // Mark for removal
        }
        return false;
    }
}

subtitleEl.textContent = 'Wishing you a wonderful';
newYearMessageEl.textContent = '2026';
newYearMessageEl.style.display = 'block';


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(245, 245, 245, 0.1)'; // Creates a fading trail effect
    ctx.fillRect(0, 0, width, height);

    // Launch fireworks periodically
    if (Math.random() < 0.05) {
        fireworks.push(new Firework());
    }

    // Update fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        if (fireworks[i].update()) {
            fireworks.splice(i, 1);
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].lifespan <= 0) {
            particles.splice(i, 1);
        } else {
            particles[i].update();
        }
    }
}

// Initial firework
fireworks.push(new Firework());
animate();
