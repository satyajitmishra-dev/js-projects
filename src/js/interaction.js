// =========================================
// INTERACTION IMPROVEMENTS SCRIPT
// =========================================

document.addEventListener("DOMContentLoaded", function() {
    // ----- LOADING ANIMATION -----
    const loader = document.querySelector(".loader-container");
    
    // Hide loader after content is loaded
    window.addEventListener("load", function() {
      setTimeout(function() {
        loader.classList.add("loader-hidden");
      }, 800); // Small delay for smoother appearance
    });
  
    // ----- SCROLL REVEAL ANIMATIONS -----
    // Function to check if element is in viewport
    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.bottom >= 0
      );
    }
  
    // Function to handle scroll animations
    function handleScrollAnimations() {
      const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
      
      elements.forEach(element => {
        if (isInViewport(element)) {
          element.classList.add("active");
        }
      });
    }
  
    // Run once on page load to animate elements already in viewport
    handleScrollAnimations();
  
    // Add scroll event listener
    window.addEventListener("scroll", handleScrollAnimations);
  
    // ----- BACK TO TOP BUTTON -----
    const backToTopButton = document.querySelector(".back-to-top");
    
    // Function to toggle back to top button visibility
    function toggleBackToTopButton() {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add("visible");
      } else {
        backToTopButton.classList.remove("visible");
      }
    }
  
    // Add scroll event listener for back to top button
    window.addEventListener("scroll", toggleBackToTopButton);
  
    // Scroll to top when button is clicked
    backToTopButton.addEventListener("click", function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  
    // ----- PROJECT CARDS HOVER EFFECT -----
    // Enhanced hover effects for project cards
    const projectCards = document.querySelectorAll(".project-card");
    
    projectCards.forEach(card => {
      card.addEventListener("mouseenter", function() {
        this.style.transform = "translateY(-8px)";
        this.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.15)";
        this.style.borderColor = "rgba(58, 134, 255, 0.3)";
        
        // Find and transform the image
        const img = this.querySelector(".project-img img");
        if (img) {
          img.style.transform = "scale(1.05)";
        }
      });
      
      card.addEventListener("mouseleave", function() {
        this.style.transform = "";
        this.style.boxShadow = "";
        this.style.borderColor = "";
        
        // Reset image transform
        const img = this.querySelector(".project-img img");
        if (img) {
          img.style.transform = "";
        }
      });
    });
  
    // ----- SMOOTH SCROLLING FOR ALL ANCHOR LINKS -----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === "#") return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  });