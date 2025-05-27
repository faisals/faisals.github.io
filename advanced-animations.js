// Enhanced Tufte Timeline System
class EnhancedTimeline {
    constructor() {
        this.container = null;
        this.data = [];
        this.selectedMilestone = null;
        this.visualizationStyle = 'timeline'; // timeline, sparkline, table
        this.config = {
            margin: { left: 20, right: 20, top: 20, bottom: 40 },
            roleHeights: {
                founder: 35,
                leadership: 25, 
                achievement: 20,
                career: 15,
                humanitarian: 10
            },
            colors: {
                baseline: '#111',  // Site's main text color
                text: '#111',      // Site's main text color
                textSecondary: '#666',  // Site's secondary text color
                indicator: '#111',      // Default indicator color
                hover: '#b20808'        // Site's accent red color
            }
        };
        this.init();
    }

    init() {
        // Get timeline data from resume
        const resumeData = window.resume || {};
        const timelineData = resumeData.meta?.careerTimeline || [];
        
        if (timelineData.length === 0) {
            console.warn('No career timeline data found');
            return;
        }

        // Transform data to match our format
        this.data = timelineData.map(item => ({
            year: item.year,
            title: item.label,
            company: this.getCompanyForYear(item.year, resumeData),
            impact: this.getImpactForYear(item.year, resumeData),
            achievements: this.getAchievementsForYear(item.year, resumeData),
            duration: this.getDurationForYear(item.year, resumeData),
            type: item.type,
            value: item.value
        }));

        this.createTimelineInterface();
    }

    getCompanyForYear(year, resumeData) {
        const workEntries = resumeData.work || [];
        for (const work of workEntries) {
            const startYear = parseInt(work.startDate);
            const endYear = work.endDate ? parseInt(work.endDate) : new Date().getFullYear();
            if (year >= startYear && year <= endYear) {
                return work.name;
            }
        }
        return 'Independent';
    }

    getImpactForYear(year, resumeData) {
        const workEntries = resumeData.work || [];
        for (const work of workEntries) {
            const startYear = parseInt(work.startDate);
            const endYear = work.endDate ? parseInt(work.endDate) : new Date().getFullYear();
            if (year >= startYear && year <= endYear) {
                return work.summary || 'Career milestone';
            }
        }
        return 'Significant career achievement';
    }

    getAchievementsForYear(year, resumeData) {
        const workEntries = resumeData.work || [];
        for (const work of workEntries) {
            const startYear = parseInt(work.startDate);
            const endYear = work.endDate ? parseInt(work.endDate) : new Date().getFullYear();
            if (year >= startYear && year <= endYear) {
                return work.highlights?.slice(0, 3) || ['Key career milestone'];
            }
        }
        return ['Significant achievement'];
    }

    getDurationForYear(year, resumeData) {
        const workEntries = resumeData.work || [];
        for (const work of workEntries) {
            const startYear = parseInt(work.startDate);
            const endYear = work.endDate ? parseInt(work.endDate) : new Date().getFullYear();
            if (year >= startYear && year <= endYear) {
                const duration = endYear - startYear;
                return duration > 0 ? `${duration}yr` : '1yr';
            }
        }
        return '1yr';
    }

