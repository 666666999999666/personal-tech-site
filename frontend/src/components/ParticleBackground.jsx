import { useMemo } from "react";
import { Particles, ParticlesProvider, useParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/**
 * 粒子背景内部组件
 * 必须在 ParticlesProvider 内部使用 useParticlesProvider
 */
function ParticlesContent() {
  const { loaded } = useParticlesProvider();

  const options = useMemo(
    () => ({
      fullScreen: {
        enable: true,
        zIndex: -1,
      },
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#aa3bff",
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#aa3bff",
          opacity: 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5,
            },
          },
          push: {
            particles_nb: 4,
          },
        },
      },
      retina_detect: true,
    }),
    []
  );

  if (!loaded) return null;

  return <Particles id="tsparticles" options={options} />;
}

/**
 * 粒子背景组件
 * 使用 tsparticles v4 实现全屏粒子效果
 * v4 使用 ParticlesProvider + useParticlesProvider 替代 initParticlesEngine
 */
export default function ParticleBackground() {
  return (
    <ParticlesProvider init={loadSlim}>
      <ParticlesContent />
    </ParticlesProvider>
  );
}
