/**
 * LaunchPad OS — Advanced Visual & Cosmetic Effects
 * Purely presentational script to add premium micro-interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursorSpotlight();
  initWidgetEffects();
});

/**
 * Global mouse-position variables for CSS gradients
 */
function initCursorSpotlight() {
  const container = document.querySelector('.aurora-container');

  document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    document.documentElement.style.setProperty('--mouse-x', `${x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${y}px`);

    // Subtle 3D parallax offset for the background aurora blobs layer
    if (container) {
      const dx = (x - window.innerWidth / 2) * 0.025;
      const dy = (y - window.innerHeight / 2) * 0.025;
      container.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    }
  });
}

/**
 * 3D Tilt, Card Spotlight, and Indexing for Widgets
 */
function initWidgetEffects() {
  const widgets = document.querySelectorAll('.widget');

  widgets.forEach((widget, index) => {
    // 1. Fallback / reinforcement for animation stagger index
    if (!widget.style.getPropertyValue('--widget-index')) {
      widget.style.setProperty('--widget-index', index + 1);
    }

    // 2. Local mouse tracker inside each widget card for spotlights
    widget.addEventListener('mousemove', (e) => {
      const rect = widget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      widget.style.setProperty('--card-mouse-x', `${x}px`);
      widget.style.setProperty('--card-mouse-y', `${y}px`);

      // 3. 3D Card Tilt effect
      const width = rect.width;
      const height = rect.height;
      const centerX = rect.left + width / 2;
      const centerY = rect.top + height / 2;
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;

      // Limit rotation to 6 degrees maximum for subtle look
      const maxTilt = 6;
      const rotateX = (-offsetY / (height / 2)) * maxTilt;
      const rotateY = (offsetX / (width / 2)) * maxTilt;

      // Apply the rotation and a slight lift (translateY)
      widget.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    });

    // 4. Reset on mouse leave with smooth transition
    widget.addEventListener('mouseleave', () => {
      widget.style.transform = '';
      widget.style.setProperty('--card-mouse-x', `-999px`);
      widget.style.setProperty('--card-mouse-y', `-999px`);
    });
  });
}
