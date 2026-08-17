import { useEffect } from 'react';
import { BlogPost, Treatment, ContactInfo } from '../types';

interface SEOHeadProps {
  activeTab: 'home' | 'tratamentos' | 'blog';
  selectedTreatment?: Treatment | null;
  selectedBlogPost?: BlogPost | null;
  contactInfo?: ContactInfo | null;
}

export function SEOHead({
  activeTab,
  selectedTreatment,
  selectedBlogPost,
  contactInfo,
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Dynamic Title & Description Calculation
    let pageTitle = 'Central da Estética | Clínica de Estética em São Paulo - Jardins & Paulista';
    let pageDescription =
      'Clínica de Estética de Alta Performance em São Paulo (Jardim Paulista). Especialistas em Secagem de Vasinhos, Botox, Ultraformer MPT, Laser Lavieén, Bioestimuladores de Colágeno e Gordura Localizada. Agende sua avaliação!';
    let pageUrl = 'https://centraldaestetica.com.br/';
    let pageImage = 'https://qzcrregtdhjumvfigwxj.supabase.co/storage/v1/object/public/imagens/logo.png';
    let pageType = 'website';

    if (selectedBlogPost) {
      pageTitle = `${selectedBlogPost.title} | Blog Central da Estética`;
      pageDescription = selectedBlogPost.excerpt || `Leia nosso artigo completo sobre ${selectedBlogPost.title} no blog da Central da Estética.`;
      pageUrl = `https://centraldaestetica.com.br/#blog/${selectedBlogPost.slug || selectedBlogPost.id}`;
      if (selectedBlogPost.image) pageImage = selectedBlogPost.image;
      pageType = 'article';
    } else if (selectedTreatment) {
      pageTitle = `${selectedTreatment.name} em São Paulo | Central da Estética`;
      pageDescription = `${selectedTreatment.name}: ${selectedTreatment.description.substring(0, 150)}... Conheça benefícios, duração e agende sua avaliação em SP.`;
      pageUrl = `https://centraldaestetica.com.br/?treatment=${selectedTreatment.id}`;
      if (selectedTreatment.image) pageImage = selectedTreatment.image;
      pageType = 'product';
    } else if (activeTab === 'tratamentos') {
      pageTitle = 'Tratamentos Faciais e Corporais em São Paulo | Central da Estética';
      pageDescription =
        'Confira nosso catálogo de procedimentos estéticos: Secagem de Vasinhos, Botox, Ultraformer MPT, Laser Lavieén, Peelings e Bioestimuladores no Jardim Paulista, SP.';
      pageUrl = 'https://centraldaestetica.com.br/#tratamentos';
    } else if (activeTab === 'blog') {
      pageTitle = 'Blog de Estética, Rejuvenescimento e Beleza | Central da Estética SP';
      pageDescription =
        'Artigos, dicas de especialistas e novidades sobre cuidados com a pele, tratamentos faciais e tecnologias corporais da Central da Estética.';
      pageUrl = 'https://centraldaestetica.com.br/#blog';
    }

    // 2. Update Document Title
    document.title = pageTitle;

    // 3. Helper to update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 4. Update Standard SEO Metas
    updateMeta('title', pageTitle);
    updateMeta('description', pageDescription);

    // 5. Update Open Graph Metas
    updateMeta('og:title', pageTitle, true);
    updateMeta('og:description', pageDescription, true);
    updateMeta('og:url', pageUrl, true);
    updateMeta('og:image', pageImage, true);
    updateMeta('og:type', pageType, true);

    // 6. Update Twitter Metas
    updateMeta('twitter:title', pageTitle);
    updateMeta('twitter:description', pageDescription);
    updateMeta('twitter:image', pageImage);
    updateMeta('twitter:url', pageUrl);

    // 7. Update Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    // 8. Inject or Update Dynamic JSON-LD for Specific Entity (Blog Post or Treatment)
    const existingDynamicScript = document.getElementById('dynamic-seo-jsonld');
    if (existingDynamicScript) {
      existingDynamicScript.remove();
    }

    if (selectedBlogPost) {
      const script = document.createElement('script');
      script.id = 'dynamic-seo-jsonld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: selectedBlogPost.title,
        description: selectedBlogPost.excerpt,
        image: [selectedBlogPost.image || pageImage],
        datePublished: selectedBlogPost.date || '2026-08-01',
        author: {
          '@type': 'Person',
          name: selectedBlogPost.author || 'Especialista Central da Estética',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Central da Estética',
          logo: {
            '@type': 'ImageObject',
            url: 'https://qzcrregtdhjumvfigwxj.supabase.co/storage/v1/object/public/imagens/logo.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl,
        },
      });
      document.head.appendChild(script);
    } else if (selectedTreatment) {
      const script = document.createElement('script');
      script.id = 'dynamic-seo-jsonld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: selectedTreatment.name,
        description: selectedTreatment.description,
        provider: {
          '@type': 'LocalBusiness',
          name: 'Central da Estética',
          telephone: contactInfo?.whatsappNumber ? `+${contactInfo.whatsappNumber}` : '+55-11-94683-765',
          address: {
            '@type': 'PostalAddress',
            streetAddress: contactInfo?.addressLine1 || 'Rua Artur Frazão, 33',
            addressLocality: 'São Paulo',
            addressRegion: 'SP',
            postalCode: contactInfo?.cep || '01423-030',
            addressCountry: 'BR',
          },
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'BRL',
          price: selectedTreatment.price?.replace(/[^\d,.]/g, '') || '0',
          availability: 'https://schema.org/InStock',
          url: pageUrl,
        },
      });
      document.head.appendChild(script);
    }
  }, [activeTab, selectedTreatment, selectedBlogPost, contactInfo]);

  return null;
}
