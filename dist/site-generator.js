// Site Generator - Builds the entire site from resume.json
class SiteGenerator {
    constructor() {
        this.resume = null;
        this.sidenoteCounter = 0;
        this.init();
    }

    async init() {
        try {
            const response = await fetch('resume.json');
            this.resume = await response.json();
            this.generateSite();
        } catch (error) {
            console.error('Error loading resume.json:', error);
        }
    }

    generateSite() {
        document.title = `${this.resume.basics.name} - ${this.resume.basics.label}`;
        
        const article = document.querySelector('article');
        
        // Fade out skeleton before replacing content
        const skeletonDiv = article.querySelector('.skeleton-loading');
        if (skeletonDiv) {
            skeletonDiv.style.transition = 'opacity 0.3s ease';
            skeletonDiv.style.opacity = '0';
            
            setTimeout(() => {
                this.replaceSkeleton(article);
            }, 300);
        } else {
            this.replaceSkeleton(article);
        }
    }
    
    replaceSkeleton(article) {
        article.innerHTML = '';
        article.style.opacity = '0';
        
        // Header
        article.appendChild(this.createHeader());
        
        // Timeline
        if (this.resume.meta.animations.sparklineTimeline) {
            const figure = document.createElement('figure');
            const timelineContainer = document.createElement('div');
            timelineContainer.className = 'timeline-container';
            
            const caption = document.createElement('figcaption');
            caption.textContent = 'Career trajectory showing key milestones from humanitarian work to technical leadership';
            
            figure.appendChild(timelineContainer);
            figure.appendChild(caption);
            article.appendChild(figure);
        }
        
        // About Section
        article.appendChild(this.createAboutSection());
        
        // Work Section
        article.appendChild(this.createWorkSection());
        
        // Network Graph
        if (this.resume.meta.animations.networkGraph) {
            const figure = document.createElement('figure');
            const networkContainer = document.createElement('div');
            networkContainer.className = 'network-container';
            
            const caption = document.createElement('figcaption');
            caption.textContent = 'Professional network visualization mapping connections across technology and leadership domains';
            
            figure.appendChild(networkContainer);
            figure.appendChild(caption);
            article.appendChild(figure);
        }
        
        // Skills Section
        article.appendChild(this.createSkillsSection());
        
        // Writing Section
        if (this.resume.publications && this.resume.publications.length > 0) {
            article.appendChild(this.createWritingSection());
        }
        
        // Contact Section
        article.appendChild(this.createContactSection());
        
        // Footer
        article.appendChild(this.createFooter());
        
        // Fade in the content
        article.style.transition = 'opacity 0.5s ease';
        requestAnimationFrame(() => {
            article.style.opacity = '1';
        });
        
        // Initialize animations after DOM is ready
        setTimeout(() => {
            this.initializeAnimations();
        }, 100);
    }

    createHeader() {
        const header = document.createElement('header');
        header.innerHTML = `
            <h1>${this.resume.basics.name}</h1>
            <p class="subtitle">${this.resume.basics.label}</p>
        `;
        return header;
    }

    createAboutSection() {
        const section = document.createElement('section');
        
        // Split summary into paragraphs
        const summaryParts = this.resume.basics.summary.split('. ');
        const firstPart = summaryParts.slice(0, 2).join('. ') + '.';
        const secondPart = summaryParts.slice(2).join('. ');
        
        section.innerHTML = `
            <h2>About</h2>
            <p>
                ${this.addSidenote(firstPart, 'Building technology that makes a difference in people\'s lives.')}
            </p>
            <p>${secondPart}</p>
        `;
        
        return section;
    }

    createWorkSection() {
        const section = document.createElement('section');
        section.innerHTML = '<h2>Work</h2>';
        
        // Add description
        const desc = document.createElement('p');
        desc.innerHTML = this.addSidenote(
            'Selected projects and contributions',
            'Each project represents a journey of problem-solving and impact.'
        );
        section.appendChild(desc);
        
        // Add projects
        this.resume.work.forEach(job => {
            const project = this.createProject(job);
            section.appendChild(project);
        });
        
        return section;
    }

    createProject(job) {
        const div = document.createElement('div');
        div.className = 'project';
        
        // Calculate duration
        const startYear = new Date(job.startDate).getFullYear();
        const endYear = job.endDate ? new Date(job.endDate).getFullYear() : 'Present';
        const duration = endYear === 'Present' ? `${startYear}–Present` : `${startYear}–${endYear}`;
        
        div.innerHTML = `
            <h3>${job.name}</h3>
            <p class="project-meta">${duration} · ${job.position}</p>
            <p class="project-summary">${job.summary}</p>
        `;
        
        // Inject metrics after DOM creation to prevent conflicts
        if (job.metrics) {
            const summaryElement = div.querySelector('.project-summary');
            if (summaryElement) {
                const processedSummary = this.injectMetrics(summaryElement.innerHTML, job.metrics);
                summaryElement.innerHTML = processedSummary;
            }
        }
        
        // Store data for deep-dive
        div.dataset.projectData = JSON.stringify({
            name: job.name,
            metrics: job.metrics,
            technologies: job.technologies || [],
            highlights: job.highlights || []
        });
        
        return div;
    }

