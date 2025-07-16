import { useEffect } from "hono/jsx";
import configs from "@tsparticles/configs";
import { animate, type ISourceOptions } from "@tsparticles/engine";

export default function SnowContainer() {
  useEffect(() => {
    console.log(window, document)
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const config:ISourceOptions = {
      particles: {
        number: {
          value: 150,
          density: {
            enable: true,
          }
        },
        color: {
            value: "#F4F4F4",
        },
        shape: {
            type: "circle",
            options: {
            }
        },
        opacity: {
          value: { min: 0.3, max: 0.8 },  // 透明度もランダムに
          //random: false,
          animation: {
            enable: false,
            speed: 1,
            destroy: "min",
            //opacityMin: 0.1,
            sync: false
          }
        },
        size: {
          value: { min: 1, max: 6 },
          //random: true,
          animation: {
            enable: false,
            speed: 20,
            //size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: false
        },
        move: {
          enable: true,
          speed: 5,
          direction: "bottom",
          random: true,
          straight: false,
          outModes: "out",
          // bounce: false,
          attract: {
            enable: false,
            rotate: {
              x: 300,
              y: 1200,
            },
          }
        },
        
        zIndex: {
            value: {
                min: 0,
                max: 1,
            },
            opacityRate: 10,
            sizeRate: 10,
            velocityRate: 10,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onHover: {
            enable: false
          },
          onClick: {
            enable: false
          },
          resize: {
            enable: true
          }
        }
      },
      retina_detect: true
    }
    const keys = Object.keys(configs),
    randomKey = keys[Math.floor(Math.random() * keys.length)] as keyof typeof configs,
    options = configs["snow"];

    const initParticles = async () => {
      try {
        const { tsParticles } = await import("@tsparticles/engine");
        const { loadAll } = await import("@tsparticles/all");

        await loadAll(tsParticles);

        await tsParticles.load({
          id: "tsparticles",
          options: config
        });
      } catch (error) {
        console.error('Failed to load particles:', error);
      }
    };

    initParticles();
  }, []);

  return (
    <div>
      <div id="tsparticles" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>
    </div>
  );
}
