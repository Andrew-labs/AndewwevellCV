const sphereContainer = document.getElementById("wireframeSphere");
const navLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll("main section[id]");
const ghostButton = document.querySelector(".btn.btn--ghost");

// Interactive wireframe sphere with dynamic scaling
if (sphereContainer && typeof THREE !== "undefined") {
  const container = sphereContainer;
  const canvas = document.getElementById("sphereCanvas");
  
  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    alpha: true,
    antialias: true 
  });
  
  function resizeRenderer() {
    const rect = container.getBoundingClientRect();
    const baseSize = Math.min(rect.width, rect.height);
    // Renderer size matches container - we'll handle scaling via camera
    const size = baseSize;
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    // Adjust camera to ensure sphere fits even at max scale
    camera.position.z = 6;
  }
  resizeRenderer();
  window.addEventListener("resize", resizeRenderer);
  
  // Create wireframe sphere with nested spheres
  const spheres = [];
  const sphereCount = 3;
  const baseRadius = 1.9; // Slightly larger radius for bigger visual
  
  for (let i = 0; i < sphereCount; i++) {
    const radius = baseRadius * (1 - i * 0.3);
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x444ef0,
      wireframe: true,
      transparent: true,
      opacity: 0.6 - i * 0.15
    });
    const sphere = new THREE.Mesh(geometry, material);
    spheres.push({ mesh: sphere, baseRadius: radius, index: i });
    scene.add(sphere);
  }
  
  camera.position.z = 6.5; // Moved camera back slightly to keep full view
  
  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let isMouseDown = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  
  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX = (e.clientX - centerX) / (rect.width / 2);
    mouseY = (e.clientY - centerY) / (rect.height / 2);
    
    if (isMouseDown) {
      targetRotationY += (e.clientX - lastMouseX) * 0.01;
      targetRotationX += (e.clientY - lastMouseY) * 0.01;
    } else {
      targetRotationY = mouseX * 0.5;
      targetRotationX = -mouseY * 0.5;
    }
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });
  
  container.addEventListener("mousedown", () => {
    isMouseDown = true;
  });
  
  container.addEventListener("mouseup", () => {
    isMouseDown = false;
  });
  
  container.addEventListener("mouseleave", () => {
    isMouseDown = false;
  });
  
  // Animation variables
  let time = 0;
  let scaleDirection = 1;
  let currentScale = 1;
  const minScale = 0.75; // Prevent clipping while keeping size
  const maxScale = 1.35; // Allow a bit more growth for presence
  const scaleSpeed = 0.002;
  
  // Color interpolation function
  function interpolateColor(color1, color2, t) {
    const r1 = (color1 >> 16) & 255;
    const g1 = (color1 >> 8) & 255;
    const b1 = color1 & 255;
    const r2 = (color2 >> 16) & 255;
    const g2 = (color2 >> 8) & 255;
    const b2 = color2 & 255;
    
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    
    return (r << 16) | (g << 8) | b;
  }
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    
    // Dynamic scaling - pulse from big to small
    currentScale += scaleDirection * scaleSpeed;
    if (currentScale >= maxScale) {
      currentScale = maxScale;
      scaleDirection = -1;
    } else if (currentScale <= minScale) {
      currentScale = minScale;
      scaleDirection = 1;
    }
    
    // Calculate normalized scale (0 to 1) for color interpolation
    const normalizedScale = (currentScale - minScale) / (maxScale - minScale);
    
    // Color transition: blue (big) to purple (small)
    // When scale is max (1.4), normalizedScale = 1, so we want blue
    // When scale is min (0.6), normalizedScale = 0, so we want purple
    const colorBig = 0x444ef0; // Blue - when big
    const colorSmall = 0x8b5cf6; // Purple - when small
    // Reverse the interpolation: when normalizedScale is 1 (big), use colorBig
    // when normalizedScale is 0 (small), use colorSmall
    const currentColor = interpolateColor(colorBig, colorSmall, 1 - normalizedScale);
    
    // Smooth rotation following mouse
    let currentRotationX = spheres[0].mesh.rotation.x;
    let currentRotationY = spheres[0].mesh.rotation.y;
    
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;
    
    // Apply transformations to all spheres
    spheres.forEach((sphereObj, index) => {
      const sphere = sphereObj.mesh;
      const delay = index * 0.1;
      const scale = currentScale * (1 - index * 0.1);
      
      // Update color based on scale - use THREE.Color for proper color updates
      const color = new THREE.Color(currentColor);
      sphere.material.color.copy(color);
      sphere.material.needsUpdate = true;
      
      sphere.scale.set(scale, scale, scale);
      sphere.rotation.x = currentRotationX + time * 0.2 + delay;
      sphere.rotation.y = currentRotationY + time * 0.3 + delay;
      sphere.rotation.z = time * 0.1 + delay;
    });
    
    renderer.render(scene, camera);
  }
  
  animate();
}

// Smooth scroll for ghost button
if (ghostButton) {
  ghostButton.addEventListener("click", () => {
    document.getElementById("apps")?.scrollIntoView({ behavior: "smooth" });
  });
}

// Enhanced intersection observer with stagger animations
if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.toggle("is-active", link.hash === `#${entry.target.id}`));
        }
      });
    },
    {
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => navObserver.observe(section));

  // Scroll reveal animations
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, index * 100);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }
  );

  // Observe all fade-in elements
  document.querySelectorAll(".fade-in, .slide-in-left, .slide-in-right, .scale-in").forEach((el) => {
    revealObserver.observe(el);
  });

  // Observe experience cards with stagger
  const experienceCards = document.querySelectorAll(".experience-card");
  experienceCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
    revealObserver.observe(card);
  });
}

// Subtle parallax effect for hero section (no opacity fade)
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector(".hero");
  if (hero) {
    const heroContent = hero.querySelector(".hero__copy");
    const heroVisual = hero.querySelector(".hero__visual");
    // Only apply subtle parallax, keep content fully visible
    if (heroContent && scrolled < window.innerHeight * 1.5) {
      heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
      heroContent.style.opacity = 1;
    }
    if (heroVisual && scrolled < window.innerHeight * 1.5) {
      heroVisual.style.transform = `translateY(${scrolled * 0.05}px)`;
    }
  }
  lastScroll = scrolled;
});

// Add ripple effect to buttons
document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.classList.add("ripple");

    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// Add dynamic cursor effect
const cursor = document.createElement("div");
cursor.className = "custom-cursor";
document.body.appendChild(cursor);

let cursorX = 0;
let cursorY = 0;
let cursorCurrentX = 0;
let cursorCurrentY = 0;

document.addEventListener("mousemove", (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
});

function animateCursor() {
  cursorCurrentX += (cursorX - cursorCurrentX) * 0.1;
  cursorCurrentY += (cursorY - cursorCurrentY) * 0.1;
  cursor.style.left = cursorCurrentX + "px";
  cursor.style.top = cursorCurrentY + "px";
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Add hover effect to interactive elements
document.querySelectorAll("a, button, .feature-card, .experience-card").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.style.transform = "scale(1.5)";
    cursor.style.background = "rgba(68, 78, 240, 0.2)";
  });
  el.addEventListener("mouseleave", () => {
    cursor.style.transform = "scale(1)";
    cursor.style.background = "rgba(68, 78, 240, 0.1)";
  });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});
