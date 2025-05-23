#!/bin/bash

# Script to copy relevant codebase files to clipboard for LLM review
# Core files that define the site's functionality and structure

echo "=== TUFTE PERSONAL SITE - CODE REVIEW FILES ===" > /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Core data file
echo "=== resume.json ===" >> /tmp/codebase_review.txt
cat resume.json >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Main site generation logic
echo "=== site-generator.js ===" >> /tmp/codebase_review.txt
cat site-generator.js >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Animation system
echo "=== animations.js ===" >> /tmp/codebase_review.txt
cat animations.js >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Advanced animations
echo "=== advanced-animations.js ===" >> /tmp/codebase_review.txt
cat advanced-animations.js >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Build script
echo "=== build.js ===" >> /tmp/codebase_review.txt
cat build.js >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Main styles
echo "=== styles.css ===" >> /tmp/codebase_review.txt
cat styles.css >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Animation styles
echo "=== animations.css ===" >> /tmp/codebase_review.txt
cat animations.css >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Development template
echo "=== index-dynamic.html ===" >> /tmp/codebase_review.txt
cat index-dynamic.html >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Project documentation
echo "=== CLAUDE.md ===" >> /tmp/codebase_review.txt
cat CLAUDE.md >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Package configuration
echo "=== package.json ===" >> /tmp/codebase_review.txt
cat package.json >> /tmp/codebase_review.txt
echo "" >> /tmp/codebase_review.txt

# Copy to clipboard
if command -v pbcopy >/dev/null 2>&1; then
    # macOS
    cat /tmp/codebase_review.txt | pbcopy
    echo "✅ Codebase files copied to clipboard (macOS)"
elif command -v xclip >/dev/null 2>&1; then
    # Linux
    cat /tmp/codebase_review.txt | xclip -selection clipboard
    echo "✅ Codebase files copied to clipboard (Linux)"
elif command -v clip >/dev/null 2>&1; then
    # Windows/WSL
    cat /tmp/codebase_review.txt | clip
    echo "✅ Codebase files copied to clipboard (Windows)"
else
    echo "⚠️  Clipboard tool not found. File saved to /tmp/codebase_review.txt"
    echo "📁 You can manually copy the contents of: /tmp/codebase_review.txt"
fi

echo ""
echo "📊 Files included in review package:"
echo "   • resume.json (data structure)"
echo "   • site-generator.js (core logic)"
echo "   • animations.js (timeline & animations)"
echo "   • advanced-animations.js (complex visualizations)"
echo "   • build.js (build & validation)"
echo "   • styles.css (main styles)"
echo "   • animations.css (animation styles)"
echo "   • index-dynamic.html (template)"
echo "   • CLAUDE.md (documentation)"
echo "   • package.json (dependencies)"
echo ""
echo "💡 These files contain the complete functionality of the Tufte personal site."