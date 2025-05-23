// Baseline Grid Toggle - CMD+G / Ctrl+G
class BaselineGrid {
    constructor() {
        this.isActive = false;
        this.init();
    }

    init() {
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Check for CMD+G (Mac) or Ctrl+G (Windows/Linux)
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'g') {
                event.preventDefault();
                this.toggle();
            }
        });

        // Update hint text based on platform
        this.updateHintText();
    }

    toggle() {
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            document.body.classList.add('show-grid');
            console.log('📐 Baseline grid: ON (12px intervals)');
        } else {
            document.body.classList.remove('show-grid');
            console.log('📐 Baseline grid: OFF');
        }
        
        this.updateHintText();
    }

    updateHintText() {
        const hint = document.querySelector('.grid-hint');
        if (hint) {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const shortcut = isMac ? '⌘+G' : 'Ctrl+G';
            const status = this.isActive ? 'ON' : 'OFF';
            
            hint.textContent = `12px Baseline Grid: ${status} (${shortcut} to toggle)`;
        }
    }

    // Method to check alignment - useful for development
    checkAlignment(element) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const relativeTop = rect.top - bodyRect.top;
        
        const gridOffset = relativeTop % 12;
        const isAligned = gridOffset === 0 || gridOffset === 12;
        
        console.log(`Element alignment:`, {
            element: element.tagName.toLowerCase(),
            topPosition: relativeTop,
            gridOffset: gridOffset,
            isAligned: isAligned
        });
        
        return isAligned;
    }

    // Method to align all typography to the 12px grid
    alignToGrid() {
        if (!this.isActive) {
            console.log('Enable grid first with CMD+G or Ctrl+G');
            return;
        }

        console.log('🔧 Analyzing typography alignment...');
        
        const elements = document.querySelectorAll('h1, h2, h3, p, .project-meta, footer');
        let alignedCount = 0;
        let totalCount = 0;

        elements.forEach(el => {
            if (el.offsetParent !== null) { // Only check visible elements
                totalCount++;
                if (this.checkAlignment(el)) {
                    alignedCount++;
                }
            }
        });

        console.log(`📊 Grid alignment: ${alignedCount}/${totalCount} elements aligned to 12px baseline`);
        
        if (alignedCount === totalCount) {
            console.log('✅ Perfect baseline grid alignment achieved!');
        } else {
            console.log('⚠️ Some elements need adjustment for perfect alignment');
        }
    }
}

// Initialize the baseline grid system
document.addEventListener('DOMContentLoaded', () => {
    window.baselineGrid = new BaselineGrid();
    
    // Add helpful console message
    console.log('📐 Baseline Grid System loaded');
    console.log('   • Press CMD+G (Mac) or Ctrl+G (Windows/Linux) to toggle 12px grid');
    console.log('   • Use baselineGrid.alignToGrid() to check element alignment');
    console.log('   • Use baselineGrid.checkAlignment(element) to test specific elements');
});