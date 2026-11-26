/**
 * GAMEVAULT - Benchmark Guide Data
 * Realistic test bench performance data across major gaming titles & resolutions.
 */

const GAMEVAULT_BENCHMARKS = {
  games: [
    {
      id: "cyberpunk-2077",
      title: "Cyberpunk 2077: Phantom Liberty",
      genre: "RPG / Open World",
      engine: "REDengine 4 (Ray Tracing Ultra)",
      testedSettings: "Ray Tracing: Ultra, DLSS/FSR: Quality",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80",
      scores: {
        "1080p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 168, cpu: "Ryzen 7 7800X3D", tier: "Ultimate" },
          { gpu: "Zotac RTX 4070 Super", fps: 114, cpu: "i7-14700K", tier: "High" },
          { gpu: "Sapphire RX 7800 XT", fps: 96, cpu: "Ryzen 5 7600X", tier: "Smooth" },
          { gpu: "MSI RTX 4060 Ventus", fps: 62, cpu: "i5-13600K", tier: "Playable" }
        ],
        "1440p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 135, cpu: "Ryzen 7 7800X3D", tier: "Ultimate" },
          { gpu: "Zotac RTX 4070 Super", fps: 88, cpu: "i7-14700K", tier: "Smooth" },
          { gpu: "Sapphire RX 7800 XT", fps: 74, cpu: "Ryzen 5 7600X", tier: "Smooth" },
          { gpu: "MSI RTX 4060 Ventus", fps: 45, cpu: "i5-13600K", tier: "Playable" }
        ],
        "4k": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 82, cpu: "Ryzen 7 7800X3D", tier: "Smooth" },
          { gpu: "Zotac RTX 4070 Super", fps: 52, cpu: "i7-14700K", tier: "Playable" },
          { gpu: "Sapphire RX 7800 XT", fps: 42, cpu: "Ryzen 5 7600X", tier: "Entry" },
          { gpu: "MSI RTX 4060 Ventus", fps: 26, cpu: "i5-13600K", tier: "Unplayable" }
        ]
      }
    },
    {
      id: "cod-warzone",
      title: "Call of Duty: Warzone 3.0",
      genre: "Competitive Battle Royale",
      engine: "IW 9.0",
      testedSettings: "Competitive High / Textures Normal",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80",
      scores: {
        "1080p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 285, cpu: "Ryzen 7 7800X3D", tier: "Ultimate" },
          { gpu: "Zotac RTX 4070 Super", fps: 220, cpu: "i7-14700K", tier: "Ultimate" },
          { gpu: "Sapphire RX 7800 XT", fps: 205, cpu: "Ryzen 5 7600X", tier: "Ultimate" },
          { gpu: "MSI RTX 4060 Ventus", fps: 135, cpu: "i5-13600K", tier: "High" }
        ],
        "1440p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 235, cpu: "Ryzen 7 7800X3D", tier: "Ultimate" },
          { gpu: "Zotac RTX 4070 Super", fps: 165, cpu: "i7-14700K", tier: "High" },
          { gpu: "Sapphire RX 7800 XT", fps: 155, cpu: "Ryzen 5 7600X", tier: "High" },
          { gpu: "MSI RTX 4060 Ventus", fps: 98, cpu: "i5-13600K", tier: "Smooth" }
        ],
        "4k": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 145, cpu: "Ryzen 7 7800X3D", tier: "High" },
          { gpu: "Zotac RTX 4070 Super", fps: 98, cpu: "i7-14700K", tier: "Smooth" },
          { gpu: "Sapphire RX 7800 XT", fps: 90, cpu: "Ryzen 5 7600X", tier: "Smooth" },
          { gpu: "MSI RTX 4060 Ventus", fps: 54, cpu: "i5-13600K", tier: "Playable" }
        ]
      }
    },
    {
      id: "black-myth-wukong",
      title: "Black Myth: Wukong",
      genre: "Action RPG",
      engine: "Unreal Engine 5.4 (Lumen & Nanite)",
      testedSettings: "Cinematic Quality, TSR 75%",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80",
      scores: {
        "1080p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 142, cpu: "Ryzen 7 7800X3D", tier: "Ultimate" },
          { gpu: "Zotac RTX 4070 Super", fps: 98, cpu: "i7-14700K", tier: "Smooth" },
          { gpu: "Sapphire RX 7800 XT", fps: 86, cpu: "Ryzen 5 7600X", tier: "Smooth" },
          { gpu: "MSI RTX 4060 Ventus", fps: 58, cpu: "i5-13600K", tier: "Playable" }
        ],
        "1440p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 110, cpu: "Ryzen 7 7800X3D", tier: "High" },
          { gpu: "Zotac RTX 4070 Super", fps: 74, cpu: "i7-14700K", tier: "Smooth" },
          { gpu: "Sapphire RX 7800 XT", fps: 64, cpu: "Ryzen 5 7600X", tier: "Smooth" },
          { gpu: "MSI RTX 4060 Ventus", fps: 40, cpu: "i5-13600K", tier: "Playable" }
        ],
        "4k": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 68, cpu: "Ryzen 7 7800X3D", tier: "Smooth" },
          { gpu: "Zotac RTX 4070 Super", fps: 44, cpu: "i7-14700K", tier: "Playable" },
          { gpu: "Sapphire RX 7800 XT", fps: 36, cpu: "Ryzen 5 7600X", tier: "Entry" },
          { gpu: "MSI RTX 4060 Ventus", fps: 20, cpu: "i5-13600K", tier: "Unplayable" }
        ]
      }
    },
    {
      id: "valorant",
      title: "Valorant",
      genre: "Tactical FPS Esports",
      engine: "Unreal Engine 4",
      testedSettings: "All High / MSAA 4x",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80",
      scores: {
        "1080p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 650, cpu: "Ryzen 7 7800X3D", tier: "Esports Peak" },
          { gpu: "Zotac RTX 4070 Super", fps: 540, cpu: "i7-14700K", tier: "Esports Peak" },
          { gpu: "Sapphire RX 7800 XT", fps: 490, cpu: "Ryzen 5 7600X", tier: "Esports Peak" },
          { gpu: "MSI RTX 4060 Ventus", fps: 380, cpu: "i5-13600K", tier: "Esports Peak" }
        ],
        "1440p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 580, cpu: "Ryzen 7 7800X3D", tier: "Esports Peak" },
          { gpu: "Zotac RTX 4070 Super", fps: 460, cpu: "i7-14700K", tier: "Esports Peak" },
          { gpu: "Sapphire RX 7800 XT", fps: 420, cpu: "Ryzen 5 7600X", tier: "Esports Peak" },
          { gpu: "MSI RTX 4060 Ventus", fps: 320, cpu: "i5-13600K", tier: "Esports Peak" }
        ],
        "4k": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 420, cpu: "Ryzen 7 7800X3D", tier: "Esports Peak" },
          { gpu: "Zotac RTX 4070 Super", fps: 310, cpu: "i7-14700K", tier: "Esports Peak" },
          { gpu: "Sapphire RX 7800 XT", fps: 280, cpu: "Ryzen 5 7600X", tier: "Esports Peak" },
          { gpu: "MSI RTX 4060 Ventus", fps: 210, cpu: "i5-13600K", tier: "High" }
        ]
      }
    },
    {
      id: "gta-v",
      title: "Grand Theft Auto V",
      genre: "Open World Action",
      engine: "RAGE (Very High / Ultra)",
      testedSettings: "Very High / Ultra Textures, FXAA + MSAA 4x",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80",
      scores: {
        "1080p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 245, cpu: "Ryzen 7 7800X3D", tier: "Ultimate" },
          { gpu: "Zotac RTX 4070 Super", fps: 215, cpu: "i7-14700K", tier: "Ultimate" },
          { gpu: "Sapphire RX 7800 XT", fps: 195, cpu: "Ryzen 5 7600X", tier: "Ultimate" },
          { gpu: "MSI RTX 4060 Ventus", fps: 165, cpu: "i5-13600K", tier: "High" }
        ],
        "1440p": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 210, cpu: "Ryzen 7 7800X3D", tier: "Ultimate" },
          { gpu: "Zotac RTX 4070 Super", fps: 180, cpu: "i7-14700K", tier: "Ultimate" },
          { gpu: "Sapphire RX 7800 XT", fps: 165, cpu: "Ryzen 5 7600X", tier: "High" },
          { gpu: "MSI RTX 4060 Ventus", fps: 125, cpu: "i5-13600K", tier: "High" }
        ],
        "4k": [
          { gpu: "ASUS ROG Strix RTX 4090", fps: 160, cpu: "Ryzen 7 7800X3D", tier: "Ultimate" },
          { gpu: "Zotac RTX 4070 Super", fps: 110, cpu: "i7-14700K", tier: "High" },
          { gpu: "Sapphire RX 7800 XT", fps: 95, cpu: "Ryzen 5 7600X", tier: "Smooth" },
          { gpu: "MSI RTX 4060 Ventus", fps: 68, cpu: "i5-13600K", tier: "Playable" }
        ]
      }
    }
  ]
};