    injectMetrics(text, metrics) {
        // Replace numbers in text with animated metrics
        let result = text;
        
        // Skip if text already has metric spans (prevent double-processing)
        if (result.includes('data-metric=') || result.includes('metric-injected')) {
            return result;
        }
        
        // Sort metrics by value descending to handle larger numbers first (prevents conflicts)
        const sortedMetrics = Object.entries(metrics).sort(([,a], [,b]) => b.value - a.value);
        
        sortedMetrics.forEach(([key, metric]) => {
            const value = metric.value;
            const unit = metric.unit || '';
            const prefix = metric.prefix || '';
            const suffix = metric.suffix || '';
            
            // Skip if value is not a valid number
            if (typeof value !== 'number' || isNaN(value)) {
                console.warn(`Invalid metric value for ${key}:`, value, typeof value);
                return;
            }
            
            // Helper: strip any char that isn't a digit or decimal point
            const clean = v => String(v).replace(/[^\d.]/g, '');
            
            // Create specific patterns to avoid conflicts
            let patterns = [];
            
            // Handle different unit types with specific patterns
            if (unit === '%') {
                patterns.push(new RegExp(`\\b${value}%`, 'g'));
                patterns.push(new RegExp(`\\b${value}\\s*%`, 'g'));
            } else if (unit === 'x') {
                patterns.push(new RegExp(`\\b${value}×`, 'g'));
                patterns.push(new RegExp(`\\b${value}\\s*×`, 'g'));
            } else if (unit === 'min') {
                patterns.push(new RegExp(`\\b${value}\\s*min`, 'g'));
            } else if (suffix === '+') {
                // Handle "10,000+" or "10 000+"
                const formattedValue = value.toLocaleString().replace(/,/g, ' ');
                patterns.push(new RegExp(`\\b${formattedValue}\\+`, 'g'));
                patterns.push(new RegExp(`\\b${value}\\+`, 'g'));
            } else {
                // Default patterns for numbers like "15-engineer"
                patterns.push(new RegExp(`\\b${value}-\\w+`, 'g'));
                patterns.push(new RegExp(`\\b${value}\\b`, 'g'));
            }
            
            patterns.forEach(pattern => {
                // Create a unique marker to track what we've processed
                const processedMarker = `__PROCESSED_${key}__`;
                
                // Only replace if not already processed
                result = result.replace(pattern, (match, offset, string) => {
                    // Skip if this specific metric was already processed
                    if (string.includes(processedMarker)) {
                        return match;
                    }
                    
                    // For patterns like "15-engineer", preserve the full match but animate the number
                    const animatedValue = `${prefix}0${suffix}${unit}`;
                    const displayText = match.replace(value.toString(), animatedValue);
                    return `<span data-metric="${clean(value)}" data-prefix="${prefix}" data-suffix="${suffix}" data-placeholder="${animatedValue}" metric-injected="true">${displayText}</span>${processedMarker}`;
                });
                
                // Remove the marker after processing
                result = result.replace(new RegExp(processedMarker, 'g'), '');
            });
        });
        
        return result;
    }

    createSkillsSection() {
        const section = document.createElement('section');
        
        // Build skills string
        const allSkills = this.resume.skills
            .flatMap(category => category.keywords)
            .slice(0, 6)
            .join(', ');
        
        // Build languages string
        const languages = this.resume.languages
            .map(lang => `${lang.language} (${lang.fluency})`)
            .join(', ');
        
        // Build interests string
        const interests = this.resume.interests
            .flatMap(interest => interest.keywords)
            .slice(0, 5)
            .join(', ');
        
        section.innerHTML = `
            <h2>Skills & Interests</h2>
            <p>
                <strong>Technical:</strong> ${this.addSidenote(allSkills, 'Full-stack expertise from system design to implementation.')}<br>
                <strong>Languages:</strong> ${languages}<br>
                <strong>Causes:</strong> ${interests}
            </p>
        `;
        
        return section;
    }

