// Project Deep-Dives
class ProjectDeepDive {
    constructor() {
        this.projects = document.querySelectorAll('.project');
        this.init();
    }

    init() {
        this.projects.forEach(project => {
            project.addEventListener('click', (e) => {
                if (!e.target.closest('a')) {
                    this.expandProject(project);
                }
            });
        });
    }

    expandProject(project) {
        const title = project.querySelector('h3').textContent;
        const meta = project.querySelector('.project-meta').textContent;
        const description = project.querySelector('p:last-child').textContent;
        
        const expanded = document.createElement('div');
        expanded.className = 'project-expanded';
        
        const projectData = this.getProjectData(title);
        
        expanded.innerHTML = `
            <span class="close-btn">&times;</span>
            <h1>${title}</h1>
            <p class="subtitle">${meta}</p>
            <p>${description}</p>
            
            <h2>Impact Over Time</h2>
            <figure>
                <canvas id="impact-chart" width="800" height="300"></canvas>
                <figcaption>Project impact trajectory showing growth patterns and achievement milestones</figcaption>
            </figure>
            
            <h2>Key Metrics</h2>
            <figure>
                <div class="metrics-grid">
                    ${projectData.metrics.map(m => `
                        <div class="metric-card">
                            <h3>${m.value}</h3>
                            <p>${m.label}</p>
                        </div>
                    `).join('')}
                </div>
                <figcaption>Quantitative outcomes demonstrating measurable project impact and success criteria</figcaption>
            </figure>
            
            <h2>Technical Stack</h2>
            <div class="tech-stack">
                ${projectData.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
            
            <div class="project-footer">
                <a href="#" class="back-to-top">Back to top</a>
            </div>
        `;
        
        document.body.appendChild(expanded);
        
        // Animate entrance
        requestAnimationFrame(() => {
            expanded.style.opacity = '0';
            expanded.style.transform = 'scale(0.9)';
            expanded.style.transition = 'all 0.3s ease';
            
            requestAnimationFrame(() => {
                expanded.style.opacity = '1';
                expanded.style.transform = 'scale(1)';
            });
        });
        
        // Draw impact chart
        this.drawImpactChart(projectData.timeline);
        
        // Close handler
        expanded.querySelector('.close-btn').addEventListener('click', () => {
            expanded.style.opacity = '0';
            expanded.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                expanded.remove();
            }, 300);
        });
        
        // Back to top handler
        expanded.querySelector('.back-to-top').addEventListener('click', (e) => {
            e.preventDefault();
            expanded.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    getProjectData(title) {
        const data = {
            'Do Little Lab': {
                metrics: [
                    { value: '8 weeks', label: 'Time to MVP' },
                    { value: '$5k', label: 'Bootstrap Budget' },
                    { value: '1000s', label: 'Dollars Recovered' },
                    { value: '100%', label: 'Success Rate' }
                ],
                technologies: ['Next.js', 'Python', 'LLMs', 'Vercel', 'PostgreSQL'],
                timeline: [
                    { month: 'Jan', value: 10 },
                    { month: 'Feb', value: 35 },
                    { month: 'Mar', value: 60 },
                    { month: 'Apr', value: 85 },
                    { month: 'May', value: 100 }
                ]
            },
            'Engineering Leadership at RSI': {
                metrics: [
                    { value: '15', label: 'Team Size' },
                    { value: '40%', label: 'Release Time Reduction' },
                    { value: '99.95%', label: 'Uptime' },
                    { value: '5', label: 'States Served' }
                ],
                technologies: ['C#', 'SQL Server', 'Azure', 'Kubernetes', 'Jenkins'],
                timeline: [
                    { month: '2020', value: 60 },
                    { month: '2021', value: 70 },
                    { month: '2022', value: 85 },
                    { month: '2023', value: 95 },
                    { month: '2024', value: 99.95 }
                ]
            },
            'Namaazi': {
                metrics: [
                    { value: '100s', label: 'Active Users' },
                    { value: '4.8', label: 'App Store Rating' },
                    { value: '5', label: 'Prayer Times Daily' },
                    { value: '99.9%', label: 'Accuracy' }
                ],
                technologies: ['Swift', 'SwiftUI', 'CoreLocation', 'CloudKit'],
                timeline: [
                    { month: 'Mar', value: 0 },
                    { month: 'Jun', value: 50 },
                    { month: 'Sep', value: 150 },
                    { month: 'Dec', value: 300 },
                    { month: 'Mar', value: 500 }
                ]
            },
            'New Horizon Flood Relief': {
                metrics: [
                    { value: '30', label: 'Volunteers' },
                    { value: '50', label: 'Families Helped' },
                    { value: '$10.5k', label: 'Funds Raised' },
                    { value: '30 days', label: 'Campaign Duration' }
                ],
                technologies: ['Community Organizing', 'Fundraising', 'Logistics', 'Distribution'],
                timeline: [
                    { month: 'Week 1', value: 20 },
                    { month: 'Week 2', value: 45 },
                    { month: 'Week 3', value: 75 },
                    { month: 'Week 4', value: 100 }
                ]
            }
        };
        
        return data[title] || data['Do Little Lab'];
    }

    drawImpactChart(timeline) {
        const canvas = document.getElementById('impact-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(padding, padding);
        ctx.stroke();
        
        // Calculate points
        const xStep = (width - 2 * padding) / (timeline.length - 1);
        const yScale = (height - 2 * padding) / 100;
        
        const points = timeline.map((item, index) => ({
            x: padding + index * xStep,
            y: height - padding - item.value * yScale
        }));
        
        // Draw line
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        
        // Draw points
        points.forEach(point => {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px et-book, Georgia, serif';
        ctx.textAlign = 'center';
        
        timeline.forEach((item, index) => {
            const x = padding + index * xStep;
            ctx.fillText(item.month, x, height - padding + 20);
        });
    }
}

// Skill Constellation
class SkillConstellation {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'skill-constellation';
        this.skills = [
            { name: 'Swift', x: 20, y: 30, connections: ['iOS', 'SwiftUI'] },
            { name: 'Python', x: 70, y: 20, connections: ['ML', 'Data Analysis'] },
            { name: 'Next.js', x: 40, y: 60, connections: ['React', 'TypeScript'] },
            { name: 'SQL', x: 60, y: 50, connections: ['PostgreSQL', 'Data'] },
            { name: 'iOS', x: 10, y: 70, connections: ['Swift', 'Mobile'] },
            { name: 'ML', x: 80, y: 40, connections: ['Python', 'AI'] },
            { name: 'React', x: 30, y: 40, connections: ['Next.js', 'Frontend'] },
            { name: 'Data', x: 50, y: 80, connections: ['SQL', 'Analysis'] }
        ];
        this.init();
    }

    init() {
        const skillSection = Array.from(document.querySelectorAll('section')).find(section => {
            const h2 = section.querySelector('h2');
            return h2 && h2.textContent.includes('Skills');
        });
        if (!skillSection) return;
        
        // Create figure wrapper
        const figure = document.createElement('figure');
        const caption = document.createElement('figcaption');
        caption.textContent = 'Interactive skill constellation mapping technical expertise and interconnected competencies';
        
        figure.appendChild(this.container);
        figure.appendChild(caption);
        skillSection.appendChild(figure);
        this.createConstellation();
    }

    createConstellation() {
        // Create connections first (so they appear behind nodes)
        this.skills.forEach((skill, i) => {
            skill.connections.forEach(targetName => {
                const target = this.skills.find(s => s.name === targetName);
                if (target) {
                    const connection = document.createElement('div');
                    connection.className = 'skill-connection';
                    
                    const dx = target.x - skill.x;
                    const dy = target.y - skill.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    connection.style.left = skill.x + '%';
                    connection.style.top = skill.y + '%';
                    connection.style.width = distance + '%';
                    connection.style.transform = `rotate(${angle}deg)`;
                    
                    this.container.appendChild(connection);
                }
            });
        });
        
        // Create nodes
        this.skills.forEach((skill, i) => {
            const node = document.createElement('div');
            node.className = 'skill-node';
            node.textContent = skill.name;
            node.style.left = skill.x + '%';
            node.style.top = skill.y + '%';
            
            // Add hover effect
            node.addEventListener('mouseenter', () => {
                this.highlightConnections(skill);
            });
            
            node.addEventListener('mouseleave', () => {
                this.clearHighlights();
            });
            
            // Animate entrance
            node.style.opacity = '0';
            node.style.transform = 'scale(0)';
            
            setTimeout(() => {
                node.style.transition = 'all 0.5s ease';
                node.style.opacity = '1';
                node.style.transform = 'scale(1)';
            }, i * 100);
            
            this.container.appendChild(node);
        });
    }

    highlightConnections(skill) {
        const connections = this.container.querySelectorAll('.skill-connection');
        connections.forEach(conn => {
            conn.classList.remove('active');
        });
        
        // This is simplified - in a real implementation, you'd track which connections belong to which skills
        const nodes = this.container.querySelectorAll('.skill-node');
        nodes.forEach(node => {
            if (skill.connections.includes(node.textContent)) {
                node.style.background = '#e74c3c';
                node.style.color = '#fffff8';
            }
        });
    }

    clearHighlights() {
        const nodes = this.container.querySelectorAll('.skill-node');
        nodes.forEach(node => {
            node.style.background = '';
            node.style.color = '';
        });
    }
}

// Tufte-Style Career Map
class CareerMap {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'career-map';
        this.tooltip = null;
        this.init();
    }

    async init() {
        try {
            // Get locations from resume data
            const resumeData = window.resume || {};
            this.locations = resumeData.meta?.locations || [
                { name: 'Pakistan', lon: 73.0479, lat: 33.6844, projects: ['New Horizon Flood Relief', 'Early Education'] },
                { name: 'Provo, Utah', lon: -111.6587, lat: 40.2338, projects: ['BYU Systems Admin', 'BSc Actuarial Science'] },
                { name: 'Pembroke, MA', lon: -70.7717, lat: 42.0667, projects: ['RSI'] },
                { name: 'San Francisco', lon: -122.4194, lat: 37.7749, projects: ['Do Little Lab', 'Namaazi'] }
            ];

            this.createMap();
            this.createTooltip();
            this.addToPage();
        } catch (error) {
            console.warn('Career map failed to load:', error);
            this.createFallbackMap();
        }
    }

    createMap() {
        const w = 600, h = 400;
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.style.width = '100%';
        svg.style.height = 'auto';

        // Simple Mercator-like projection
        const projection = (lon, lat) => {
            const x = (lon + 180) * (w / 360);
            const latRad = lat * Math.PI / 180;
            const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
            const y = (h / 2) - (w * mercN / (2 * Math.PI));
            return [Math.max(20, Math.min(w-20, x)), Math.max(20, Math.min(h-20, y))];
        };

        // Add minimal coastlines (very faint)
        const coastlines = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        coastlines.setAttribute('d', `M 50 ${h*0.3} Q 150 ${h*0.25} 250 ${h*0.3} Q 350 ${h*0.35} 450 ${h*0.3} Q 550 ${h*0.25} ${w-50} ${h*0.3}
                                      M 100 ${h*0.6} Q 200 ${h*0.55} 300 ${h*0.6} Q 400 ${h*0.65} 500 ${h*0.6}`);
        coastlines.setAttribute('stroke', '#777');
        coastlines.setAttribute('stroke-width', '0.4');
        coastlines.setAttribute('fill', 'none');
        coastlines.setAttribute('opacity', '0.2');
        svg.appendChild(coastlines);

        // Add arrowhead marker
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrow');
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '8');
        marker.setAttribute('refY', '3');
        marker.setAttribute('markerWidth', '4');
        marker.setAttribute('markerHeight', '4');
        marker.setAttribute('orient', 'auto');
        
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        arrowPath.setAttribute('fill', '#b20808');
        marker.appendChild(arrowPath);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Project locations
        const projectedLocations = this.locations.map(loc => {
            const [x, y] = projection(loc.lon, loc.lat);
            return { ...loc, x, y };
        });

        // Create journey path
        let pathData = `M ${projectedLocations[0].x} ${projectedLocations[0].y}`;
        for (let i = 1; i < projectedLocations.length; i++) {
            const curr = projectedLocations[i];
            const prev = projectedLocations[i-1];
            const midX = (prev.x + curr.x) / 2;
            const midY = Math.min(prev.y, curr.y) - 30;
            pathData += ` Q ${midX} ${midY} ${curr.x} ${curr.y}`;
        }
        
        const journeyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        journeyPath.setAttribute('d', pathData);
        journeyPath.setAttribute('stroke', '#b20808');
        journeyPath.setAttribute('stroke-width', '1');
        journeyPath.setAttribute('stroke-linecap', 'round');
        journeyPath.setAttribute('fill', 'none');
        journeyPath.setAttribute('marker-end', 'url(#arrow)');
        svg.appendChild(journeyPath);

        // Add location markers with interactions
        projectedLocations.forEach((location, index) => {
            // Halo (appears on hover)
            const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            halo.setAttribute('class', 'map-marker-halo');
            halo.setAttribute('cx', location.x);
            halo.setAttribute('cy', location.y);
            halo.setAttribute('r', '16');
            svg.appendChild(halo);

            // Main marker
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('class', 'map-marker');
            marker.setAttribute('cx', location.x);
            marker.setAttribute('cy', location.y);
            marker.setAttribute('r', '3');
            marker.setAttribute('tabindex', '0');
            
            // Add interaction events
            marker.addEventListener('mouseenter', (e) => this.showTooltip(e, location));
            marker.addEventListener('mouseleave', () => this.hideTooltip());
            marker.addEventListener('focus', (e) => this.showTooltip(e, location));
            marker.addEventListener('blur', () => this.hideTooltip());
            
            svg.appendChild(marker);

            // Add location label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', location.x);
            label.setAttribute('y', location.y + 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-family', 'et-book');
            label.setAttribute('font-size', '11');
            label.setAttribute('font-variant', 'small-caps');
            label.setAttribute('fill', '#555');
            label.textContent = location.name;
            svg.appendChild(label);
        });

        this.container.appendChild(svg);
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'location-tooltip';
        document.body.appendChild(this.tooltip);
    }

    showTooltip(event, location) {
        if (!this.tooltip) return;
        
        this.tooltip.innerHTML = `
            <h4>${location.name}</h4>
            <ul>
                ${location.projects.map(project => `<li>${project}</li>`).join('')}
            </ul>
        `;
        
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (event.pageX + 10) + 'px';
        this.tooltip.style.top = (event.pageY - 10) + 'px';
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }

    addToPage() {
        const aboutSection = Array.from(document.querySelectorAll('section')).find(section => {
            const h2 = section.querySelector('h2');
            return h2 && h2.textContent.includes('About');
        });
        if (!aboutSection) return;
        
        const figure = document.createElement('figure');
        figure.appendChild(this.container);
        
        const figcaption = document.createElement('figcaption');
        figcaption.className = 'tufte-figure';
        figcaption.innerHTML = '<span class="figure-number">Figure 3.</span> Geographic path of my career across continents and cultures';
        figure.appendChild(figcaption);
        
        aboutSection.appendChild(figure);
    }
}

// Tufte-Style Annotations
class TufteAnnotations {
    constructor() {
        this.annotations = [
            { selector: '[data-metric="40"]', text: 'Agile transformation!', delay: 2000 },
            { selector: '[data-metric="99.95"]', text: 'Five 9s reliability', delay: 2500 },
            { selector: '[data-metric="8"]', text: 'Speed matters', delay: 1500 },
            { selector: '[data-metric="10.5"]', text: 'Community impact', delay: 3000 }
        ];
        this.init();
    }

    init() {
        // Add handwriting font
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Caveat&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        this.annotations.forEach(ann => {
            const element = document.querySelector(ann.selector);
            if (element) {
                this.addAnnotation(element, ann.text, ann.delay);
            }
        });
    }

    addAnnotation(element, text, delay) {
        const annotation = document.createElement('div');
        annotation.className = 'annotation';
        annotation.textContent = text;
        
        // Position relative to element
        const rect = element.getBoundingClientRect();
        annotation.style.left = rect.left + 'px';
        annotation.style.top = (rect.top - 30) + 'px';
        
        document.body.appendChild(annotation);
        
        // Create SVG arrow
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.left = rect.left + 'px';
        svg.style.top = (rect.top - 25) + 'px';
        svg.style.width = '50px';
        svg.style.height = '25px';
        svg.style.pointerEvents = 'none';
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 10 5 Q 25 15 40 20');
        path.setAttribute('stroke', '#e74c3c');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.classList.add('annotation-path');
        
        svg.appendChild(path);
        document.body.appendChild(svg);
        
        // Trigger animation on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        annotation.classList.add('visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(element);
    }
}

// Add to initialization
document.addEventListener('DOMContentLoaded', () => {
    // Previous initializations...
    new ProjectDeepDive();
    new SkillConstellation();
    new CareerMap();
    new TufteAnnotations();
});