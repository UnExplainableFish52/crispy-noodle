/**
 * Snake-like Cursor Trail Effect
 * Inspired by slither.io
 */

class CursorTrailEffect {
  constructor(config = {}) {
    // Default configuration
    this.config = {
      maxSegments: config.maxSegments || 20,
      maxSegmentSize: config.maxSegmentSize || 15, 
      minSegmentSize: config.minSegmentSize || 5,
      speedFactor: config.speedFactor || 0.3,
      rainbow: config.rainbow !== undefined ? config.rainbow : true,
      baseHue: config.baseHue || 0,
      hueRange: config.hueRange || 360,
      opacity: config.opacity || 0.7
    };

    // Initialize trail segments
    this.trail = [];
    this.initTrail();

    // Mouse position
    this.mouseX = 0;
    this.mouseY = 0;
    
    // Animation variables
    this.animationFrameId = null;
    this.lastTimestamp = 0;
    this.ready = false;
  }

  init() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('cursor-trail-canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);

    // Get canvas context
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Set up event listeners
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('touchmove', this.handleTouchMove);
    
    this.ready = true;
    this.animate();
  }

  initTrail() {
    this.trail = [];
    for (let i = 0; i < this.config.maxSegments; i++) {
      const ratio = i / this.config.maxSegments;
      const size = this.config.maxSegmentSize - ratio * (this.config.maxSegmentSize - this.config.minSegmentSize);
      
      this.trail.push({
        x: 0,
        y: 0,
        size,
        color: this.getSegmentColor(i)
      });
    }
  }

  resizeCanvas = () => {
    if (!this.canvas) return;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  handleMouseMove = (event) => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  };

  handleTouchMove = (event) => {
    if (event.touches.length > 0) {
      this.mouseX = event.touches[0].clientX;
      this.mouseY = event.touches[0].clientY;
    }
  };

  getSegmentColor(index) {
    if (this.config.rainbow) {
      const hue = (this.config.baseHue + (index * (this.config.hueRange / this.config.maxSegments))) % 360;
      return `hsla(${hue}, 100%, 60%, ${this.config.opacity})`;
    } else {
      return `hsla(${this.config.baseHue}, 100%, 60%, ${this.config.opacity})`;
    }
  }

  updateTrailColors() {
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i].color = this.getSegmentColor(i);
    }
  }

  animate = (timestamp = 0) => {
    if (!this.ready || !this.canvas || !this.ctx) {
      this.animationFrameId = null;
      return;
    }
    
    // Calculate delta time for smooth animation regardless of frame rate
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update trail positions with easing
    const speedFactor = this.config.speedFactor * (deltaTime / 16); // Normalized for 60fps
    
    this.trail.forEach((segment, index) => {
      if (index === 0) {
        // First segment follows the mouse with easing
        segment.x += (this.mouseX - segment.x) * speedFactor;
        segment.y += (this.mouseY - segment.y) * speedFactor;
      } else {
        // Other segments follow the segment in front of them
        segment.x += (this.trail[index - 1].x - segment.x) * speedFactor;
        segment.y += (this.trail[index - 1].y - segment.y) * speedFactor;
      }
      
      // Update segment color if using rainbow effect
      if (this.config.rainbow) {
        this.updateTrailColors();
      }
      
      // Draw the segment
      this.ctx.beginPath();
      this.ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
      this.ctx.fillStyle = segment.color;
      this.ctx.fill();
    });
    
    // Continue the animation loop
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  cleanup() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    window.removeEventListener('resize', this.resizeCanvas);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchmove', this.handleTouchMove);
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    this.ready = false;
  }
}

// Initialize cursor trail when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const cursorTrail = new CursorTrailEffect({
    maxSegments: 25,      // Number of segments in the trail
    maxSegmentSize: 12,   // Size of the first segment
    minSegmentSize: 4,    // Size of the last segment
    speedFactor: 0.25,    // How quickly the trail follows the cursor (lower = smoother but slower)
    rainbow: true,        // Enable rainbow effect
    baseHue: 180,         // Starting color (cyan) if rainbow is false
    hueRange: 360,        // Color range for rainbow effect
    opacity: 0.8          // Transparency of the trail
  });
  
  cursorTrail.init();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', function() {
    cursorTrail.cleanup();
  });
});