    createTimelineInterface() {
        // Find the About section
        const aboutSection = Array.from(document.querySelectorAll('section')).find(section => {
            const h2 = section.querySelector('h2');
            return h2 && h2.textContent.includes('About');
        });

        if (!aboutSection) return;

        // Create main container as a figure element
        const timelineWrapper = document.createElement('figure');
        timelineWrapper.className = 'enhanced-timeline-wrapper';
        timelineWrapper.innerHTML = `
            <div class="timeline-header">
                <h3 class="timeline-title">Career Progression, ${this.data[this.data.length-1]?.year}–${this.data[0]?.year}</h3>
                <p class="timeline-subtitle">${this.data.length} major milestones across ${this.getUniqueCompanies()} organizations</p>
            </div>
            <div class="timeline-controls">
                <button class="timeline-btn ${this.visualizationStyle === 'timeline' ? 'active' : ''}" data-style="timeline">timeline</button>
                <button class="timeline-btn ${this.visualizationStyle === 'sparkline' ? 'active' : ''}" data-style="sparkline">sparkline</button>
                <button class="timeline-btn ${this.visualizationStyle === 'table' ? 'active' : ''}" data-style="table">table</button>
            </div>
            <div class="timeline-container" id="timeline-container"></div>
            <div class="timeline-detail" id="timeline-detail" style="display: none;"></div>
            <figcaption>Career trajectory showing key milestones from humanitarian work to technical leadership</figcaption>
        `;

        // Insert BEFORE the About section instead of appending to it
        aboutSection.parentNode.insertBefore(timelineWrapper, aboutSection);
        this.container = document.getElementById('timeline-container');
        this.detailPanel = document.getElementById('timeline-detail');

        // Add event listeners
        timelineWrapper.querySelectorAll('.timeline-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchVisualization(e.target.dataset.style);
            });
        });

        // Initial render
        this.renderVisualization();
    }

    getUniqueCompanies() {
        return new Set(this.data.map(d => d.company)).size;
    }

    switchVisualization(style) {
        this.visualizationStyle = style;
        
        // Update button states
        const buttons = document.querySelectorAll('.timeline-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === style);
        });

        this.renderVisualization();
    }

    renderVisualization() {
        if (!this.container) return;

        this.container.innerHTML = '';
        this.selectedMilestone = null;
        this.hideDetail();

        // Set container height based on visualization type
        switch (this.visualizationStyle) {
            case 'timeline':
                this.container.style.height = '140px';
                this.renderTimeline();
                break;
            case 'sparkline':
                this.container.style.height = '60px';
                this.renderSparkline();
                break;
            case 'table':
                this.container.style.height = 'auto'; // Table determines its own height
                this.container.style.maxHeight = '400px'; // But with a max limit
                this.container.style.overflowY = 'auto';
                this.renderTable();
                break;
        }
    }

    renderTimeline() {
        const containerRect = this.container.getBoundingClientRect();
        const width = Math.max(600, containerRect.width || 600);
        const height = 140;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Career progression timeline');
        svg.style.width = '100%';
        svg.style.height = 'auto';

        const sortedData = [...this.data].sort((a, b) => a.year - b.year);
        const timelineY = height - this.config.margin.bottom;
        const timelineWidth = width - this.config.margin.left - this.config.margin.right;

        // Baseline
        const baseline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        baseline.setAttribute('x1', this.config.margin.left);
        baseline.setAttribute('y1', timelineY);
        baseline.setAttribute('x2', this.config.margin.left + timelineWidth);
        baseline.setAttribute('y2', timelineY);
        baseline.setAttribute('stroke', this.config.colors.baseline);
        baseline.setAttribute('stroke-width', '0.5');
        baseline.classList.add('timeline-baseline');
        svg.appendChild(baseline);

        // Milestones
        sortedData.forEach((milestone, index) => {
            const x = this.config.margin.left + (index / (sortedData.length - 1)) * timelineWidth;
            const roleHeight = this.config.roleHeights[milestone.type] || 15;

            const milestoneGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            milestoneGroup.classList.add('milestone-group');
            milestoneGroup.setAttribute('data-year', milestone.year);

            // Tick mark
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', x);
            tick.setAttribute('y1', timelineY - 1);
            tick.setAttribute('x2', x);
            tick.setAttribute('y2', timelineY + 1);
            tick.setAttribute('stroke', this.config.colors.baseline);
            tick.setAttribute('stroke-width', '0.5');
            tick.classList.add('milestone-tick');
            tick.style.animationDelay = `${index * 100}ms`;
            milestoneGroup.appendChild(tick);

            // Role indicator bar
            const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            indicator.setAttribute('x', x - 0.5);
            indicator.setAttribute('y', timelineY - roleHeight);
            indicator.setAttribute('width', 1);
            indicator.setAttribute('height', roleHeight);
            // Use accent color for founder milestones
            const fillColor = milestone.type === 'founder' ? this.config.colors.hover : this.config.colors.indicator;
            indicator.setAttribute('fill', fillColor);
            indicator.classList.add('milestone-indicator');
            indicator.style.animationDelay = `${index * 100 + 200}ms`;
            indicator.addEventListener('click', () => this.selectMilestone(milestone));
            indicator.addEventListener('mouseenter', () => this.highlightMilestone(indicator));
            indicator.addEventListener('mouseleave', () => this.unhighlightMilestone(indicator, fillColor));
            milestoneGroup.appendChild(indicator);

            // Interactive area
            const interactiveArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            interactiveArea.setAttribute('x', x - 15);
            interactiveArea.setAttribute('y', timelineY - roleHeight - 10);
            interactiveArea.setAttribute('width', 30);
            interactiveArea.setAttribute('height', roleHeight + 20);
            interactiveArea.setAttribute('fill', 'transparent');
            interactiveArea.style.cursor = 'pointer';
            interactiveArea.addEventListener('click', () => this.selectMilestone(milestone));
            milestoneGroup.appendChild(interactiveArea);

            // Year label
            const yearLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            yearLabel.setAttribute('x', x);
            yearLabel.setAttribute('y', timelineY + 16);
            yearLabel.setAttribute('text-anchor', 'middle');
            yearLabel.setAttribute('font-family', 'et-book, serif');
            yearLabel.setAttribute('font-size', '12px');
            yearLabel.setAttribute('fill', this.config.colors.text);
            yearLabel.classList.add('milestone-year');
            yearLabel.style.animationDelay = `${index * 100 + 400}ms`;
            yearLabel.textContent = milestone.year;
            milestoneGroup.appendChild(yearLabel);

            // Company label
            const companyLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            companyLabel.setAttribute('x', x);
            companyLabel.setAttribute('y', timelineY + 28);
            companyLabel.setAttribute('text-anchor', 'middle');
            companyLabel.setAttribute('font-family', 'et-book, serif');
            companyLabel.setAttribute('font-size', '10px');
            companyLabel.setAttribute('fill', this.config.colors.textSecondary);
            companyLabel.classList.add('milestone-company');
            companyLabel.style.animationDelay = `${index * 100 + 500}ms`;
            companyLabel.textContent = milestone.company;
            milestoneGroup.appendChild(companyLabel);

            // Type labels for significant roles
            if (milestone.type === 'founder' || milestone.type === 'leadership') {
                const typeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                typeLabel.setAttribute('x', x);
                typeLabel.setAttribute('y', timelineY - roleHeight - 3);
                typeLabel.setAttribute('text-anchor', 'middle');
                typeLabel.setAttribute('font-family', 'et-book, serif');
                typeLabel.setAttribute('font-size', '9px');
                typeLabel.setAttribute('fill', this.config.colors.text);
                typeLabel.classList.add('milestone-type');
                typeLabel.style.animationDelay = `${index * 100 + 600}ms`;
                typeLabel.textContent = milestone.type === 'founder' ? 'Found' : 'Lead';
                milestoneGroup.appendChild(typeLabel);
            }

            svg.appendChild(milestoneGroup);
        });

        this.container.appendChild(svg);
    }

    renderSparkline() {
        const containerRect = this.container.getBoundingClientRect();
        const width = Math.max(600, containerRect.width || 600);
        const height = 60;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Career progression sparkline');
        svg.style.width = '100%';
        svg.style.height = 'auto';

        const sortedData = [...this.data].sort((a, b) => a.year - b.year);
        const margin = { left: 20, right: 20, top: 10, bottom: 20 };
        const lineWidth = width - margin.left - margin.right;
        const lineHeight = height - margin.top - margin.bottom;

        // Calculate sparkline path based on values
        const points = sortedData.map((milestone, index) => {
            const x = margin.left + (index / (sortedData.length - 1)) * lineWidth;
            const normalizedValue = milestone.value / 100; // Assuming values are 0-100 scale
            const y = margin.top + lineHeight - (normalizedValue * lineHeight);
            return { x, y, milestone };
        });

        // Create path
        const pathData = points.reduce((path, point, index) => {
            const command = index === 0 ? 'M' : 'L';
            return `${path} ${command} ${point.x} ${point.y}`;
        }, '');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#111');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('fill', 'none');
        path.classList.add('sparkline-path');
        svg.appendChild(path);

        // Add data points
        points.forEach((point, index) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', '1.5');
            circle.setAttribute('fill', '#b20808');
            circle.classList.add('sparkline-point');
            circle.style.animationDelay = `${index * 100 + 500}ms`;
            svg.appendChild(circle);
        });

        // Year labels
        const startLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        startLabel.setAttribute('x', margin.left);
        startLabel.setAttribute('y', height - 5);
        startLabel.setAttribute('font-family', 'et-book, serif');
        startLabel.setAttribute('font-size', '10px');
        startLabel.setAttribute('fill', '#666');
        startLabel.textContent = sortedData[0]?.year;
        svg.appendChild(startLabel);

        const endLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        endLabel.setAttribute('x', width - margin.right);
        endLabel.setAttribute('y', height - 5);
        endLabel.setAttribute('text-anchor', 'end');
        endLabel.setAttribute('font-family', 'et-book, serif');
        endLabel.setAttribute('font-size', '10px');
        endLabel.setAttribute('fill', '#666');
        endLabel.textContent = sortedData[sortedData.length - 1]?.year;
        svg.appendChild(endLabel);

        this.container.appendChild(svg);
    }

    renderTable() {
        const table = document.createElement('div');
        table.className = 'timeline-table';
        table.setAttribute('role', 'table');
        table.setAttribute('aria-label', 'Career milestones table');

        const header = document.createElement('div');
        header.className = 'timeline-table-header';
        header.innerHTML = `
            <div>Year</div>
            <div>Company</div>
            <div>Role</div>
            <div>Duration</div>
        `;
        table.appendChild(header);

        const sortedData = [...this.data].sort((a, b) => a.year - b.year);
        sortedData.forEach((milestone, index) => {
            const row = document.createElement('div');
            row.className = 'timeline-table-row';
            row.setAttribute('role', 'row');
            row.setAttribute('data-year', milestone.year);
            row.style.animationDelay = `${index * 50}ms`;
            row.innerHTML = `
                <div style="font-family: monospace">${milestone.year}</div>
                <div style="color: rgb(75 85 99)">${milestone.company}</div>
                <div>${milestone.title}</div>
                <div style="font-size: 0.75rem; color: rgb(107 114 128)">${milestone.duration}</div>
            `;
            row.addEventListener('click', () => this.selectMilestone(milestone));
            table.appendChild(row);
        });

        this.container.appendChild(table);
    }

    selectMilestone(milestone) {
        // Remove previous selected state
        const allRows = document.querySelectorAll('.timeline-table-row');
        allRows.forEach(row => row.classList.remove('selected'));
        
        if (this.selectedMilestone?.year === milestone.year) {
            this.selectedMilestone = null;
            this.hideDetail();
        } else {
            this.selectedMilestone = milestone;
            this.showDetail(milestone);
            
            // Add selected state to current row
            const selectedRow = document.querySelector(`.timeline-table-row[data-year="${milestone.year}"]`);
            if (selectedRow) {
                selectedRow.classList.add('selected');
            }
        }
    }

    highlightMilestone(indicator) {
        indicator.setAttribute('fill', this.config.colors.hover);
        indicator.style.transform = 'scaleX(1.5)';
    }

    unhighlightMilestone(indicator, originalColor) {
        indicator.setAttribute('fill', originalColor || this.config.colors.indicator);
        indicator.style.transform = 'scaleX(1)';
    }

    showDetail(milestone) {
        if (!this.detailPanel) return;

        const achievementsHTML = milestone.achievements.map((achievement, i) => 
            `<div class="achievement-item" style="animation-delay: ${i * 100}ms">• ${achievement}</div>`
        ).join('');

        this.detailPanel.innerHTML = `
            <div class="milestone-detail">
                <div class="milestone-detail-header">
                    <div class="milestone-detail-title">${milestone.year} — ${milestone.title}</div>
                    <div class="milestone-detail-meta">${milestone.company}, ${milestone.duration}</div>
                </div>
                <div class="milestone-detail-impact">${milestone.impact}</div>
                <div class="milestone-detail-achievements">
                    ${achievementsHTML}
                </div>
            </div>
        `;

        this.detailPanel.style.display = 'block';
        this.detailPanel.classList.add('visible');
    }

    hideDetail() {
        if (this.detailPanel) {
            this.detailPanel.classList.remove('visible');
            setTimeout(() => {
                this.detailPanel.style.display = 'none';
            }, 300);
        }
    }
}

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
            // Get locations from resume data - fully dynamic, no fallback
            const resumeData = window.resume || {};
            this.locations = resumeData.meta?.locations || [];
            
            if (this.locations.length === 0) {
                console.warn('No locations found in resume data');
                return;
            }

            this.createMap();
            this.createTooltip();
            this.addToPage();
        } catch (error) {
            console.error('Career map failed to load:', error);
        }
    }

    createMap() {
        const w = 550, h = 300;
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Map showing career moves from San Francisco → Provo → Pembroke → Pakistan');
        svg.style.width = '100%';
        svg.style.height = 'auto';

        // Simple Mercator-like projection with visual center shifted down 1/3
        const projection = (lon, lat) => {
            const x = (lon + 180) * (w / 360);
            const latRad = lat * Math.PI / 180;
            const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
            // Shift the vertical center down by h/5 for better canvas positioning
            const y = (h / 2 + h / 5) - (w * mercN / (2 * Math.PI));
            // No Y-clamp; only a soft 10-px padding
            return [Math.max(10, Math.min(w-10, x)), Math.max(10, Math.min(h-10, y))];
        };

        // Add simplified world outline (Natural Earth 110m inspired, single-stroke)
        const worldOutline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Simplified world landmasses projected to our Mercator-like coordinates
        // Scale factors for our 550x300 compact viewport
        const scaleX = w / 360;
        const scaleY = h / 180;
        const offsetX = w / 2;
        const offsetY = h / 2;
        
        // Function to convert lat/lon to our coordinate system (matching main projection)
        const toCoords = (lon, lat) => {
            const x = (lon + 180) * scaleX;
            const latRad = lat * Math.PI / 180;
            const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
            // Use same vertical shift as main projection
            const y = (h / 2 + h / 5) - (w * mercN / (2 * Math.PI));
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
        worldOutline.setAttribute('stroke-width', '0.25');
        worldOutline.setAttribute('fill', 'none');
        worldOutline.setAttribute('opacity', '0.35');
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
        
        // Add gradient stroke that fades to the destination
        const grad = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
        grad.id = 'journeyGrad';
        grad.innerHTML = `<stop offset="0%" stop-color="#b20808" stop-opacity="0.4"/>
                          <stop offset="100%" stop-color="#b20808" stop-opacity="1"/>`;
        defs.appendChild(grad);
        
        svg.appendChild(defs);

        // Project locations
        const projectedLocations = this.locations.map(loc => {
            const [x, y] = projection(loc.lon, loc.lat);
            return { ...loc, x, y };
        });
        
        // Create a copy for marker positions with nudge
        const markerLocations = projectedLocations.map(loc => ({
            ...loc,
            y: loc.y + 8  // Nudge markers down 8px for better visual balance
        }));

        // Create geodesic journey path using D3
        const createGeodesicPath = () => {
            if (typeof d3 === 'undefined') {
                console.warn('D3 not loaded, falling back to simple arcs');
                return this.createFallbackPath(markerLocations);
            }

            // Create one continuous array of points for the entire journey
            const allPoints = [];
            let outOfBounds = false;
            
            for (let i = 0; i < this.locations.length - 1; i++) {
                const source = [this.locations[i].lon, this.locations[i].lat];
                const target = [this.locations[i+1].lon, this.locations[i+1].lat];
                
                // Use D3's geoInterpolate for great circle interpolation
                const interpolate = d3.geoInterpolate(source, target);
                
                // Sample points along the great circle
                const segmentSamples = (i === this.locations.length - 2) ? 30 : 29; // Last segment gets full 30 points
                for (let t = 0; t <= 1; t += 1/29) {
                    // Skip the first point of segments after the first to avoid duplicates
                    if (i > 0 && t === 0) continue;
                    
                    const [lon, lat] = interpolate(t);
                    const [x, y] = projection(lon, lat);
                    const nudgedY = y + 8;
                    
                    // Check if point goes out of bounds
                    if (nudgedY < 0 || nudgedY > h) {
                        outOfBounds = true;
                    }
                    
                    // Apply the same 8px nudge to path points
                    allPoints.push([x, nudgedY]);
                }
            }
            
            // Fall back to Bézier curves if geodesic goes out of bounds
            if (outOfBounds) {
                console.warn('Great-circle arc left viewBox – switching to Bézier');
                return this.createFallbackPath(markerLocations);
            }
            
            // Use D3's line generator with cardinal curve for smooth interpolation
            const line = d3.line()
                .curve(d3.curveCardinal.tension(0.3))
                .x(d => d[0])
                .y(d => d[1]);
            
            return line(allPoints);
        };
        
        const journeyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        journeyPath.setAttribute('d', createGeodesicPath());
        journeyPath.setAttribute('stroke', 'url(#journeyGrad)');
        journeyPath.setAttribute('stroke-width', '1');
        journeyPath.setAttribute('stroke-linecap', 'round');
        journeyPath.setAttribute('stroke-linejoin', 'round');       // smoother
        journeyPath.setAttribute('stroke-dasharray', '3 5');        // tighter rhythm
        journeyPath.setAttribute('stroke-opacity', '0.3');          // lighter appearance
        journeyPath.setAttribute('fill', 'none');
        journeyPath.setAttribute('marker-end', 'url(#arrow)');
        svg.appendChild(journeyPath);

        // Add location markers with interactions
        markerLocations.forEach((location, index) => {
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
                marker.animate([{r:3},{r:5},{r:3}],{duration:600,iterations:1});
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

            // Add location label with better spacing around the curve
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', location.x);
            // Position labels with more breathing room - above or below markers strategically
            const labelY = location.y < h/2 ? location.y + 22 : location.y - 20;
            label.setAttribute('y', labelY);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-family', 'et-book');
            label.setAttribute('font-size', 'max(9px, 0.6vw)');  // responsive, min 9px
            label.setAttribute('font-variant', 'small-caps');
            label.setAttribute('fill', '#444');            // darker, but low-saturation
            
            // Add numbers to show career progression - using dynamic array position
            const labelNumber = index + 1;
            label.textContent = `${labelNumber}. ${location.name}`;
            svg.appendChild(label);
        });

        this.container.appendChild(svg);
    }

    createFallbackPath(projectedLocations) {
        // Fallback to simple Bézier curves when D3 is not available
        let pathData = `M ${projectedLocations[0].x},${projectedLocations[0].y}`;
        for (let i = 1; i < projectedLocations.length; i++) {
            const curr = projectedLocations[i];
            const prev = projectedLocations[i-1];
            const midX = (prev.x + curr.x) / 2;
            const midY = (prev.y + curr.y) / 2 - 35;   // tighter bell-curve arch
            pathData += ` Q ${midX},${midY} ${curr.x},${curr.y}`;
        }
        return pathData;
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'location-tooltip';
        document.body.appendChild(this.tooltip);
    }

    showTooltip(event, location) {
        if (!this.tooltip) return;
        
        // Create rich tooltip content with glassmorphic design
        const projectCards = location.projects.map(project => {
            // Handle both old (string) and new (object) project formats
            if (typeof project === 'string') {
                return `<div class="project-card">
                    <div class="title">${project}</div>
                </div>`;
            }
            
            return `<div class="project-card">
                <div class="title">${project.title}</div>
                <div class="metric-chips">
                    <span class="year-chip">${project.year}</span>
                    <span class="role-chip">${project.role}</span>
                </div>
                <div class="description">${project.description}</div>
            </div>`;
        }).join('');
        
        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <h4 class="location-title">${location.name}</h4>
            </div>
            <div class="tooltip-content">
                ${projectCards}
            </div>
        `;
        
        // Position tooltip with edge clamping
        this.tooltip.style.display = 'block';
        
        // Calculate position with viewport edge detection
        let left = event.pageX + 10;
        let top = event.pageY - 10;
        
        // Get tooltip dimensions after content is set
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        // Clamp to viewport edges
        if (left + tooltipRect.width > window.innerWidth - 12) {
            left = window.innerWidth - tooltipRect.width - 12;
        }
        if (top + tooltipRect.height > window.innerHeight - 12) {
            top = window.innerHeight - tooltipRect.height - 12;
        }
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        
        // Trigger glassmorphic fade-in animation
        requestAnimationFrame(() => {
            this.tooltip.classList.add('visible');
        });
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.remove('visible');
            // Hide after animation completes
            setTimeout(() => {
                if (this.tooltip && !this.tooltip.classList.contains('visible')) {
                    this.tooltip.style.display = 'none';
                }
            }, 300); // Match CSS transition duration
        }
    }

    addToPage() {
        const aboutSection = Array.from(document.querySelectorAll('section')).find(section => {
            const h2 = section.querySelector('h2');
            return h2 && h2.textContent.includes('About');
        });
        if (!aboutSection) return;
        
        const figure = document.createElement('figure');
        figure.className = 'career-map-figure';
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
    constructor(annotations = null) {
        // Get annotations from resume data or use defaults
        const resumeData = window.resume || {};
        this.annotations = annotations || resumeData.meta?.annotations || [
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

