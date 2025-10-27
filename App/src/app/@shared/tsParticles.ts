
  id="tsparticles";

  particlesOptions = {
      background: {
        color: {
          value: ""
        },
        image: "",
        position: "",
        repeat: "",
        size: "",
        opacity: 1
      },
      backgroundMask: {
        cover: {
          color: {
            value: "#fff"
          },
          opacity: 1
        },
        enable: false
      },
      detectRetina: false,
      fpsLimit: 30,
      infection: {
        cure: false,
        delay: 0,
        enable: false,
        infections: 0,
        stages: []
      },
      interactivity: {
        detectsOn: "canvas",
        events: {
          onClick: {
            enable: false,
            mod: "push"
          },
          onDi: {
            ids: "repulse-div",
            enable: false,
            mode: "repulse",
            type: "circle"
          },
          onHover: {
            enable: true,
            mode: "bubble",
            parallax: {
              enable: false,
              force: 2,
              smooth: 10
            }
          },
          resize: true
        },
        modes: {
          attract: {
            distance: 200,
            duration: 0.4,
            speed: 1
          },
          bubble: {
            distance: 40,
            duration: 2,
            opacity: 8,
            size: 6
          },
          connect: {
            distance: 80,
            links: {
              opacity: 0.5
            },
            radius: 60
          },
          grab: {
            distance: 400,
            links: {
              opacity: 1
            }
          },
          push: {
            quantity: 4
          },
          remove: {
            quantity: 2
          },
          repulse: {
            distance: 200,
            duration: 0.4,
            speed: 1
          },
          slow: {
            factor: 1,
            radius: 0
          },
          trail: {
            delay: 1,
            quantity: 1
          }
        }
      },
      particles: {
        collisions: {
          enable: false,
          mode: "bounce"
        },
        color: {
          value: "#000000",
          animation: {
            enable: false,
            speed: 1,
            sync: true
          }
        },
        links: {
          blink: false,
          color: {
            value: "#000000"
          },
          consent: false,
          distance: 30,
          enable: true,
          opacity: 0.4,
          shadow: {
            blur: 5,
            color: {
              value: "#00ff00"
            },
            enable: false
          },
          triangles: {
            enable: false
          },
          width: 1,
          warp: false
        },
        move: {
          angle: 90,
          attract: {
            enable: false,
            rotate: {
              x: 600,
              y: 1200
            }
          },
          direction: "none",
          enable: true,
          noise: {
            delay: {
              random: {
                enable: false,
                minimumValue: 0
              },
              value: 0
            },
            enable: false
          },
          outMode: "bounce",
          random: false,
          speed: 1,
          straight: false,
          trail: {
            enable: false,
            length: 10,
            fillColor: {
              value: "#000000"
            }
          },
          vibrate: false,
          warp: false
        },
        number: {
          density: {
            enable: false,
            area: 2000,
            factor: 1000
          },
          limit: 0,
          value: 200
        },
        opacity: {
          animation: {
            enable: true,
            minimumValue: 0.05,
            speed: 2,
            sync: false
          },
          random: {
            enable: false,
            minimumValue: 1
          },
          value: 0.4
        },
        rotate: {
          animation: {
            enable: false,
            speed: 0,
            sync: false
          },
          direction: "clockwise",
          path: false,
          random: false,
          value: 0
        },
        shadow: {
          blur: 0,
          color: {
            value: "#000000"
          },
          enable: false,
          offset: {
            x: 0,
            y: 0
          }
        },
        shape: {
          options: {
            character: {
              fill: false,
              font: "Verdana",
              style: "",
              value: "*",
              weight: "400"
            },
            char: {
              fill: false,
              font: "Verdana",
              style: "",
              value: "*",
              weight: "400"
            },
            polygon: {
              sides: 5
            },
            star: {
              sides: 5
            },
            image: {
              height: 100,
              replaceColor: true,
              src: "https://cdn.matteobruni.it/images/particles/github.svg",
              width: 100
            },
            images: {
              height: 100,
              replaceColor: true,
              src: "https://cdn.matteobruni.it/images/particles/github.svg",
              width: 100
            }
          },
          type: "circle"
        },
        size: {
          animation: {
            destroy: "none",
            enable: false,
            minimumValue: 0.1,
            speed: 40,
            startValue: "max",
            sync: false
          },
          random: {
            enable: true,
            minimumValue: 1
          },
          value: 1
        },
        stroke: {
          width: 0,
          color: {
            value: "#000000",
            animation: {
              enable: false,
              speed: 1,
              sync: true
            }
          }
        },
        twinkle: {
          lines: {
            enable: false,
            frequency: 0.05,
            opacity: 1
          },
          particles: {
            enable: false,
            frequency: 0.05,
            opacity: 1
          }
        }
      },
      pauseOnBlur: true,
      polygon: {
        draw: {
          enable: true,
          stroke: {
            color: {
              value: "rgba(0,0,0,0.2)"
            },
            width: 0.5,
            opacity: 0.2
          }
        },
        enable: true,
        inline: {
          arrangement: "equidistant"
        },
        move: {
          radius: 10,
          type: "path"
        },
        scale: 0.5,
        type: "inline",
        url: "https://cdn.matteobruni.it/images/particles/smalldeer.svg"
      }
    };