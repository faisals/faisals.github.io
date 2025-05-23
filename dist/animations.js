// Sparkline Career Timeline
class CareerTimeline {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = []; // Will be populated from resume.json
        this.drawn = false;
        this.init();
    }

    init() {
        const container = document.querySelector('.timeline-container');
        if (!container) return;
        
        this.canvas.width = container.offsetWidth;
        this.canvas.height = 80;
        container.appendChild(this.canvas);
        
        this.setupIntersectionObserver();
        this.setupHoverInteractions();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.drawn) {
                    this.animateTimeline();
                    this.drawn = true;
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(this.canvas);
    }

    animateTimeline() {
        // Guard clause: don't animate if no points available
        if (!this.points || this.points.length === 0) {
            console.warn('CareerTimeline: No data points available for animation');
            return;
        }
        
        // Calculate dynamic year range from actual data points
        const years = this.points.map(p => p.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        
        // Add some padding to the year range for visual breathing room
        const yearPadding = Math.max(1, Math.round((maxYear - minYear) * 0.1));
        const startYear = minYear - yearPadding;
        const endYear = maxYear + yearPadding;
        
        // Normalize values for consistent visual scaling
        const values = this.points.map(p => p.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue;
        
        // Normalize all values to 0-100 scale for consistent visualization
        const normalizedPoints = this.points.map(point => ({
            ...point,
            normalizedValue: valueRange > 0 ? ((point.value - minValue) / valueRange) * 100 : 50
        }));
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;
        
        let progress = 0;
        const animate = () => {
            progress += 0.02;
            if (progress > 1) progress = 1;
            
            this.ctx.clearRect(0, 0, width, height);
            this.ctx.strokeStyle = '#999';
            this.ctx.lineWidth = 1;
            
            // Draw baseline
            this.ctx.beginPath();
            this.ctx.moveTo(padding, height / 2);
            this.ctx.lineTo(padding + (width - 2 * padding) * progress, height / 2);
            this.ctx.stroke();
            
            // Draw points using normalized data
            normalizedPoints.forEach((point, i) => {
                const x = padding + ((point.year - startYear) / (endYear - startYear)) * (width - 2 * padding);
                // Vary Y position slightly based on normalized value for visual interest
                const baseY = height / 2;
                const valueOffset = (point.normalizedValue - 50) * 0.3; // Subtle vertical variation
                const y = baseY - valueOffset;
                
                if (x <= padding + (width - 2 * padding) * progress) {
                    const pointProgress = Math.min(1, Math.max(0, (progress - i * 0.1) * 3));
                    // Vary radius based on normalized value (3-7px range)
                    const baseRadius = 3 + (point.normalizedValue / 100) * 4;
                    const radius = Math.max(0, baseRadius * pointProgress);
                    
                    if (radius > 0) {
                        this.ctx.fillStyle = this.getColorForType(point.type);
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // Add subtle glow for high-value points
                        if (point.normalizedValue > 75) {
                            this.ctx.shadowColor = this.getColorForType(point.type);
                            this.ctx.shadowBlur = 4;
                            this.ctx.beginPath();
                            this.ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
                            this.ctx.fill();
                            this.ctx.shadowBlur = 0;
                        }
                    }
                    
                    // Store position for hover (use original point object for data access)
                    this.points[i].x = x;
                    this.points[i].y = y;
                    this.points[i].normalizedValue = point.normalizedValue;
                }
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    getColorForType(type) {
        const colors = {
            humanitarian: '#e74c3c',
            career: '#3498db',
            achievement: '#2ecc71',
            leadership: '#9b59b6',
            founder: '#f39c12'
        };
        return colors[type] || '#333';
    }

    setupHoverInteractions() {
        const tooltip = document.createElement('div');
        tooltip.className = 'timeline-tooltip';
        document.body.appendChild(tooltip);
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            let hoveredPoint = null;
            this.points.forEach(point => {
                if (point.x && Math.abs(x - point.x) < 10 && Math.abs(y - point.y) < 10) {
                    hoveredPoint = point;
                }
            });
            
            if (hoveredPoint) {
                tooltip.innerHTML = `<strong>${hoveredPoint.year}</strong><br>${hoveredPoint.label}`;
                tooltip.style.display = 'block';
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY - 30 + 'px';
            } else {
                tooltip.style.display = 'none';
            }
        });
    }
}

// Impact Metrics Cascade
class ImpactMetrics {
    constructor() {
        this.metrics = document.querySelectorAll('[data-metric]');
        this.init();
    }

    init() {
        this.metrics.forEach(metric => {
            const target = parseFloat(metric.getAttribute('data-metric'));
            const suffix = metric.getAttribute('data-suffix') || '';
            const prefix = metric.getAttribute('data-prefix') || '';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateValue(metric, 0, target, 2000, prefix, suffix);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(metric);
        });
    }

    animateValue(element, start, end, duration, prefix, suffix) {
        const startTime = performance.now();
        const originalText = element.textContent;
        const targetValue = end.toString();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for beautiful curve
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            const currentValue = current.toFixed(end % 1 === 0 ? 0 : 2);
            
            // Replace the numeric part while preserving the rest of the text
            // Store original placeholder and replace it directly
            const placeholder = element.getAttribute('data-placeholder') || originalText.match(/\b0+(?:[%$]|\b)/)?.[0] || '0';
            const newText = originalText.replace(placeholder, prefix + currentValue + suffix);
            element.textContent = newText;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Network Graph Formation
class NetworkGraph {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.init();
    }

    init() {
        const container = document.querySelector('.network-container');
        if (!container) return;
        
        this.canvas.width = container.offsetWidth;
        this.canvas.height = 400;
        container.appendChild(this.canvas);
        
        this.setupNetwork();
        this.setupIntersectionObserver();
    }

    setupNetwork() {
        // Define nodes
        const skills = ['Swift', 'Python', 'Next.js', 'SQL', 'Machine Learning'];
        const projects = ['Do Little Lab', 'Namaazi', 'RSI', 'Flood Relief'];
        const impacts = ['Healthcare', 'Civil Rights', 'Education', 'Technology'];
        
        // Create nodes with initial random positions
        let id = 0;
        skills.forEach(skill => {
            this.nodes.push({
                id: id++,
                label: skill,
                type: 'skill',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0,
                vy: 0
            });
        });
        
        projects.forEach(project => {
            this.nodes.push({
                id: id++,
                label: project,
                type: 'project',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0,
                vy: 0
            });
        });
        
        impacts.forEach(impact => {
            this.nodes.push({
                id: id++,
                label: impact,
                type: 'impact',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0,
                vy: 0
            });
        });
        
        // Define connections
        this.edges = [
            { source: 0, target: 6 }, // Swift -> Namaazi
            { source: 1, target: 5 }, // Python -> Do Little Lab
            { source: 2, target: 5 }, // Next.js -> Do Little Lab
            { source: 3, target: 7 }, // SQL -> RSI
            { source: 4, target: 5 }, // ML -> Do Little Lab
            { source: 5, target: 9 }, // Do Little Lab -> Healthcare
            { source: 6, target: 12 }, // Namaazi -> Technology
            { source: 7, target: 12 }, // RSI -> Technology
            { source: 8, target: 10 }, // Flood Relief -> Civil Rights
            { source: 8, target: 11 }, // Flood Relief -> Education
        ];
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startAnimation();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(this.canvas);
    }

    startAnimation() {
        const animate = () => {
            this.applyForces();
            this.updatePositions();
            this.draw();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    applyForces() {
        // Apply repulsion between all nodes
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[j].x - this.nodes[i].x;
                const dy = this.nodes[j].y - this.nodes[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const force = 1000 / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    
                    this.nodes[i].vx -= fx;
                    this.nodes[i].vy -= fy;
                    this.nodes[j].vx += fx;
                    this.nodes[j].vy += fy;
                }
            }
        }
        
        // Apply attraction along edges
        this.edges.forEach(edge => {
            const source = this.nodes[edge.source];
            const target = this.nodes[edge.target];
            
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const force = (distance - 150) * 0.01;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;
                
                source.vx += fx;
                source.vy += fy;
                target.vx -= fx;
                target.vy -= fy;
            }
        });
        
        // Apply centering force
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.nodes.forEach(node => {
            node.vx += (centerX - node.x) * 0.01;
            node.vy += (centerY - node.y) * 0.01;
        });
    }

    updatePositions() {
        this.nodes.forEach(node => {
            node.vx *= 0.85; // Damping
            node.vy *= 0.85;
            
            node.x += node.vx;
            node.y += node.vy;
            
            // Keep nodes within bounds
            node.x = Math.max(20, Math.min(this.canvas.width - 20, node.x));
            node.y = Math.max(20, Math.min(this.canvas.height - 20, node.y));
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw edges
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        
        this.edges.forEach(edge => {
            const source = this.nodes[edge.source];
            const target = this.nodes[edge.target];
            
            this.ctx.beginPath();
            this.ctx.moveTo(source.x, source.y);
            this.ctx.lineTo(target.x, target.y);
            this.ctx.stroke();
        });
        
        // Draw nodes
        this.nodes.forEach(node => {
            // Node circle
            this.ctx.fillStyle = this.getNodeColor(node.type);
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Node label
            this.ctx.fillStyle = '#333';
            this.ctx.font = '11px et-book, Georgia, serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(node.label, node.x, node.y - 12);
        });
    }

    getNodeColor(type) {
        const colors = {
            skill: '#3498db',
            project: '#2ecc71',
            impact: '#e74c3c'
        };
        return colors[type] || '#333';
    }
}

// Margin Note Choreography
class MarginNoteChoreographer {
    constructor() {
        this.notes = document.querySelectorAll('.sidenote, .marginnote');
        this.init();
    }

    init() {
        this.notes.forEach((note, index) => {
            note.style.opacity = '0';
            note.style.transform = 'translateY(20px)';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            note.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                            note.style.opacity = '1';
                            note.style.transform = 'translateY(0)';
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(note);
        });
    }
}

// Smart Reading Progress
class ReadingProgress {
    constructor() {
        this.heatmap = [];
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.init();
    }

    init() {
        this.canvas.className = 'reading-progress';
        this.canvas.width = 4;
        this.canvas.height = document.body.scrollHeight;
        document.body.appendChild(this.canvas);
        
        this.setupTracking();
        this.draw();
    }

    setupTracking() {
        let lastY = 0;
        let readingTimer;
        
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            const viewportHeight = window.innerHeight;
            
            // Add heat to current viewport area
            for (let i = y; i < y + viewportHeight; i += 10) {
                if (!this.heatmap[Math.floor(i / 10)]) {
                    this.heatmap[Math.floor(i / 10)] = 0;
                }
                this.heatmap[Math.floor(i / 10)] = Math.min(1, this.heatmap[Math.floor(i / 10)] + 0.01);
            }
            
            // Draw progress line
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(2, lastY);
            this.ctx.lineTo(2, y + viewportHeight / 2);
            this.ctx.stroke();
            
            lastY = y + viewportHeight / 2;
            
            clearTimeout(readingTimer);
            readingTimer = setTimeout(() => {
                this.draw();
            }, 100);
        });
    }

    draw() {
        // Draw heatmap
        this.heatmap.forEach((heat, index) => {
            if (heat > 0) {
                this.ctx.fillStyle = `rgba(231, 76, 60, ${heat * 0.3})`;
                this.ctx.fillRect(0, index * 10, 4, 10);
            }
        });
    }
}

// Dynamic Line Length
class DynamicLineLength {
    constructor() {
        this.paragraphs = document.querySelectorAll('article p');
        this.characterWidth = this.measureCharacterWidth();
        this.init();
    }

    measureCharacterWidth() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = '1.4rem et-book, serif';
        
        // Measure a representative character set
        const measurement = ctx.measureText('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;');
        return measurement.width / 66; // 26*2 letters + 10 digits + 4 punctuation = 66 chars
    }

    init() {
        window.addEventListener('resize', () => {
            this.adjustLineLength();
        });
        
        this.adjustLineLength();
    }

    adjustLineLength() {
        const idealCharactersPerLine = 65;
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        
        this.paragraphs.forEach(p => {
            const currentWidth = p.offsetWidth;
            const charactersPerLine = currentWidth / this.characterWidth;
            
            if (charactersPerLine > 75) {
                const maxWidth = idealCharactersPerLine * this.characterWidth;
                p.style.maxWidth = `${maxWidth / rootFontSize}rem`;
                p.style.transition = 'max-width 0.3s ease-out';
            } else {
                p.style.maxWidth = '';
            }
        });
    }
}

// Data Ink Reveals
class DataInkReveals {
    constructor() {
        this.links = document.querySelectorAll('a');
        this.metrics = document.querySelectorAll('[data-metric]');
        this.init();
    }

    init() {
        this.links.forEach(link => {
            link.classList.add('data-ink-link');
        });
        
        this.metrics.forEach(metric => {
            metric.classList.add('data-ink-metric');
        });
    }
}

// Breathing Whitespace
class BreathingWhitespace {
    constructor() {
        this.article = document.querySelector('article');
        this.lastScrollTime = Date.now();
        this.isReading = false;
        this.init();
    }

    init() {
        let scrollTimer;
        
        window.addEventListener('scroll', () => {
            this.lastScrollTime = Date.now();
            this.isReading = true;
            
            if (!this.article.classList.contains('reading')) {
                this.article.classList.add('reading');
            }
            
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                if (Date.now() - this.lastScrollTime > 3000) {
                    this.article.classList.remove('reading');
                    this.article.classList.add('resting');
                    
                    setTimeout(() => {
                        this.article.classList.remove('resting');
                    }, 500);
                }
            }, 3000);
        });
    }
}

// Animations are initialized by SiteGenerator.initializeAnimations()
// after content is loaded to avoid duplicate instances