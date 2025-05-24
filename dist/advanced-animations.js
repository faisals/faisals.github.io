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
        
        // Use dynamic data from dataset instead of hardcoded data
        const dynamicData = JSON.parse(project.dataset.projectData);
        
        // Generate metrics HTML from dynamic data
        const metricsHTML = Object.entries(dynamicData.metrics || {}).map(([key, metric]) => `
            <div class="metric-card">
                <h3>${metric.prefix || ''}${metric.value}${metric.unit || ''}${metric.suffix || ''}</h3>
                <p>${metric.label}</p>
            </div>
        `).join('');
        
        // Generate technologies HTML from dynamic data
        const technologiesHTML = (dynamicData.technologies || []).map(t => 
            `<span class="tech-tag">${t}</span>`
        ).join('');
        
        expanded.innerHTML = `
            <span class="close-btn">&times;</span>
            <h1>${title}</h1>
            <p class="subtitle">${meta}</p>
            <p>${description}</p>
            
            ${Object.keys(dynamicData.metrics || {}).length > 0 ? `
                <h2>Key Metrics</h2>
                <figure>
                    <div class="metrics-grid">
                        ${metricsHTML}
                    </div>
                    <figcaption>Quantitative outcomes demonstrating measurable project impact and success criteria</figcaption>
                </figure>
            ` : ''}
            
            ${dynamicData.technologies && dynamicData.technologies.length > 0 ? `
                <h2>Technical Stack</h2>
                <div class="tech-stack">
                    ${technologiesHTML}
                </div>
            ` : ''}
            
            ${dynamicData.highlights && dynamicData.highlights.length > 0 ? `
                <h2>Key Highlights</h2>
                <ul>
                    ${dynamicData.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
            ` : ''}
            
            <div class="project-footer">
                <a href="#" class="back-to-top">Back to top</a>
            </div>
        `;
        
        // Add accessibility attributes
        expanded.setAttribute('role', 'dialog');
        expanded.setAttribute('aria-modal', 'true');
        expanded.setAttribute('aria-labelledby', 'modal-title');
        expanded.querySelector('h1').id = 'modal-title';
        
        document.body.appendChild(expanded);
        
        // Store previous focus to restore later
        const previousFocus = document.activeElement;
        
        // Animate entrance
        requestAnimationFrame(() => {
            expanded.style.opacity = '0';
            expanded.style.transform = 'scale(0.9)';
            expanded.style.transition = 'all 0.3s ease';
            
            requestAnimationFrame(() => {
                expanded.style.opacity = '1';
                expanded.style.transform = 'scale(1)';
                
                // Focus the modal for screen readers
                expanded.focus();
            });
        });
        
        
        // Close function
        const closeModal = () => {
            expanded.style.opacity = '0';
            expanded.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                expanded.remove();
                // Restore focus
                if (previousFocus) {
                    previousFocus.focus();
                }
            }, 300);
        };
        
        // Close handler
        expanded.querySelector('.close-btn').addEventListener('click', closeModal);
        
        // Keyboard handler for ESC key
        expanded.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Back to top handler
        expanded.querySelector('.back-to-top').addEventListener('click', (e) => {
            e.preventDefault();
            expanded.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

}

// Skill Constellation
class SkillConstellation {
    constructor(resumeData = null) {
        this.container = document.createElement('div');
        this.container.className = 'skill-constellation';
        this.resumeData = resumeData || window.resume;
        this.skills = this.generateSkillsFromResume();
        this.init();
    }

    generateSkillsFromResume() {
        if (!this.resumeData || !this.resumeData.skills) {
            // Fallback to simplified hardcoded data if no resume data
            return [
                { name: 'Swift', x: 20, y: 30, connections: [] },
                { name: 'Python', x: 70, y: 20, connections: [] },
                { name: 'Next.js', x: 40, y: 60, connections: [] }
            ];
        }

        // Extract all skills from resume.json skill categories
        const allSkills = [];
        this.resumeData.skills.forEach(category => {
            category.keywords.forEach(skill => {
                allSkills.push(skill);
            });
        });

        // Take the first 8-10 skills and generate positions algorithmically
        const selectedSkills = allSkills.slice(0, Math.min(10, allSkills.length));
        
        return selectedSkills.map((skill, index) => {
            // Generate positions in a rough circle/constellation pattern
            const angle = (index / selectedSkills.length) * 2 * Math.PI;
            const radius = 30 + (index % 3) * 15; // Vary radius for visual interest
            const centerX = 50;
            const centerY = 50;
            
            const x = Math.max(10, Math.min(90, centerX + radius * Math.cos(angle)));
            const y = Math.max(10, Math.min(90, centerY + radius * Math.sin(angle)));
            
            // Simple connection logic based on skill relationships
            const connections = this.inferConnections(skill, selectedSkills);
            
            return {
                name: skill,
                x: x,
                y: y,
                connections: connections
            };
        });
    }

    inferConnections(skill, allSkills) {
        // Simple heuristic-based connection inference
        const connections = [];
        const skillLower = skill.toLowerCase();
        
        // Define some common relationships
        const relationships = {
            'swift': ['swiftui', 'ios'],
            'swiftui': ['swift'],
            'python': ['machine learning', 'llms', 'postgresql'],
            'javascript': ['react', 'next.js', 'node.js'],
            'typescript': ['react', 'next.js', 'node.js'],
            'react': ['next.js', 'javascript', 'typescript'],
            'next.js': ['react', 'javascript', 'typescript'],
            'sql': ['postgresql', 'sql server'],
            'postgresql': ['sql', 'python'],
            'machine learning': ['python', 'llms'],
            'llms': ['python', 'machine learning'],
            'c#': ['.net'],
            '.net': ['c#']
        };
        
        const relatedSkills = relationships[skillLower] || [];
        
        allSkills.forEach(otherSkill => {
            if (otherSkill !== skill && 
                relatedSkills.some(related => otherSkill.toLowerCase().includes(related))) {
                connections.push(otherSkill);
            }
        });
        
        return connections.slice(0, 3); // Limit connections to avoid clutter
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

        // Add simplified world outline (Natural Earth 110m inspired, single-stroke)
        const worldOutline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Simplified world landmasses projected to our Mercator-like coordinates
        // Scale factors for our 600x400 viewport
        const scaleX = w / 360;
        const scaleY = h / 180;
        const offsetX = w / 2;
        const offsetY = h / 2;
        
        // Function to convert lat/lon to our coordinate system
        const toCoords = (lon, lat) => {
            const x = (lon + 180) * scaleX;
            const latRad = lat * Math.PI / 180;
            const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
            const y = (h / 2) - (w * mercN / (2 * Math.PI));
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        };
        
        // Simplified world outline focusing on major landmasses
        const worldPath = [
            // North America (rough outline)
            `M ${toCoords(-130, 60)}`,
            `L ${toCoords(-60, 45)}`,
            `L ${toCoords(-80, 25)}`,
            `L ${toCoords(-110, 25)}`,
            `L ${toCoords(-130, 60)}`,
            
            // Europe & Asia (simplified)
            `M ${toCoords(-10, 60)}`,
            `L ${toCoords(180, 60)}`,
            `L ${toCoords(180, 10)}`,
            `L ${toCoords(40, 10)}`,
            `L ${toCoords(10, 35)}`,
            `L ${toCoords(-10, 35)}`,
            `L ${toCoords(-10, 60)}`,
            
            // Africa (simplified)
            `M ${toCoords(-20, 35)}`,
            `L ${toCoords(50, 35)}`,
            `L ${toCoords(40, -35)}`,
            `L ${toCoords(15, -35)}`,
            `L ${toCoords(-20, 35)}`,
            
            // South America (simplified)
            `M ${toCoords(-80, 10)}`,
            `L ${toCoords(-35, 10)}`,
            `L ${toCoords(-40, -55)}`,
            `L ${toCoords(-70, -55)}`,
            `L ${toCoords(-80, 10)}`,
            
            // Australia (simplified)
            `M ${toCoords(110, -10)}`,
            `L ${toCoords(155, -10)}`,
            `L ${toCoords(150, -45)}`,
            `L ${toCoords(115, -35)}`,
            `L ${toCoords(110, -10)}`
        ].join(' ');
        
        worldOutline.setAttribute('d', worldPath);
        worldOutline.setAttribute('stroke', '#d7d7d7');
        worldOutline.setAttribute('stroke-width', '0.4');
        worldOutline.setAttribute('fill', 'none');
        worldOutline.setAttribute('opacity', '1');
        svg.appendChild(worldOutline);

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
            marker.addEventListener('mouseenter', (e) => {
                halo.classList.add('active');
                this.showTooltip(e, location);
            });
            marker.addEventListener('mouseleave', () => {
                halo.classList.remove('active');
                this.hideTooltip();
            });
            marker.addEventListener('focus', (e) => {
                halo.classList.add('active');
                this.showTooltip(e, location);
            });
            marker.addEventListener('blur', () => {
                halo.classList.remove('active');
                this.hideTooltip();
            });
            
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

