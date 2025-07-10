#!/usr/bin/env node

/**
 * Build script for Tufte Personal Site
 * Validates resume.json and prepares files for deployment
 */

const fs = require('fs');
const path = require('path');
// PDF generation removed - no longer needed

// Try to load clean-css, fall back to naive method if not available
let CleanCSS;
try {
    CleanCSS = require('clean-css');
} catch (e) {
    console.warn('⚠️  clean-css not found. Run "npm install" for better CSS minification.');
}

class SiteBuilder {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    build() {
        console.log('🔨 Building Tufte Personal Site...\n');

        // Validate resume.json
        if (!this.validateResume()) {
            this.printErrors();
            process.exit(1);
        }

        // Create production index.html
        this.createProductionIndex();

        // Minify CSS (simple version)
        this.minifyCSS();

        // Create dist folder
        this.createDistFolder();

        // Print summary
        this.printSummary();
    }

    validateResume() {
        console.log('📋 Validating resume.json...');

        try {
            const resumeData = fs.readFileSync('resume.json', 'utf8');
            const resume = JSON.parse(resumeData);

            // Check required fields
            if (!resume.basics) {
                this.errors.push('Missing "basics" section');
            } else {
                if (!resume.basics.name) this.errors.push('Missing basics.name');
                if (!resume.basics.label) this.warnings.push('Missing basics.label (tagline)');
                if (!resume.basics.summary) this.warnings.push('Missing basics.summary');
            }

            if (!resume.work || resume.work.length === 0) {
                this.warnings.push('No work experience entries');
            }

            // Validate work entries
            if (resume.work) {
                resume.work.forEach((job, index) => {
                    if (!job.name) this.errors.push(`Work entry ${index + 1}: missing company name`);
                    if (!job.position) this.errors.push(`Work entry ${index + 1}: missing position`);
                    if (!job.startDate) this.warnings.push(`Work entry ${index + 1}: missing start date`);
                    
                    // Check metrics format
                    if (job.metrics) {
                        Object.entries(job.metrics).forEach(([key, metric]) => {
                            if (typeof metric.value === 'undefined') {
                                this.errors.push(`Work entry ${index + 1}: metric "${key}" missing value`);
                            }
                        });
                    }
                });
            }

            // Validate meta section
            if (resume.meta) {
                if (resume.meta.careerTimeline) {
                    resume.meta.careerTimeline.forEach((point, index) => {
                        if (!point.year) this.errors.push(`Timeline point ${index + 1}: missing year`);
                        if (!point.label) this.warnings.push(`Timeline point ${index + 1}: missing label`);
                    });
                }
            }

            if (this.errors.length === 0) {
                console.log('✅ resume.json is valid\n');
            } else {
                console.log('❌ resume.json has validation errors\n');
            }
            return this.errors.length === 0;

        } catch (error) {
            if (error.code === 'ENOENT') {
                this.errors.push('resume.json file not found');
            } else if (error instanceof SyntaxError) {
                this.errors.push(`Invalid JSON: ${error.message}`);
            } else {
                this.errors.push(`Error reading resume.json: ${error.message}`);
            }
            return false;
        }
    }

    createProductionIndex() {
        console.log('📄 Creating production index.html...');
        
        try {
            // Copy dynamic index to index.html and replace with minified CSS
            let indexContent = fs.readFileSync('index-dynamic.html', 'utf8');
            
            // Load resume data for SEO tags
            const resumeData = JSON.parse(fs.readFileSync('resume.json', 'utf8'));
            
            // Replace CSS links with minified versions
            indexContent = indexContent
                .replace('styles.css', 'styles.min.css')
                .replace('animations.css', 'animations.min.css');
            
            // Replace title
            const pageTitle = `${resumeData.basics.name} - ${resumeData.basics.label}`;
            indexContent = indexContent.replace('<title>Loading...</title>', `<title>${pageTitle}</title>`);
            
            // Add SEO meta tags
            const seoTags = `    <meta name="description" content="${resumeData.basics.summary}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${resumeData.basics.summary}">
    <meta property="og:type" content="profile">
    <meta property="og:url" content="${resumeData.basics.url}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${resumeData.basics.summary}">
`;
            
            // Add font preload for better performance
            const fontPreload = '    <link rel="preload" href="https://cdn.jsdelivr.net/gh/edwardtufte/et-book@gh-pages/et-book/et-book-roman-line-figures/et-book-roman-line-figures.woff" as="font" type="font/woff" crossorigin>\n';
            
            indexContent = indexContent.replace('</head>', seoTags + fontPreload + '</head>');
            
            fs.writeFileSync('index.html', indexContent);
            console.log('✅ Created index.html with SEO tags and minified CSS links\n');
        } catch (error) {
            this.errors.push(`Error creating index.html: ${error.message}`);
        }
    }

