import { manualData } from '../../data/mpManual';
import { ChatMessage } from './types';
import type { Product } from '../../data/types/products';


/** ✳️ Assistant welcome lines - Updated for brevity */
export const introMessages = [
  "**Hello!** I'm *TechByp Assistant*—ready to discuss soil sampling machines.",
  "*TechByp Assistant* here! Shall we **dive into soil samplers**?",
  "**Hi!** *TechByp Assistant* at your service. What can I help with today?",
  "**Good to see you!** I'm your *TechByp Assistant*. Let's **talk machinery**.",
];

/** 🔧 Extract key information from manual for concise responses */
const extractKeyManualInfo = (manual: any): string => {
  let keyInfo = '';
  
  // Extract from INTRODUCTION
  if (manual.INTRODUCTION) {
    const intro = typeof manual.INTRODUCTION === 'string' ? manual.INTRODUCTION : '';
    keyInfo += `Intro: ${intro.split('.')[0]}.\n`;
  }
  
  // Extract from SAFETY INSTRUCTIONS
  if (manual["I. SAFETY INSTRUCTIONS"]) {
    const safety = typeof manual["I. SAFETY INSTRUCTIONS"] === 'string' ? manual["I. SAFETY INSTRUCTIONS"] : '';
    keyInfo += `Safety: ${safety.split('!')[0]}!\n`;
  }
  
  // Extract from TECHNICAL DATA
  if (manual["IV. TECHNICAL DATA"] && typeof manual["IV. TECHNICAL DATA"] === 'object') {
    const techData = manual["IV. TECHNICAL DATA"];
    if (techData["IV.1. Soil sampling device MP - 1.90, MP - 2.60, MP - 3.90, MP - 4.100, MP - 1.120"]) {
      keyInfo += `Tech Specs: Available for MP series.\n`;
    }
  }
  
  // Extract key operational info
  if (manual["VII. OPERATING FUNCTION / CONTROL"]) {
    const operation = typeof manual["VII. OPERATING FUNCTION / CONTROL"] === 'string' ? manual["VII. OPERATING FUNCTION / CONTROL"] : '';
    keyInfo += `Operation: ${operation.split('.')[0]}.\n`;
  }
  
  return keyInfo;
};

/** 🧠 Get manual section based on product slug - UPDATED */
export const getManualSection = (slug: string, t: any): string => {
  const match = slug.toUpperCase().includes('MP')
    ? 'MP-Series'
    : slug.toUpperCase().includes('DH')
      ? 'DH-Series'
      : slug.toUpperCase().includes('DE')
        ? 'DE-Series'
        : slug.toUpperCase().includes('BOPROB')
          ? 'BOPROB'
          : null;

  if (!match) return '';
  
  // Use the manualData for MP series
  if (match === 'MP-Series' && manualData) {
    return extractKeyManualInfo(manualData);
  }
  
  // Fallback to i18n translations for other series
  const manualDataI18n = t(`manual.${match}`, { returnObjects: true });
  if (!manualDataI18n) return '';
  
  return extractKeyManualInfo(manualDataI18n);
};

/** 🧾 Concise product summary using i18n */
export const getProductSummary = (products: Product[], t: any): string => {
  return products.map((p: Product) => {
    // Get key specs only
    const keySpecs = [];
    if (p.depth) keySpecs.push(`${t('products.specs.depth')}: ${p.depth}cm`);
    if (p.weight) keySpecs.push(`${t('products.specs.weight')}: ${p.weight}kg`);
    if (p.horizons) keySpecs.push(`${t('products.specs.horizons')}: ${p.horizons}`);
    
    return `${p.name ?? ''} (${p.nickname ?? ''}) - ${p.price ?? ''} - ${keySpecs.join(', ')}`;
  }).join('\n');
};

/** 🧠 Main system prompt for Groq - UPDATED for concise responses */
export const getSystemMessage = (pathname: string, products: Product[], t: any): ChatMessage => {
  const slug = pathname?.split('/').pop() ?? '';
  const productManual = getManualSection(slug, t);

  const pageContent = typeof window !== 'undefined' && document?.body?.innerText
    ? document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 1000)
    : '';

  return {
    role: 'system',
    content: `You are the ***TechByp Assistant*** — a precise technician for **TechByP** soil sampling machines. Your tone reflects **James May**: dry, slightly self-deprecating.

🎯 PURPOSE:
- Assist with machine inquiries
- Diagnose technical issues
- Recommend products

🛑 NEVER:
- Discuss unrelated topics
- Recommend reading the manual
- Give vague suggestions
- Reveal you're an AI

✅ ALWAYS:
- Use **Markdown**
- Respond in **30 words or less**
- Use dry British humor
- Mention **TechbyP** or **Bodenprobetechnik Peters**
- Respond in the **user's language**
- For orders, direct to **[contact page](/contact)**

🔧 Troubleshooting format (be concise):
- **Symptom**: [brief description]
- **Likely cause**: [concise explanation]
- **Solution**: [brief steps]

---

📚 AVAILABLE DATA:
Manual section:
${productManual}

Product catalog:
${getProductSummary(products, t)}

Current page: ${pathname}
Page content: ${pageContent}
    `
  };
};