    createWritingSection() {
        const section = document.createElement('section');
        section.innerHTML = '<h2>Writing</h2>';
        
        const list = document.createElement('ul');
        list.className = 'article-list';
        
        this.resume.publications.forEach(pub => {
            const year = new Date(pub.releaseDate).getFullYear();
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="article-date">${year}</span>
                <a href="${pub.url || '#'}">${pub.name}</a>
            `;
            list.appendChild(li);
        });
        
        section.appendChild(list);
        return section;
    }

    createContactSection() {
        const section = document.createElement('section');
        const contacts = [];
        
        if (this.resume.basics.url) {
            contacts.push(`Website: <a href="${this.resume.basics.url}">${this.resume.basics.url.replace('http://', '')}</a>`);
        }
        
        this.resume.basics.profiles.forEach(profile => {
            contacts.push(`${profile.network}: <a href="${profile.url}">${profile.username}</a>`);
        });
        
        if (this.resume.basics.location.city) {
            contacts.push(`Location: ${this.resume.basics.location.city}`);
        }
        
        section.innerHTML = `
            <h2>Contact</h2>
            <p>${contacts.join('<br>')}</p>
        `;
        
        // Make external links open in new tabs
        section.querySelectorAll('a[href^="http"]').forEach(a => {
            a.target = "_blank"; a.rel = "noopener noreferrer";
        });
        
        return section;
    }

    createFooter() {
        const footer = document.createElement('footer');
        const year = new Date().getFullYear();
        footer.innerHTML = `
            <p class="footer-text">© ${year} ${this.resume.basics.name}. Built with attention to typography and readability.</p>
        `;
        return footer;
    }

    addSidenote(text, note) {
        const id = `sn-${++this.sidenoteCounter}`;
        const noteIndex = text.indexOf('.');
        if (noteIndex === -1 || !note) return text;
        
        return text.slice(0, noteIndex) + 
               `<label for="${id}" class="margin-toggle sidenote-number"></label>` +
               `<input type="checkbox" id="${id}" class="margin-toggle"/>` +
               `<span class="sidenote">${note}</span>` +
               text.slice(noteIndex);
    }

    initializeAnimations() {
        // Check for reduced motion preference
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('Reduced motion detected - skipping animations');
            return;
        }
        
        // Initialize all animation classes with configuration from resume.json
        const animations = this.resume.meta.animations;
        
        if (animations.sparklineTimeline) {
            window.careerTimeline = new CareerTimeline();
            // Update timeline data
            window.careerTimeline.points = this.resume.meta.careerTimeline;
            window.careerTimeline.drawn = false;
            window.careerTimeline.animateTimeline();
        }
        
        if (animations.impactMetrics) {
            new ImpactMetrics();
        }
        
        if (animations.networkGraph) {
            const graph = new NetworkGraph();
            // Update graph data from skills and work
            this.updateNetworkGraph(graph);
        }
        
        if (animations.marginNotes) {
            new MarginNoteChoreographer();
        }
        
        if (animations.readingProgress) {
            new ReadingProgress();
        }
        
        if (animations.projectDeepDives) {
            new ProjectDeepDive();
        }
        
        if (animations.skillConstellation) {
            new SkillConstellation(this.resume);
        }
        
        if (animations.careerMap) {
            // Make resume data available to CareerMap
            window.resume = this.resume;
            const map = new CareerMap();
            // Update locations from meta
            map.locations = this.resume.meta.locations;
        }
        
        if (animations.dataInkReveals) {
            new DataInkReveals();
        }
        
        if (animations.breathingWhitespace) {
            new BreathingWhitespace();
        }
        
        if (animations.tufteAnnotations) {
            const annotations = new TufteAnnotations();
            annotations.annotations = this.resume.meta.annotations;
        }
    }

    updateNetworkGraph(graph) {
        // Clear existing data to prevent duplicates
        graph.nodes.length = 0;
        graph.edges.length = 0;
        
        // Build network from resume data
        const nodes = [];
        const edges = [];
        let id = 0;
        
        // Add skill nodes
        const skillNodes = {};
        this.resume.skills.forEach(category => {
            category.keywords.slice(0, 3).forEach(skill => {
                skillNodes[skill] = id;
                nodes.push({
                    id: id++,
                    label: skill,
                    type: 'skill',
                    x: Math.random() * graph.canvas.width,
                    y: Math.random() * graph.canvas.height,
                    vx: 0,
                    vy: 0
                });
            });
        });
        
        // Add project nodes and connect to skills
        this.resume.work.slice(0, 4).forEach(job => {
            const projectId = id;
            nodes.push({
                id: id++,
                label: job.name,
                type: 'project',
                x: Math.random() * graph.canvas.width,
                y: Math.random() * graph.canvas.height,
                vx: 0,
                vy: 0
            });
            
            // Connect to related skills
            if (job.technologies) {
                job.technologies.forEach(tech => {
                    if (skillNodes[tech] !== undefined) {
                        edges.push({ source: skillNodes[tech], target: projectId });
                    }
                });
            }
        });
        
        // Add impact nodes
        this.resume.interests[0].keywords.slice(0, 3).forEach(interest => {
            nodes.push({
                id: id++,
                label: interest,
                type: 'impact',
                x: Math.random() * graph.canvas.width,
                y: Math.random() * graph.canvas.height,
                vx: 0,
                vy: 0
            });
        });
        
        graph.nodes = nodes;
        graph.edges = edges;
    }
}

// Initialize the site generator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SiteGenerator();
});