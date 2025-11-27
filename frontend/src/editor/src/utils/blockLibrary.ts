import { Block } from '../types';

export const blockTemplates: Record<string, Omit<Block, 'id'>> = {
  section: {
    type: 'section',
    props: {
      backgroundColor: '#ffffff',
      padding: '40px 20px',
      margin: '0',
    },
    children: [],
  },
  columns: {
    type: 'columns',
    props: {
      columns: 2,
      padding: '20px',
      backgroundColor: '#f9fafb',
    },
    children: [],
  },
  heading: {
    type: 'heading',
    props: {
      heading: 'Your Heading Here',
      fontSize: '32px',
      textColor: '#111827',
      textAlign: 'left',
      margin: '0 0 16px 0',
    },
  },
  text: {
    type: 'text',
    props: {
      text: 'Add your text content here. You can edit this in the properties panel.',
      fontSize: '16px',
      textColor: '#374151',
      textAlign: 'left',
      margin: '0 0 16px 0',
    },
  },
  image: {
    type: 'image',
    props: {
      imageUrl: 'https://via.placeholder.com/600x400',
      borderRadius: '8px',
      margin: '0 0 16px 0',
    },
  },
  button: {
    type: 'button',
    props: {
      buttonText: 'Click Me',
      buttonLink: '#',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '16px',
      textAlign: 'center',
    },
  },
  hero: {
    type: 'hero',
    props: {
      heading: 'Welcome to Your Website',
      text: 'Build amazing pages with our visual editor',
      buttonText: 'Get Started',
      buttonLink: '#',
      backgroundColor: '#1e293b',
      textColor: '#ffffff',
      padding: '80px 20px',
      textAlign: 'center',
    },
  },
  pricing: {
    type: 'pricing',
    props: {
      title: 'Pro Plan',
      price: '$29/mo',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      buttonText: 'Subscribe',
      buttonLink: '#',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      padding: '32px',
      borderRadius: '12px',
      textAlign: 'center',
    },
  },
  spacer: {
    type: 'spacer',
    props: {
      height: '40px',
    },
  },
  divider: {
    type: 'divider',
    props: {
      backgroundColor: '#e5e7eb',
      height: '1px',
      margin: '24px 0',
    },
  },
};

export const blockNames: Record<string, string> = {
  section: 'Section Container',
  columns: 'Columns Layout',
  heading: 'Heading',
  text: 'Text Block',
  image: 'Image',
  button: 'Button',
  hero: 'Hero Section',
  pricing: 'Pricing Card',
  spacer: 'Spacer',
  divider: 'Divider',
};