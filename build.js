#!/usr/bin/env node

/**
 * Build script for Tufte Personal Site
 * Validates resume.json and prepares files for deployment
 */

const fs = require('fs');
const path = require('path');

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
            // Copy dynamic index to index.html
            const dynamicIndex = fs.readFileSync('index-dynamic.html', 'utf8');
            fs.writeFileSync('index.html', dynamicIndex);
            console.log('✅ Created index.html\n');
        } catch (error) {
            this.errors.push(`Error creating index.html: ${error.message}`);
        }
    }

    minifyCSS() {
        console.log('🎨 Processing CSS files...');
        
        try {
            // Simple CSS minification (remove comments and extra whitespace)
            const files = ['styles.css', 'animations.css'];
            
            files.forEach(file => {
                const css = fs.readFileSync(file, 'utf8');
                const minified = css
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                    .replace(/\s+/g, ' ') // Collapse whitespace
                    .replace(/\s*{\s*/g, '{') // Remove space around {
                    .replace(/\s*}\s*/g, '}') // Remove space around }
                    .replace(/\s*:\s*/g, ':') // Remove space around :
                    .replace(/\s*;\s*/g, ';') // Remove space around ;
                    .trim();
                
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
                'styles.css',
                'animations.css',
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
builder.build();