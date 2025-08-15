
import { Wrench, Target, Gauge, Drill, Zap, Settings, Hammer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from './types/products';


import MP1_Hero from '../assets/MP-1.90/hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP1_2 from '../assets/MP-1.90/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP1_3 from '../assets/MP-1.90/3.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP1_4 from '../assets/MP-1.90/4.jpg?w=150;300;&format=webp;jpg&as=srcset';

import MP2_Hero from '../assets/MP-2.60/hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP2_1 from '../assets/MP-2.60/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP2_2 from '../assets/MP-2.60/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP2_3 from '../assets/MP-2.60/3.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP2_4 from '../assets/MP-2.60/4.jpg?w=150;300;&format=webp;jpg&as=srcset';

import MP3_Hero from '../assets/MP-3.90/hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP3_1 from '../assets/MP-3.90/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP3_2 from '../assets/MP-3.90/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP3_3 from '../assets/MP-3.90/3.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP3_4 from '../assets/MP-3.90/4.jpg?w=150;300;&format=webp;jpg&as=srcset';

import MP4_Hero from '../assets/MP-4.100/hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP4_2 from '../assets/MP-4.100/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP4_3 from '../assets/MP-4.100/3.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MP4_4 from '../assets/MP-4.100/4.jpg?w=150;300;&format=webp;jpg&as=srcset';

import DE_Hero from '../assets/DE-1.30/hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import DE_1 from '../assets/DE-1.30/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import DE_2 from '../assets/DE-1.30/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import DE_3 from '../assets/DE-1.30/3.jpg?w=150;300;&format=webp;jpg&as=srcset';

import DH_Hero from '../assets/DH-1.30/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import DH_1 from '../assets/DH-1.30/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import DH_2 from '../assets/DH-1.30/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import DH_3 from '../assets/DH-1.30/3.jpg?w=150;300;&format=webp;jpg&as=srcset';

import BOPROB_Hero from '../assets/BOPROB_III/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import BOPROB_2 from '../assets/BOPROB_III/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import BOPROB_3 from '../assets/BOPROB_III/3.jpg?w=150;300;&format=webp;jpg&as=srcset';
import BOPROB_4 from '../assets/BOPROB_III/4.jpg?w=150;300;&format=webp;jpg&as=srcset';

import LayDown_Hero from '../assets/Frames/Laydown/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import LayDown_1 from '../assets/Frames/Laydown/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import LayDown_2 from '../assets/Frames/Laydown/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import LayDown_3 from '../assets/Frames/Laydown/3.jpg?w=150;300;&format=webp;jpg&as=srcset';

import TPH_Hero from '../assets/Frames/Three-point/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import TPH_1 from '../assets/Frames/Three-point/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import TPH_2 from '../assets/Frames/Three-point/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import TPH_3 from '../assets/Frames/Three-point/3.jpg?w=150;300;&format=webp;jpg&as=srcset';
import TPH_4 from '../assets/Frames/Three-point/4.jpg?w=150;300;&format=webp;jpg&as=srcset';

import FC_Hero from '../assets/Frames/Full-Conversion/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import FC_1 from '../assets/Frames/Full-Conversion/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import FC_2 from '../assets/Frames/Full-Conversion/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import FC_3 from '../assets/Frames/Full-Conversion/3.jpg?w=150;300;&format=webp;jpg&as=srcset';

import Trailer_Hero from '../assets/Trailers/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import Trailer_1 from '../assets/Trailers/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import Trailer_2 from '../assets/Trailers/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import Trailer_3 from '../assets/Trailers/3.jpg?w=150;300;&format=webp;jpg&as=srcset';

import PP_Hero from '../assets/Powerpacks/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import PP_1 from '../assets/Powerpacks/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import PP_2 from '../assets/Powerpacks/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import PP_3 from '../assets/Powerpacks/3.jpg?w=150;300;&format=webp;jpg&as=srcset';
import PP_4 from '../assets/Powerpacks/4.jpg?w=150;300;&format=webp;jpg&as=srcset';
import PP_5 from '../assets/Powerpacks/5.jpg?w=150;300;&format=webp;jpg&as=srcset';
import PP_6 from '../assets/Powerpacks/6.jpg?w=150;300;&format=webp;jpg&as=srcset';
import PP_7 from '../assets/Powerpacks/7.jpg?w=150;300;&format=webp;jpg&as=srcset';

import SpareParts_Hero from '../assets/SpareParts/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import SpareParts_2 from '../assets/SpareParts/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import SpareParts_3 from '../assets/SpareParts/3.jpg?w=150;300;&format=webp;jpg&as=srcset';
import SpareParts_4 from '../assets/SpareParts/4.jpg?w=150;300;&format=webp;jpg&as=srcset';

import CB_Hero from '../assets/CoolBox/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import CB_1 from '../assets/CoolBox/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import CB_2 from '../assets/CoolBox/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import CB_3 from '../assets/CoolBox/3.jpg?w=150;300;&format=webp;jpg&as=srcset';

import LED_Hero from '../assets/LEDLights/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import LED_1 from '../assets/LEDLights/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import LED_2 from '../assets/LEDLights/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import LED_3 from '../assets/LEDLights/3.jpg?w=150;300;&format=webp;jpg&as=srcset';

import EC_Hero from '../assets/Ext_Camera/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import EC_1 from '../assets/Ext_Camera/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import EC_2 from '../assets/Ext_Camera/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import EC_3 from '../assets/Ext_Camera/3.jpg?w=150;300;&format=webp;jpg&as=srcset';

import MD_Hero from '../assets/ManualDrills/Hero.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MD_1 from '../assets/ManualDrills/1.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MD_2 from '../assets/ManualDrills/2.jpg?w=150;300;&format=webp;jpg&as=srcset';
import MD_3 from '../assets/ManualDrills/3.jpg?w=150;300;&format=webp;jpg&as=srcset';

import H_Hero from '../assets/Hammers/Hero.png?w=150;300;&format=webp;jpg&as=srcset';

// import MP1_Hero from '../assets/MP-1.90/hero.jpg';
// import MP1_2 from '../assets/MP-1.90/2.jpg';
// import MP1_3 from '../assets/MP-1.90/3.jpg';
// import MP1_4 from '../assets/MP-1.90/4.jpg';

// import MP2_Hero from '../assets/MP-2.60/hero.jpg';

// import MP2_1 from '../assets/MP-2.60/1.jpg';
// import MP2_2 from '../assets/MP-2.60/2.jpg';
// import MP2_3 from '../assets/MP-2.60/3.jpg';
// import MP2_4 from '../assets/MP-2.60/4.jpg';

// import MP3_Hero from '../assets/MP-3.90/hero.jpg';
// import MP3_1 from '../assets/MP-3.90/1.jpg';
// import MP3_2 from '../assets/MP-3.90/2.jpg';
// import MP3_3 from '../assets/MP-3.90/3.jpg';
// import MP3_4 from '../assets/MP-3.90/4.jpg';

// import MP4_Hero from '../assets/MP-4.100/hero.jpg';

// import MP4_2 from '../assets/MP-4.100/2.jpg';
// import MP4_3 from '../assets/MP-4.100/3.jpg';
// import MP4_4 from '../assets/MP-4.100/4.jpg';

// import DE_Hero from '../assets/DE-1.30/hero.jpg';
// import DE_1 from '../assets/DE-1.30/1.jpg';
// import DE_2 from '../assets/DE-1.30/2.jpg';
// import DE_3 from '../assets/DE-1.30/3.jpg';

// import DH_Hero from '../assets/DH-1.30/Hero.jpg'
// import DH_1 from '../assets/DH-1.30/1.jpg'
// import DH_2 from '../assets/DH-1.30/2.jpg'
// import DH_3 from '../assets/DH-1.30/3.jpg'

// import BOPROB_Hero from '../assets/BOPROB_III/Hero.jpg'
// import BOPROB_2 from '../assets/BOPROB_III/2.jpg'
// import BOPROB_3 from '../assets/BOPROB_III/3.jpg'
// import BOPROB_4 from '../assets/BOPROB_III/4.jpg'

// import LayDown_Hero from '../assets/Frames/Laydown/Hero.jpg'
// import LayDown_1 from '../assets/Frames/Laydown/1.jpg'
// import LayDown_2 from '../assets/Frames/Laydown/2.jpg'
// import LayDown_3 from '../assets/Frames/Laydown/3.jpg'

// import TPH_Hero from '../assets/Frames/Three-point/Hero.jpg'
// import TPH_1 from '../assets/Frames/Three-point/1.jpg'
// import TPH_2 from '../assets/Frames/Three-point/2.jpg'
// import TPH_3 from '../assets/Frames/Three-point/3.jpg'
// import TPH_4 from '../assets/Frames/Three-point/4.jpg'

// import FC_Hero from '../assets/Frames/Full-Conversion/Hero.jpg'
// import FC_1 from '../assets/Frames/Full-Conversion/1.jpg'
// import FC_2 from '../assets/Frames/Full-Conversion/2.jpg'
// import FC_3 from '../assets/Frames/Full-Conversion/3.jpg'

// import Trailer_Hero from '../assets/Trailers/Hero.jpg'
// import Trailer_1 from '../assets/Trailers/1.jpg'
// import Trailer_2 from '../assets/Trailers/2.jpg'
// import Trailer_3 from '../assets/Trailers/3.jpg'

// import PP_Hero from '../assets/Powerpacks/Hero.jpg'
// import PP_1 from '../assets/Powerpacks/1.jpg'
// import PP_2 from '../assets/Powerpacks/2.jpg'
// import PP_3 from '../assets/Powerpacks/3.jpg'
// import PP_4 from '../assets/Powerpacks/4.jpg'
// import PP_5 from '../assets/Powerpacks/5.jpg'
// import PP_6 from '../assets/Powerpacks/6.jpg'
// import PP_7 from '../assets/Powerpacks/7.jpg'

// import SpareParts_Hero from '../assets/SpareParts/Hero.jpg';
// import SpareParts_2 from '../assets/SpareParts/2.jpg';
// import SpareParts_3 from '../assets/SpareParts/3.jpg';
// import SpareParts_4 from '../assets/SpareParts/4.jpg';

// import CB_Hero from '../assets/CoolBox/Hero.jpg'
// import CB_1 from '../assets/CoolBox/1.jpg'
// import CB_2 from '../assets/CoolBox/2.jpg'
// import CB_3 from '../assets/CoolBox/3.jpg'

// import LED_Hero from '../assets/LEDLights/Hero.jpg'
// import LED_1 from '../assets/LEDLights/1.jpg'
// import LED_2 from '../assets/LEDLights/2.jpg'
// import LED_3 from '../assets/LEDLights/3.jpg'

// import EC_Hero from '../assets/Ext_Camera/Hero.jpg'
// import EC_1 from '../assets/Ext_Camera/1.jpg'
// import EC_2 from '../assets/Ext_Camera/2.jpg'
// import EC_3 from '../assets/Ext_Camera/3.jpg'

// import MD_Hero from '../assets/ManualDrills/Hero.jpg'
// import MD_1 from '../assets/ManualDrills/1.jpg'
// import MD_2 from '../assets/ManualDrills/2.jpg'
// import MD_3 from '../assets/ManualDrills/3.jpg'

// import H_Hero from '../assets/Hammers/Hero.png'

const createProducts = (t: any): Product[] => {
  return [
    {
      id: 1000,
      date: 1,
      name: "MP-1.90",
      nickname: t('mp1.nickname'),
      category: "SmartSystems",
      image: MP1_Hero,
      heroVideo: "",
      specs: t('mp1.specs', { returnObjects: true }) || [],
      icon: Gauge,
      priceValue: 14200,
      hydraulic: true,
      manual: false,
      electric: false,
      layers: 1,
      depth: 90,
      weight: 185,
      horizons: 1,
      magazines: 1,
      samplingCycleTime: 16,
      description: t('mp1.description'),
      herodescription: t('mp1.herodescription'),
      detailedDescription: t('mp1.detailedDescription'),
      price: t('mp1.price'),
      features: t('mp1.features', { returnObjects: true }) || [],
      applications: t('mp1.applications', { returnObjects: true }) || [],
      howToUse: t('mp1.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('mp1.technicalSpecs', { returnObjects: true }) || [],
      gallery: [MP1_Hero, MP1_2, MP1_3, MP1_4],
      testimonials: t('mp1.testimonials', { returnObjects: true }) || [],
    },
    // MP-2
    {
      id: 1001,
      date: 2,
      name: "MP-2.60",
      nickname: t('mp2.nickname'),
      category: "SmartSystems",
      bestseller: true,
      image: MP2_Hero,
      heroVideo: '40DoQB6vey0',
      specs: t('mp2.specs', { returnObjects: true }) || [],
      icon: Gauge,
      priceValue: 16500,
      hydraulic: true,
      manual: false,
      electric: false,
      layers: 2,
      depth: 60,
      weight: 200,
      horizons: 2,
      magazines: 3,
      samplingCycleTime: 18,
      description: t('mp2.description'),
      herodescription: t('mp2.herodescription'),
      detailedDescription: t('mp2.detailedDescription'),
      price: t('mp2.price'),
      features: t('mp2.features', { returnObjects: true }) || [],
      howToUse: t('mp2.howToUse', { returnObjects: true }) || [],
      applications: t('mp2.applications', { returnObjects: true }) || [],
      technicalSpecs: t('mp2.technicalSpecs', { returnObjects: true }) || [],
      gallery: [MP2_1, MP2_2, MP2_3, MP2_4],
      testimonials: t('mp2.testimonials', { returnObjects: true }) || [],
    },
    // MP-3
    {
      id: 1002,
      date: 3,
      name: "MP-3.90",
      nickname: t('mp3.nickname'),
      category: "SmartSystems",
      bestseller: true,
      image: MP3_Hero,
      heroVideo: '40DoQB6vey0',
      specs: t('mp3.specs', { returnObjects: true }) || [],
      icon: Gauge,
      priceValue: 23500,
      hydraulic: true,
      manual: false,
      electric: false,
      layers: 3,
      depth: 95,
      weight: 200,
      horizons: 3,
      magazines: 3,
      samplingCycleTime: 20,
      description: t('mp3.description'),
      herodescription: t('mp3.herodescription'),
      detailedDescription: t('mp3.detailedDescription'),
      price: t('mp3.price'),
      features: t('mp3.features', { returnObjects: true }) || [],
      howToUse: t('mp3.howToUse', { returnObjects: true }) || [],
      applications: t('mp3.applications', { returnObjects: true }) || [],
      technicalSpecs: t('mp3.technicalSpecs', { returnObjects: true }) || [],
      gallery: [MP3_1, MP3_2, MP3_3, MP3_4],
      testimonials: t('mp3.testimonials', { returnObjects: true }) || [],
    },
    // MP-4
    {
      id: 1003,
      date: 4,
      name: "MP-4.100",
      nickname: t('mp4.nickname'),
      category: "SmartSystems",
      bestseller: false,
      image: MP4_Hero,
      heroVideo: "",
      specs: t('mp4.specs', { returnObjects: true }) || [],
      icon: Gauge,
      priceValue: 25500,
      hydraulic: true,
      manual: false,
      electric: false,
      layers: 4,
      depth: 100,
      weight: 215,
      horizons: 4,
      magazines: 4,
      samplingCycleTime: 22,
      description: t('mp4.description'),
      herodescription: t('mp4.herodescription'),
      detailedDescription: t('mp4.detailedDescription'),
      price: t('mp4.price'),
      features: t('mp4.features', { returnObjects: true }) || [],
      howToUse: t('mp4.howToUse', { returnObjects: true }) || [],
      applications: t('mp4.applications', { returnObjects: true }) || [],
      technicalSpecs: t('mp4.technicalSpecs', { returnObjects: true }) || [],
      gallery: [MP4_Hero, MP4_2, MP4_3, MP4_4],
      testimonials: t('mp4.testimonials', { returnObjects: true }) || [],
    },
    // DH
    {
      id: 1004,
      date: 5,
      name: "DH-1.30",
      nickname: t('dh.nickname'),
      category: "SmartSystems",
      bestseller: true,
      image: DH_Hero,
      heroVideo: "",
      specs: t('dh.specs', { returnObjects: true }) || [],
      icon: Wrench,
      priceValue: 8950,
      electric: false,
      manual: false,
      hydraulic: true,
      depth: 30,
      weight: 45,
      operatingVoltage: "",
      horizons: 1,
      magazines: 1,
      samplingCycleTime: 14,
      description: t('dh.description'),
      herodescription: t('dh.herodescription'),
      detailedDescription: t('dh.detailedDescription'),
      price: t('dh.price'),
      features: t('dh.features', { returnObjects: true }) || [],
      applications: t('dh.applications', { returnObjects: true }) || [],
      howToUse: t('dh.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('dh.technicalSpecs', { returnObjects: true }) || [],
      gallery: [DH_Hero, DH_1, DH_2, DH_3],
      testimonials: t('dh.testimonials', { returnObjects: true }) || [],
    },
    // DE
    {
      id: 1005,
      date: 6,
      name: "DE-1.30",
      nickname: t('de.nickname'),
      category: "SmartSystems",
      bestseller: true,
      image: DE_Hero,
      heroVideo: 'm6BqgLotHT8',
      specs: t('de.specs', { returnObjects: true }) || [],
      icon: Zap,
      priceValue: 12600,
      electric: true,
      manual: false,
      hydraulic: false,
      depth: 30,
      weight: 45,
      operatingVoltage: "24 VDC",
      horizons: 1,
      magazines: 1,
      samplingCycleTime: 5,
      description: t('de.description'),
      herodescription: t('de.herodescription'),
      detailedDescription: t('de.detailedDescription'),
      price: t('de.price'),
      features: t('de.features', { returnObjects: true }) || [],
      applications: t('de.applications', { returnObjects: true }) || [],
      howToUse: t('de.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('de.technicalSpecs', { returnObjects: true }) || [],
      gallery: [DE_Hero, DE_1, DE_2, DE_3],
      testimonials: t('de.testimonials', { returnObjects: true }) || [],
    },
    // BOPROB
    {
      id: 1006,
      date: 7,
      name: "BOPROB III",
      nickname: t('boprob.nickname'),
      productKey: 'sixteen_express',
      category: "SmartSystems",
      bestseller: true,
      image: BOPROB_Hero,
      heroVideo: "",
      specs: t('boprob.specs', { returnObjects: true }) || [],
      icon: Target,
      priceValue: 28500,
      electric: false,
      manual: false,
      hydraulic: true,
      depth: 30,
      weight: 600,
      operatingVoltage: "",
      horizons: 1,
      magazines: 16,
      samplingCycleTime: 9,
      description: t('boprob.description'),
      herodescription: t('boprob.herodescription'),
      detailedDescription: t('boprob.detailedDescription'),
      price: t('boprob.price'),
      features: t('boprob.features', { returnObjects: true }) || [],
      applications: t('boprob.applications', { returnObjects: true }) || [],
      howToUse: t('boprob.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('boprob.technicalSpecs', { returnObjects: true }) || [],
      gallery: [BOPROB_Hero, BOPROB_2, BOPROB_3, BOPROB_4],
      testimonials: t('boprob.testimonials', { returnObjects: true }) || [],
    },
    // LayDown Frame
    {
      id: 2000,
      date: 2025,
      name: "Lay‑down Frame",
      nickname: t('laydown.nickname'),
      category: "accessory",
      bestseller: false,
      image: LayDown_Hero,
      heroVideo: "",
      icon: "",
      specs: t('laydown.specs', { returnObjects: true }) || [],
      priceValue: 1650,
      price: t('laydown.price'),
      electric: false,
      manual: false,
      hydraulic: true,
      description: t('laydown.description'),
      herodescription: t('laydown.herodescription'),
      detailedDescription: t('laydown.detailedDescription'),
      features: t('laydown.features', { returnObjects: true }) || [],
      applications: t('laydown.applications', { returnObjects: true }) || [],
      howToUse: t('laydown.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('laydown.technicalSpecs', { returnObjects: true }) || [],
      gallery: [LayDown_Hero, LayDown_1, LayDown_2, LayDown_3],
      testimonials: [],
    },
    // Three-Point Hitch
    {
      id: 2001,
      date: 2025,
      name: "Three‑Point Hitch",
      nickname: t('tph.nickname'),
      category: "accessory",
      bestseller: false,
      image: TPH_Hero,
      heroVideo: "",
      icon: "",
      specs: t('tph.specs', { returnObjects: true }) || [],
      priceValue: 2790,
      price: t('tph.price'),
      electric: false,
      manual: false,
      hydraulic: true,
      description: t('tph.description'),
      herodescription: t('tph.herodescription'),
      detailedDescription: t('tph.detailedDescription'),
      features: t('tph.features', { returnObjects: true }) || [],
      applications: t('tph.applications', { returnObjects: true }) || [],
      howToUse: t('tph.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('tph.technicalSpecs', { returnObjects: true }) || [],
      gallery: [TPH_4, TPH_1, TPH_2, TPH_3],
      testimonials: t('tph.testimonials', { returnObjects: true }) || [],
    },
    // Full Conversion
    {
      id: 2003,
      date: 2025,
      name: "Full Conversion",
      nickname: t('fc.nickname'),
      category: "accessory",
      bestseller: true,
      image: FC_Hero,
      heroVideo: "",
      icon: "",
      specs: t('fc.specs', { returnObjects: true }) || [],
      priceValue: 2790,
      price: t('fc.price'),
      electric: false,
      manual: false,
      hydraulic: false,
      description: t('fc.description'),
      herodescription: t('fc.herodescription'),
      detailedDescription: t('fc.detailedDescription'),
      features: t('fc.features', { returnObjects: true }) || [],
      applications: t('fc.applications', { returnObjects: true }) || [],
      howToUse: t('fc.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('fc.technicalSpecs', { returnObjects: true }) || [],
      gallery: [FC_Hero, FC_1, FC_2, FC_3],
      testimonials: t('fc.testimonials', { returnObjects: true }) || [],
    },
    // Trailers
    {
      id: 2004,
      date: 2025,
      name: "Special Trailers",
      nickname: t('trailer.nickname'),
      category: "accessory",
      type: "Trailer",
      bestseller: true,
      image: Trailer_Hero,
      heroVideo: "",
      icon: "",
      specs: t('trailer.specs', { returnObjects: true }) || [],
      priceValue: 3600,
      price: t('trailer.price'),
      electric: false,
      manual: false,
      hydraulic: false,
      description: t('trailer.description'),
      herodescription: t('trailer.herodescription'),
      detailedDescription: t('trailer.detailedDescription'),
      features: t('trailer.features', { returnObjects: true }) || [],
      applications: t('trailer.applications', { returnObjects: true }) || [],
      howToUse: t('trailer.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('trailer.technicalSpecs', { returnObjects: true }) || [],
      gallery: [Trailer_Hero, Trailer_1, Trailer_2, Trailer_3],
      testimonials: t('trailer.testimonials', { returnObjects: true }) || [],
    },
    // Power Packs
    {
      id: 3000,
      date: 2025,
      name: "Power Pack",
      nickname: t('powerpack.nickname'),
      category: "accessory",
      type: "Powerpack",
      bestseller: false,
      image: PP_Hero,
      heroVideo: "",
      icon: "",
      specs: t('powerpack.specs', { returnObjects: true }) || [],
      priceValue: 3450,
      price: t('powerpack.price'),
      electric: true,
      manual: false,
      hydraulic: true,
      description: t('powerpack.description'),
      herodescription: t('powerpack.herodescription'),
      detailedDescription: t('powerpack.detailedDescription'),
      features: t('powerpack.features', { returnObjects: true }) || [],
      applications: t('powerpack.applications', { returnObjects: true }) || [],
      howToUse: t('powerpack.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('powerpack.technicalSpecs', { returnObjects: true }) || [],
      gallery: [PP_Hero, PP_1, PP_2, PP_3, PP_4, PP_5, PP_6, PP_7],
      testimonials: t('powerpack.testimonials', { returnObjects: true }) || [],
    },
    // Spare Parts
    {
      id: 3001,
      date: 2025,
      name: "Recommended Spare Parts",
      nickname: t('spareparts.nickname'),
      category: "accessory",
      categoryName: "Extras",
      type: "Spare Parts",
      bestseller: true,
      image: SpareParts_Hero,
      heroVideo: "",
      icon: "",
      specs: t('spareparts.specs', { returnObjects: true }) || [],
      priceValue: 450,
      price: t('spareparts.price'),
      electric: true,
      manual: true,
      hydraulic: true,
      description: t('spareparts.description'),
      herodescription: t('spareparts.herodescription'),
      detailedDescription: t('spareparts.detailedDescription'),
      features: t('spareparts.features', { returnObjects: true }) || [],
      applications: t('spareparts.applications', { returnObjects: true }) || [],
      howToUse: t('spareparts.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('spareparts.technicalSpecs', { returnObjects: true }) || [],
      gallery: [SpareParts_Hero, SpareParts_2, SpareParts_3, SpareParts_4],
      testimonials: t('spareparts.testimonials', { returnObjects: true }) || [],
    },
    // Coolbox
    {
      id: 3002,
      date: 2025,
      name: "Coolbox 95L",
      nickname: t('coolbox.nickname'),
      category: "accessory",
      categoryName: "Extras",
      type: "Compressor Cooler",
      bestseller: false,
      image: CB_Hero,
      heroVideo: "",
      icon: "",
      specs: t('coolbox.specs', { returnObjects: true }) || [],
      priceValue: 1000,
      price: t('coolbox.price'),
      electric: true,
      manual: false,
      hydraulic: false,
      description: t('coolbox.description'),
      herodescription: t('coolbox.herodescription'),
      detailedDescription: t('coolbox.detailedDescription'),
      features: t('coolbox.features', { returnObjects: true }) || [],
      applications: t('coolbox.applications', { returnObjects: true }) || [],
      howToUse: t('coolbox.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('coolbox.technicalSpecs', { returnObjects: true }) || [],
      gallery: [CB_Hero, CB_1, CB_2, CB_3],
      testimonials: [],
    },
    // LED Light Kit
    {
      id: 3003,
      date: 2025,
      name: "LED Work Light 1700",
      nickname: t('led.nickname'),
      category: "accessory",
      categoryName: "Extras",
      type: "Lighting",
      bestseller: false,
      image: LED_Hero,
      heroVideo: "",
      icon: "",
      specs: t('led.specs', { returnObjects: true }) || [],
      priceValue: 67,
      price: t('led.price'),
      electric: true,
      manual: false,
      hydraulic: false,
      description: t('led.description'),
      herodescription: t('led.herodescription'),
      detailedDescription: t('led.detailedDescription'),
      features: t('led.features', { returnObjects: true }) || [],
      applications: t('led.applications', { returnObjects: true }) || [],
      howToUse: t('led.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('led.technicalSpecs', { returnObjects: true }) || [],
      gallery: [LED_Hero, LED_1, LED_2, LED_3],
      testimonials: [],
    },
    // External Camera
    {
      id: 3004,
      date: 2025,
      name: "External Camera",
      nickname: t('camera.nickname'),
      category: "accessory",
      categoryName: "Extras",
      type: "Monitoring",
      bestseller: false,
      image: EC_Hero,
      heroVideo: "",
      icon: "",
      specs: t('camera.specs', { returnObjects: true }) || [],
      priceValue: 225,
      price: t('camera.price'),
      electric: true,
      manual: false,
      hydraulic: false,
      description: t('camera.description'),
      herodescription: t('camera.herodescription'),
      detailedDescription: t('camera.detailedDescription'),
      features: t('camera.features', { returnObjects: true }) || [],
      applications: t('camera.applications', { returnObjects: true }) || [],
      howToUse: t('camera.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('camera.technicalSpecs', { returnObjects: true }) || [],
      gallery: [EC_Hero, EC_1, EC_2, EC_3],
      testimonials: [],
    },
    // Probes, Dipsticks and Accessories
    {
      id: 4000,
      date: 2025,
      name: "Probes, Dipsticks and Accessories",
      nickname: t('probes.nickname'),
      category: "manual",
      categoryName: "Manual Samplers",
      type: "DrillRod",
      bestseller: true,
      image: "",
      heroVideo: "",
      icon: Drill,
      specs: t('probes.specs', { returnObjects: true }) || [],
      priceValue: 150,
      price: t('probes.price'),
      electric: false,
      manual: true,
      hydraulic: false,
      description: t('probes.description'),
      herodescription: t('probes.herodescription'),
      detailedDescription: t('probes.detailedDescription'),
      features: t('probes.features', { returnObjects: true }) || [],
      applications: t('probes.applications', { returnObjects: true }) || [],
      howToUse: t('probes.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('probes.technicalSpecs', { returnObjects: true }) || [],
      table: t('probes.table', { returnObjects: true }) || [],
      gallery: [],
      testimonials: t('probes.testimonials', { returnObjects: true }) || [],
    },
    // Drill Rods
    {
      id: 4001,
      date: 2025,
      name: "Drill Rods Ø22 mm for Normal Soil Profiles",
      nickname: t('drillrods.nickname'),
      category: "manual",
      categoryName: "Manual Samplers",
      type: "DrillRod",
      bestseller: false,
      image: MD_Hero,
      heroVideo: "",
      icon: null,
      specs: t('drillrods.specs', { returnObjects: true }) || [],
      priceValue: null,
      price: t('drillrods.price'),
      electric: false,
      manual: true,
      hydraulic: false,
      description: t('drillrods.description'),
      herodescription: t('drillrods.herodescription'),
      detailedDescription: t('drillrods.detailedDescription'),
      features: t('drillrods.features', { returnObjects: true }) || [],
      applications: t('drillrods.applications', { returnObjects: true }) || [],
      howToUse: t('drillrods.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('drillrods.technicalSpecs', { returnObjects: true }) || [],
      table: t('drillrods.table', { returnObjects: true }) || [],
      gallery: [MD_Hero, MD_1, MD_2, MD_3],
      testimonials: [],
    },
    // Hammers
    {
      id: 4003,
      date: 2025,
      name: "Hammer Selection & Accessories",
      nickname: t('hammers.nickname'),
      category: "manual",
      categoryName: "Manual Tools",
      type: "HammerSet",
      bestseller: false,
      image: H_Hero,
      heroVideo: "",
      icon: null,
      specs: t('hammers.specs', { returnObjects: true }) || [],
      priceValue: 231,
      price: t('hammers.price'),
      electric: false,
      manual: true,
      hydraulic: false,
      description: t('hammers.description'),
      herodescription: t('hammers.herodescription'),
      detailedDescription: t('hammers.detailedDescription'),
      features: t('hammers.features', { returnObjects: true }) || [],
      applications: t('hammers.applications', { returnObjects: true }) || [],
      howToUse: t('hammers.howToUse', { returnObjects: true }) || [],
      technicalSpecs: t('hammers.technicalSpecs', { returnObjects: true }) || [],
      table: t('hammers.table', { returnObjects: true }) || [],
      gallery: [H_Hero],
      testimonials: []
    }
  ];
};

// data/products.ts
let products: Product[] = [];

// Create the getter functions
let getProductsByCategory = (category: string) => products;
let getProductById = (id: number) => products.find(p => p.id === id);

// Export the initialization function
export const initializeProducts = (t: any) => {
  products = createProducts(t);

  getProductsByCategory = (category: string) => {
    if (category === "All Products") return products;
    return products.filter(product => product.category === category);
  };

  getProductById = (id: number) => {
    return products.find(product => product.id === id);
  };
};

// Export the products and getter functions
export { products, getProductsByCategory, getProductById };