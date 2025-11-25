const sphereContainer = document.getElementById("wireframeSphere");
const navLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll("main section[id]");
const ghostButton = document.querySelector(".btn.btn--ghost");

// Wireframe brain with nodes and connections - MOFFETT AI style
// Wrap in try-catch to prevent breaking the page
try {
  if (sphereContainer && typeof THREE !== "undefined") {
    const container = sphereContainer;
    const canvas = document.getElementById("sphereCanvas");
    
    if (!canvas) {
      console.error("Canvas element not found!");
    } else {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        alpha: false, // Opaque background for black
        antialias: true,
        powerPreference: "high-performance"
      });
      
      // Set clear color to black
      renderer.setClearColor(0x000000, 1);
      
      function resizeRenderer() {
        const rect = container.getBoundingClientRect();
        const baseSize = Math.min(rect.width, rect.height);
        const size = baseSize;
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.aspect = 1;
        camera.updateProjectionMatrix();
        camera.position.set(0, 0, 7);
        camera.lookAt(0, 0, 0);
        
        // Debug camera
        console.log('Camera position:', camera.position);
        console.log('Camera looking at:', camera.getWorldDirection(new THREE.Vector3()));
      }
      resizeRenderer();
      window.addEventListener("resize", resizeRenderer);
      
      // Subtle ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambientLight);
      
      // Warm orange-brown lights from bottom and sides
      const warmLight1 = new THREE.PointLight(0xff8c42, 0.8, 100);
      warmLight1.position.set(0, -3, 2);
      scene.add(warmLight1);
      
      const warmLight2 = new THREE.PointLight(0xff8c42, 0.6, 100);
      warmLight2.position.set(-3, 0, 2);
      scene.add(warmLight2);
      
      const warmLight3 = new THREE.PointLight(0xff8c42, 0.6, 100);
      warmLight3.position.set(3, 0, 2);
      scene.add(warmLight3);
      
      // Create wireframe brain with nodes and connections
      const brainGroup = new THREE.Group();
      
      try {
        // Create brain shape using icosahedron as base
        const baseGeometry = new THREE.IcosahedronGeometry(2, 3);
        const positions = baseGeometry.attributes.position;
        const posArray = positions.array;
        
        // Create nodes (dots) from vertices
        const nodes = [];
        const nodePositions = [];
        
        for (let i = 0; i < positions.count; i++) {
          let x = posArray[i * 3];
          let y = posArray[i * 3 + 1];
          let z = posArray[i * 3 + 2];
          
          // Normalize and create brain-like shape
          const radius = Math.sqrt(x * x + y * y + z * z);
          if (radius > 0) {
            x /= radius;
            y /= radius;
            z /= radius;
          }
          
          // Brain-like deformation
          const fold1 = Math.sin(y * 4) * 0.1;
          const fold2 = Math.cos(x * 3) * 0.08;
          const hemisphereFactor = x > 0 ? 1.02 : 0.98;
          const scale = 1 + fold1 + fold2;
          
          x = x * 2 * scale * hemisphereFactor;
          y = y * 2 * scale;
          z = z * 2 * scale;
          
          if (Math.abs(x) < 0.15) x *= 0.95;
          y *= 1.1;
          
          nodePositions.push(new THREE.Vector3(x, y, z));
        }
        
        // Create node spheres
        const nodeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const nodeMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9
        });
        
        nodePositions.forEach((pos, index) => {
          const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
          node.position.copy(pos);
          
          // Some nodes highlighted in orange
          if (Math.random() < 0.15) {
            node.material.color.setHex(0xff8c42);
            node.material.emissive = new THREE.Color(0xff8c42);
            node.material.emissiveIntensity = 0.5;
          }
          
          brainGroup.add(node);
          nodes.push({ mesh: node, position: pos });
        });
        
        // Create connections between nearby nodes
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.4
        });
        
        const maxDistance = 0.8;
        const connections = [];
        
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const distance = nodes[i].position.distanceTo(nodes[j].position);
            if (distance < maxDistance && Math.random() < 0.3) {
              const geometry = new THREE.BufferGeometry().setFromPoints([
                nodes[i].position,
                nodes[j].position
              ]);
              const line = new THREE.Line(geometry, lineMaterial);
              brainGroup.add(line);
              connections.push(line);
            }
          }
        }
        
        console.log('Nodes created:', nodes.length);
        console.log('Connections created:', connections.length);
        
      } catch (error) {
        console.error('Error creating brain:', error);
        // Fallback test
        const testGeometry = new THREE.SphereGeometry(1, 32, 32);
        const testMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const testSphere = new THREE.Mesh(testGeometry, testMaterial);
        brainGroup.add(testSphere);
      }
      
      scene.add(brainGroup);
        
        // Verify renderer is set up
        console.log('Renderer size:', renderer.getSize(new THREE.Vector2()));
        console.log('Canvas size:', canvas.width, canvas.height);
        
        // Initial render
        renderer.render(scene, camera);
        console.log('Initial render complete');
        
        // Very subtle rotation (almost static as requested)
        let rotationY = 0;
        
        function animate() {
          requestAnimationFrame(animate);
          
          // Extremely slow rotation (barely noticeable)
          rotationY += 0.0005;
          brainGroup.rotation.y = rotationY;
          
          renderer.render(scene, camera);
        }
        
        animate();
        console.log('Animation started');
      }
    } else {
      // Debug: Check if elements exist
      console.error('Brain visualization failed to initialize');
      console.log('Container:', sphereContainer);
      console.log('THREE:', typeof THREE);
      console.log('Canvas:', document.getElementById("sphereCanvas"));
    }
  } catch (brainError) {
    console.error('Error in brain visualization:', brainError);
    // Don't break the page if brain fails
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
  const fadeElements = document.querySelectorAll(".fade-in, .slide-in-left, .slide-in-right, .scale-in");
  fadeElements.forEach((el) => {
    revealObserver.observe(el);
    
    // If element is already in viewport, make it visible immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("visible");
    }
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
