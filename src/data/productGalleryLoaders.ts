type GalleryModule = {
  default: string;
};

const loadImage = (loader: () => Promise<GalleryModule>) => loader().then((module) => module.default);

const galleryLoaders: Record<number, () => Promise<string[]>> = {
  1000: () => Promise.all([
    loadImage(() => import('../assets/MP-1.90/hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-1.90/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-1.90/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-1.90/4.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  1001: () => Promise.all([
    loadImage(() => import('../assets/MP-2.60/hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-2.60/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-2.60/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-2.60/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-2.60/4.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  1002: () => Promise.all([
    loadImage(() => import('../assets/MP-3.90/hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-3.90/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-3.90/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-3.90/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-3.90/4.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  1003: () => Promise.all([
    loadImage(() => import('../assets/MP-4.100/hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-4.100/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-4.100/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/MP-4.100/4.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  1004: () => Promise.all([
    loadImage(() => import('../assets/DH-1.30/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/DH-1.30/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/DH-1.30/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/DH-1.30/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  1005: () => Promise.all([
    loadImage(() => import('../assets/DE-1.30/hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/DE-1.30/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/DE-1.30/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/DE-1.30/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  1006: () => Promise.all([
    loadImage(() => import('../assets/BOPROB_III/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/BOPROB_III/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/BOPROB_III/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/BOPROB_III/4.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  2000: () => Promise.all([
    loadImage(() => import('../assets/Frames/Laydown/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Laydown/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Laydown/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Laydown/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  2001: () => Promise.all([
    loadImage(() => import('../assets/Frames/Three-point/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Three-point/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Three-point/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Three-point/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Three-point/4.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  2003: () => Promise.all([
    loadImage(() => import('../assets/Frames/Full-Conversion/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Full-Conversion/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Full-Conversion/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Frames/Full-Conversion/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  2004: () => Promise.all([
    loadImage(() => import('../assets/Trailers/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Trailers/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Trailers/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Trailers/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  3000: () => Promise.all([
    loadImage(() => import('../assets/Powerpacks/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Powerpacks/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Powerpacks/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Powerpacks/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Powerpacks/4.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Powerpacks/5.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Powerpacks/6.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Powerpacks/7.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  3001: () => Promise.all([
    loadImage(() => import('../assets/SpareParts/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/SpareParts/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/SpareParts/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/SpareParts/4.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  3002: () => Promise.all([
    loadImage(() => import('../assets/CoolBox/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/CoolBox/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/CoolBox/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/CoolBox/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  3003: () => Promise.all([
    loadImage(() => import('../assets/LEDLights/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/LEDLights/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/LEDLights/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/LEDLights/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  3004: () => Promise.all([
    loadImage(() => import('../assets/Ext_Camera/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Ext_Camera/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Ext_Camera/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Ext_Camera/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  4000: () => Promise.all([
    loadImage(() => import('../assets/Probes/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Probes/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Probes/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  4001: () => Promise.all([
    loadImage(() => import('../assets/ManualDrills/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/ManualDrills/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/ManualDrills/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  4003: () => Promise.all([
    loadImage(() => import('../assets/Hammers/Hero.png?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  4004: () => Promise.all([
    loadImage(() => import('../assets/Goetinger/Hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Goetinger/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Goetinger/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Goetinger/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Goetinger/4.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
  5000: () => Promise.all([
    loadImage(() => import('../assets/Nitratraupe/hero.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Nitratraupe/1.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Nitratraupe/2.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
    loadImage(() => import('../assets/Nitratraupe/3.jpg?w=150;480;768;1280&format=webp;jpg&as=srcset')),
  ]),
};

export const loadProductGallery = async (productId: number) => {
  const loadGallery = galleryLoaders[productId];
  return loadGallery ? loadGallery() : null;
};