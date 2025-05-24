# Tufte-Inspired Personal Site Generator

A beautiful, configurable personal landing page inspired by Edward Tufte's design principles. Features sophisticated animations and data visualizations, all driven by a single `resume.json` file.

## Features

- **Data-Driven**: Entire site generated from `resume.json`
- **Tufte Design**: Clean typography, sidenotes, and thoughtful whitespace
- **Rich Animations**: 
  - Sparkline career timeline
  - Animated metrics
  - Force-directed network graphs
  - Project deep-dives with charts
  - Reading progress tracking
  - And much more!

## Quick Start

1. Edit `resume.json` with your information
2. Open `index-dynamic.html` in a browser
3. Deploy to GitHub Pages

## Configuration

### Basic Information
```json
{
  "basics": {
    "name": "Your Name",
    "label": "Your tagline",
    "email": "your.email@example.com",
    "url": "https://yoursite.com",
    "summary": "Your professional summary...",
    "location": {
      "city": "San Francisco Bay Area",
      "countryCode": "US",
      "region": "California"
    }
  }
}
```

### Work Experience
Each work entry can include metrics that will be animated:
```json
{
  "work": [{
    "name": "Company Name",
    "position": "Your Role",
    "startDate": "2020-01",
    "summary": "What you did there...",
    "highlights": ["Achievement 1", "Achievement 2"],
    "metrics": {
      "teamSize": { "value": 15, "label": "Team Size" },
      "improvement": { "value": 40, "unit": "%", "label": "Performance Gain" }
    },
    "technologies": ["React", "Node.js", "PostgreSQL"]
  }]
}
```

### Animation Settings
Control which animations are enabled:
```json
{
  "meta": {
    "animations": {
      "sparklineTimeline": true,
      "impactMetrics": true,
      "networkGraph": true,
      "marginNotes": true,
      "readingProgress": true,
      "projectDeepDives": true,
      "skillConstellation": true,
      "careerMap": true,
      "dataInkReveals": true,
      "breathingWhitespace": true,
      "tufteAnnotations": true
    }
  }
}
```

### Career Timeline
Define points for the animated timeline:
```json
{
  "meta": {
    "careerTimeline": [
      { 
        "year": 2020, 
        "label": "Started Company", 
        "value": 75, 
        "type": "founder" 
      }
    ]
  }
}
```

### Career Map Locations
Show your geographic journey:
```json
{
  "meta": {
    "locations": [
      { 
        "name": "San Francisco", 
        "x": 10, 
        "y": 25, 
        "projects": ["Project 1", "Project 2"] 
      }
    ]
  }
}
```

## Customization

### Colors
Edit the color scheme in `styles.css`:
```css
:root {
  --primary-color: #e74c3c;
  --background: #fffff8;
  --text-color: #111;
}
```

### Fonts
The site uses ET Book by default. To change fonts, edit the `@font-face` declaration in `styles.css`.

### Layout
Adjust the main content width:
```css
article > * {
    width: 55%; /* Tufte's recommended width */
}
```

### Career Map
The interactive career map is fully data-driven from `resume.json`. To update:

1. Edit `meta.locations` array in `resume.json`
2. Each location needs:
   ```json
   {
     "name": "City Name",
     "lon": -122.4194,  // longitude
     "lat": 37.7749,    // latitude
     "projects": [
       {
         "title": "Project Name",
         "year": "2025",
         "role": "Your Role",
         "description": "Brief description"
       }
     ]
   }
   ```
3. Locations are numbered automatically (1, 2, 3...) based on array order
4. Run `node build.js` to rebuild the site

## Deployment

### GitHub Pages
1. Create a repository named `[username].github.io`
2. Push all files to the main branch
3. Rename `index-dynamic.html` to `index.html`
4. Your site will be live at `https://[username].github.io`

### Custom Domain
1. Add a `CNAME` file with your domain
2. Configure DNS settings with your provider

## Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (responsive design)

## Performance Tips
- Optimize images before adding them
- Minimize the number of work entries shown initially
- Consider lazy-loading for deep-dive content

## License
MIT License - feel free to use this for your own site!

## Credits
- Typography inspired by [Edward Tufte](https://www.edwardtufte.com/)
- ET Book font from [tufte-css](https://github.com/edwardtufte/et-book)

## Troubleshooting

### Animations not working?
- Check browser console for errors
- Ensure `resume.json` is valid JSON
- Verify all script files are loaded

### Fonts not loading?
- Check network tab for 404 errors
- Consider hosting fonts locally

### Performance issues?
- Reduce number of animated elements
- Disable some animations in `meta.animations`
- Use Chrome DevTools Performance tab to identify bottlenecks