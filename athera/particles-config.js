/* ============================================
   ATHERA — Particle System Configuration
   Neural Network Style
   ============================================ */

async function initParticles(containerId) {
  if (typeof tsParticles === 'undefined') {
    console.warn('tsParticles not loaded');
    return;
  }

  await tsParticles.load(containerId, {
    fullScreen: { enable: false },
    fpsLimit: 60,
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          area: 900
        }
      },
      color: {
        value: ["#B76E79", "#D4A5A5", "#8B4A52"]
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: { min: 0.2, max: 0.6 },
        animation: {
          enable: true,
          speed: 0.8,
          minimumValue: 0.1,
          sync: false
        }
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 0.5,
          sync: false
        }
      },
      links: {
        enable: true,
        distance: 150,
        color: "#B76E79",
        opacity: 0.15,
        width: 1,
        triangles: {
          enable: true,
          opacity: 0.03
        }
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        random: true,
        straight: false,
        outModes: {
          default: "bounce"
        },
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detectsOn: "canvas",
      events: {
        onHover: {
          enable: true,
          mode: ["grab", "bubble"]
        },
        onClick: {
          enable: true,
          mode: "push"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 200,
          links: {
            opacity: 0.4,
            color: "#D4A5A5"
          }
        },
        bubble: {
          distance: 200,
          size: 6,
          duration: 2,
          opacity: 0.8
        },
        push: {
          quantity: 3
        }
      }
    },
    detectRetina: true,
    background: {
      color: "transparent"
    }
  });
}

// Auto-init on all elements with class "hero-particles"
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.hero-particles');
  containers.forEach(container => {
    if (container.id) {
      initParticles(container.id);
    }
  });
});
