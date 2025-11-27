import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * CmsPageRenderer
 * ===============
 * Universal component that renders pages from the visual CMS.
 * 
 * CRITICAL CONCEPT:
 * - This component is the ONLY place where CMS content becomes visual HTML.
 * - ALL pages (home, packs, about, etc) are now controlled by the CMS.
 * - To change ANY page layout or content, modify it in the CMS, not in code.
 * 
 * SUPPORTED BLOCK TYPES:
 * - section: Container with background, padding, alignment
 * - columns: Multi-column layout (2-4 columns)
 * - heading: Text heading (h1-h6)
 * - text: Paragraph or rich text
 * - image: Image with optional caption
 * - button: Call-to-action button
 * - hero: Hero section with title, subtitle, image
 * - pricing: Pricing card/table
 * - spacer: Vertical spacing
 * - divider: Horizontal line
 * 
 * BLOCK STRUCTURE:
 * Each block has:
 * - id: unique identifier
 * - type: block type (see above)
 * - props: configuration object (styles, content, etc)
 * - children: nested blocks array
 * 
 * EXTENDING:
 * To add new block types, add a case in renderBlock() method.
 */

const CmsPageRenderer = ({ blocks = [] }) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">No content blocks found in CMS</p>
        </div>
      </div>
    );
  }

  /**
   * Render a single block based on its type
   */
  const renderBlock = (block) => {
    const { id, type, props = {}, children = [] } = block;

    // Build className from props
    const buildClassName = () => {
      const classes = [];
      
      // Background
      if (props.background) classes.push(`bg-${props.background}`);
      
      // Padding
      if (props.padding) classes.push(`p-${props.padding}`);
      if (props.paddingX) classes.push(`px-${props.paddingX}`);
      if (props.paddingY) classes.push(`py-${props.paddingY}`);
      
      // Margin
      if (props.margin) classes.push(`m-${props.margin}`);
      if (props.marginX) classes.push(`mx-${props.marginX}`);
      if (props.marginY) classes.push(`my-${props.marginY}`);
      
      // Text alignment
      if (props.textAlign) classes.push(`text-${props.textAlign}`);
      
      // Text color
      if (props.textColor) classes.push(`text-${props.textColor}`);
      
      // Additional custom classes
      if (props.className) classes.push(props.className);
      
      return classes.join(' ');
    };

    const buildStyle = () => {
      const style = {};
      if (props.backgroundColor) style.backgroundColor = props.backgroundColor;
      if (props.color) style.color = props.color;
      if (props.minHeight) style.minHeight = props.minHeight;
      if (props.maxWidth) style.maxWidth = props.maxWidth;
      return Object.keys(style).length > 0 ? style : undefined;
    };

    switch (type) {
      // ===== SECTION =====
      case 'section':
        return (
          <section
            key={id}
            className={buildClassName() || 'py-20 px-4'}
            style={buildStyle()}
          >
            <div className={props.container !== false ? 'max-w-7xl mx-auto' : ''}>
              {children.map(renderBlock)}
            </div>
          </section>
        );

      // ===== COLUMNS =====
      case 'columns':
        const columnCount = props.columns || 2;
        const gridCols = {
          1: 'grid-cols-1',
          2: 'grid-cols-1 md:grid-cols-2',
          3: 'grid-cols-1 md:grid-cols-3',
          4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        }[columnCount] || 'grid-cols-1 md:grid-cols-2';

        return (
          <div
            key={id}
            className={`grid ${gridCols} gap-${props.gap || '8'} ${buildClassName()}`}
            style={buildStyle()}
          >
            {children.map(renderBlock)}
          </div>
        );

      // ===== HEADING =====
      case 'heading':
        const HeadingTag = props.level ? `h${props.level}` : 'h2';
        const headingSize = {
          1: 'text-5xl md:text-6xl',
          2: 'text-4xl md:text-5xl',
          3: 'text-3xl md:text-4xl',
          4: 'text-2xl md:text-3xl',
          5: 'text-xl md:text-2xl',
          6: 'text-lg md:text-xl',
        }[props.level || 2];

        return (
          <HeadingTag
            key={id}
            className={`font-bold text-gray-900 mb-${props.marginBottom || '6'} ${headingSize} ${buildClassName()}`}
            style={buildStyle()}
          >
            {props.content}
          </HeadingTag>
        );

      // ===== TEXT =====
      case 'text':
        return (
          <p
            key={id}
            className={`text-${props.size || 'lg'} text-gray-${props.shade || '700'} mb-${props.marginBottom || '4'} ${buildClassName()}`}
            style={buildStyle()}
            dangerouslySetInnerHTML={props.html ? { __html: props.content } : undefined}
          >
            {!props.html && props.content}
          </p>
        );

      // ===== IMAGE =====
      case 'image':
        return (
          <div key={id} className={`mb-${props.marginBottom || '6'} ${buildClassName()}`}>
            <img
              src={props.src}
              alt={props.alt || ''}
              className={`${props.rounded ? 'rounded-lg' : ''} ${props.shadow ? 'shadow-lg' : ''} ${props.width ? `w-${props.width}` : 'w-full'}`}
              style={buildStyle()}
            />
            {props.caption && (
              <p className="text-sm text-gray-500 mt-2 text-center">{props.caption}</p>
            )}
          </div>
        );

      // ===== BUTTON =====
      case 'button':
        const buttonVariant = props.variant || 'primary';
        const buttonClasses = {
          primary: 'bg-blue-600 text-white hover:bg-blue-700',
          secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
        }[buttonVariant];

        const ButtonContent = (
          <>
            {props.content}
            {props.icon === 'arrow' && <ArrowRight className="ml-2" size={20} />}
          </>
        );

        if (props.href) {
          // External link
          return (
            <a
              key={id}
              href={props.href}
              target={props.target}
              rel={props.target === '_blank' ? 'noopener noreferrer' : undefined}
              className={`inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold ${buttonClasses} ${buildClassName()}`}
              style={buildStyle()}
            >
              {ButtonContent}
            </a>
          );
        } else if (props.to) {
          // Internal link
          return (
            <Link
              key={id}
              to={props.to}
              className={`inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold ${buttonClasses} ${buildClassName()}`}
              style={buildStyle()}
            >
              {ButtonContent}
            </Link>
          );
        } else {
          // Regular button
          return (
            <button
              key={id}
              onClick={props.onClick}
              className={`inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold ${buttonClasses} ${buildClassName()}`}
              style={buildStyle()}
            >
              {ButtonContent}
            </button>
          );
        }

      // ===== HERO =====
      case 'hero':
        return (
          <section
            key={id}
            className={`relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 ${buildClassName()}`}
            style={buildStyle()}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left side - Content */}
                <div>
                  {props.title && (
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                      {props.title}
                    </h1>
                  )}
                  {props.subtitle && (
                    <p className="text-xl text-gray-600 mb-8">
                      {props.subtitle}
                    </p>
                  )}
                  {props.description && (
                    <p className="text-lg text-gray-700 mb-8">
                      {props.description}
                    </p>
                  )}
                  {children.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      {children.map(renderBlock)}
                    </div>
                  )}
                </div>

                {/* Right side - Image */}
                {props.image && (
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-2xl overflow-hidden h-96">
                      <img
                        src={props.image}
                        alt={props.imageAlt || 'Hero image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      // ===== PRICING =====
      case 'pricing':
        return (
          <div
            key={id}
            className={`bg-white p-8 rounded-lg shadow hover:shadow-lg ${buildClassName()}`}
            style={buildStyle()}
          >
            {props.badge && (
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
                {props.badge}
              </div>
            )}
            {props.title && (
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {props.title}
              </h3>
            )}
            {props.price && (
              <div className="text-4xl font-bold text-blue-600 mb-4">
                {props.price}
              </div>
            )}
            {props.description && (
              <p className="text-gray-600 mb-6">{props.description}</p>
            )}
            {props.features && Array.isArray(props.features) && (
              <ul className="space-y-3 mb-6">
                {props.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            {children.length > 0 && children.map(renderBlock)}
          </div>
        );

      // ===== SPACER =====
      case 'spacer':
        return (
          <div
            key={id}
            className={`h-${props.height || '8'} ${buildClassName()}`}
            style={buildStyle()}
          />
        );

      // ===== DIVIDER =====
      case 'divider':
        return (
          <hr
            key={id}
            className={`border-gray-${props.shade || '300'} my-${props.marginY || '8'} ${buildClassName()}`}
            style={buildStyle()}
          />
        );

      // ===== GRID (generic container) =====
      case 'grid':
        return (
          <div
            key={id}
            className={buildClassName() || 'grid gap-8'}
            style={buildStyle()}
          >
            {children.map(renderBlock)}
          </div>
        );

      // ===== CONTAINER (generic wrapper) =====
      case 'container':
        return (
          <div
            key={id}
            className={buildClassName() || 'max-w-7xl mx-auto'}
            style={buildStyle()}
          >
            {children.map(renderBlock)}
          </div>
        );

      // ===== UNKNOWN BLOCK TYPE =====
      default:
        console.warn(`Unknown CMS block type: ${type}`, block);
        return (
          <div key={id} className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-yellow-800">
              Unknown block type: <strong>{type}</strong>
            </p>
            <pre className="text-xs mt-2 text-yellow-700">
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {blocks.map(renderBlock)}
    </div>
  );
};

export default CmsPageRenderer;