    minifyCSS() {
        console.log('🎨 Processing CSS files...');
        
        try {
            const files = ['styles.css', 'animations.css'];
            
            files.forEach(file => {
                const css = fs.readFileSync(file, 'utf8');
                let minified;
                
                if (CleanCSS) {
                    // Use clean-css for proper minification
                    const cleanCSS = new CleanCSS({
                        level: {
                            1: {
                                specialComments: 0 // Remove all comments
                            },
                            2: {
                                mergeAdjacentRules: true,
                                mergeIntoShorthands: true,
                                mergeMedia: true,
                                mergeNonAdjacentRules: true,
                                mergeSemantically: false,
                                overrideProperties: true,
                                removeEmpty: true,
                                reduceNonAdjacentRules: true,
                                removeDuplicateFontRules: true,
                                removeDuplicateMediaBlocks: true,
                                removeDuplicateRules: true,
                                removeUnusedAtRules: false
                            }
                        }
                    });
                    const output = cleanCSS.minify(css);
                    
                    if (output.errors.length > 0) {
                        output.errors.forEach(error => this.warnings.push(`CSS Error in ${file}: ${error}`));
                    }
                    if (output.warnings.length > 0) {
                        output.warnings.forEach(warning => this.warnings.push(`CSS Warning in ${file}: ${warning}`));
                    }
                    
                    minified = output.styles;
                } else {
                    // Fallback to naive minification
                    minified = css
                        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                        .replace(/\s+/g, ' ') // Collapse whitespace
                        .replace(/\s*{\s*/g, '{') // Remove space around {
                        .replace(/\s*}\s*/g, '}') // Remove space around }
                        .replace(/\s*:\s*/g, ':') // Remove space around :
                        .replace(/\s*;\s*/g, ';') // Remove space around ;
                        .trim();
                }
                
                // Save minified version
                fs.writeFileSync(file.replace('.css', '.min.css'), minified);
            });
            
            console.log('✅ Created minified CSS files\n');
        } catch (error) {
            this.warnings.push(`CSS processing warning: ${error.message}`);
        }
    }


    createDistFolder() {
        console.log('📦 Creating distribution folder...');
        
        try {
            // Create dist directory
            if (!fs.existsSync('dist')) {
                fs.mkdirSync('dist');
            }

            // Files to copy
            const files = [
                'index.html',
                'resume.json',
                'print.css',             // Include print styles
                'styles.min.css',        // Copy minified version
                'animations.min.css',    // Copy minified version
                'animations.js',
                'advanced-animations.js',
                'baseline-grid.js',
                'site-generator.js',
                '.nojekyll'
            ];

            // Copy files to dist
            files.forEach(file => {
                if (fs.existsSync(file)) {
                    fs.copyFileSync(file, path.join('dist', file));
                }
            });

            console.log('✅ Created dist folder with all necessary files\n');
        } catch (error) {
            this.warnings.push(`Distribution folder warning: ${error.message}`);
        }
    }

    printErrors() {
        if (this.errors.length > 0) {
            console.error('\n❌ Build failed with errors:\n');
            this.errors.forEach(error => {
                console.error(`   - ${error}`);
            });
        }
    }

    printSummary() {
        console.log('📊 Build Summary:');
        console.log('================\n');

        if (this.warnings.length > 0) {
            console.log('⚠️  Warnings:');
            this.warnings.forEach(warning => {
                console.log(`   - ${warning}`);
            });
            console.log('');
        }

        console.log('✅ Build completed successfully!');
        console.log('\n📚 Next steps:');
        console.log('   1. Test locally: open index.html in a browser');
        console.log('   2. Deploy: push to GitHub Pages or copy dist/* to your server');
        console.log('   3. Custom domain: add CNAME file if needed\n');
    }
}

// Run the builder
const builder = new SiteBuilder();
try {
    builder.build();
    // Exit with error code if there were errors
    if (builder.errors.length > 0) {
        process.exit(1);
    }
} catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
}