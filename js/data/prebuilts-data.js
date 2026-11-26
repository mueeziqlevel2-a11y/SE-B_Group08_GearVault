/**
 * GAMEVAULT - Pre-Built Gaming Rigs Database
 * 4 Curated Gaming Systems with component lists, target resolutions, and PKR pricing.
 */

const GAMEVAULT_PREBUILTS = [
  {
    id: "prebuilt-vanguard-esports",
    name: "GAMEVAULT Vanguard Esports Rig",
    badge: "1080p Champion",
    tagline: "Designed for competitive players demanding 240+ FPS in CS2, Valorant & Apex.",
    price: 245000,
    originalPrice: 265000,
    discountPercentage: 8,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewCount: 29,
    tier: "budget",
    targetResolution: "1080p Ultra High-Refresh",
    fpsSummary: "Valorant: 380 FPS | Warzone: 135 FPS | Apex Legends: 190 FPS",
    specs: {
      cpu: "AMD Ryzen 5 7600X (6C/12T)",
      gpu: "MSI GeForce RTX 4060 Ventus 2X 8GB",
      motherboard: "Gigabyte B650 Eagle AX WiFi",
      ram: "Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000",
      storage: "Kingston KC3000 1TB PCIe 4.0 NVMe M.2",
      psu: "DeepCool PN650M 650W 80+ Gold Modular",
      cooler: "Thermalright Assassin Spirit 120 V2",
      case: "Montech AIR 903 MAX Black"
    },
    inStock: true
  },
  {
    id: "prebuilt-apex-phantom",
    name: "GAMEVAULT Apex Phantom 1440p Beast",
    badge: "Most Popular",
    tagline: "The gold standard for ultra-smooth 1440p max settings and high-detail ray-tracing.",
    price: 495000,
    originalPrice: 535000,
    discountPercentage: 7,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewCount: 46,
    tier: "mid-range",
    targetResolution: "1440p Max Settings",
    fpsSummary: "Cyberpunk 2077: 114 FPS | Black Myth Wukong: 98 FPS | COD: 220 FPS",
    specs: {
      cpu: "AMD Ryzen 7 7800X3D (World's Best Gaming CPU)",
      gpu: "Zotac Gaming GeForce RTX 4070 Super 12GB",
      motherboard: "ASUS ROG Strix B650-A Gaming WiFi",
      ram: "Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000",
      storage: "Samsung 990 PRO 2TB PCIe 4.0 NVMe",
      psu: "Corsair RM850x Shift 850W Gold Modular",
      cooler: "DeepCool LT720 360mm Infinity Mirror AIO",
      case: "Lian Li O11 Dynamic EVO RGB"
    },
    inStock: true
  },
  {
    id: "prebuilt-titan-overlord",
    name: "GAMEVAULT Titan Overlord 4K Supreme",
    badge: "Flagship Apex",
    tagline: "Uncompromising 4K full path tracing and enthusiast gaming powerhouse.",
    price: 1195000,
    originalPrice: 1280000,
    discountPercentage: 7,
    image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=80",
    rating: 5.0,
    reviewCount: 18,
    tier: "enthusiast",
    targetResolution: "4K Extreme Ray Tracing",
    fpsSummary: "Cyberpunk 4K: 82 FPS | Black Myth 4K: 68 FPS | MS Flight Sim: 95 FPS",
    specs: {
      cpu: "AMD Ryzen 7 7800X3D / Ryzen 9 7950X3D",
      gpu: "ASUS ROG Strix GeForce RTX 4090 24GB OC",
      motherboard: "ASUS ROG Crosshair X670E Hero",
      ram: "G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5-6400",
      storage: "Dual Samsung 990 PRO 2TB NVMe (4TB Total)",
      psu: "Seasonic Focus GX-1000 1000W 80+ Gold",
      cooler: "NZXT Kraken Elite 360 RGB LCD",
      case: "Lian Li O11 Dynamic EVO RGB (Custom CableMod)"
    },
    inStock: true
  },
  {
    id: "prebuilt-creator-pro",
    name: "GAMEVAULT Studio Creator Pro Workstation",
    badge: "Work & Play",
    tagline: "Engineered for 3D Blender artists, 4K/8K Premiere video editors, and game developers.",
    price: 435000,
    originalPrice: 470000,
    discountPercentage: 7,
    image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewCount: 22,
    tier: "mid-range",
    targetResolution: "Heavy 3D Render & 1440p Gaming",
    fpsSummary: "Blender Benchmark: 4800 Samples | Puget Premiere: 1250 Pts",
    specs: {
      cpu: "Intel Core i7-14700K (20 Cores / 28 Threads)",
      gpu: "Sapphire Pulse AMD Radeon RX 7800 XT 16GB",
      motherboard: "MSI MAG Z790 Tomahawk WiFi",
      ram: "Corsair Vengeance 64GB (2x32GB) DDR5-5600",
      storage: "Samsung 990 PRO 2TB + 4TB IronWolf HDD",
      psu: "Corsair RM850x Shift 850W Gold Modular",
      cooler: "DeepCool LT720 360mm Liquid Cooler",
      case: "Fractal Design North Chalk White Mesh"
    },
    inStock: true
  }
];

function getPrebuiltById(id) {
  return GAMEVAULT_PREBUILTS.find(p => p.id === id) || null;
}
