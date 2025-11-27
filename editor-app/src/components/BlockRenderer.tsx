import { Block } from '../types';

interface BlockRendererProps {
  block: Block;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  const { type, props, children } = block;

  switch (type) {
    case 'section':
      return (
        <div
          style={{
            backgroundColor: props.backgroundColor,
            padding: props.padding,
            margin: props.margin,
          }}
        >
          {children?.map((child) => (
            <BlockRenderer key={child.id} block={child} />
          ))}
        </div>
      );

    case 'columns':
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`,
            gap: '20px',
            padding: props.padding,
            backgroundColor: props.backgroundColor,
          }}
        >
          {children?.map((child) => (
            <BlockRenderer key={child.id} block={child} />
          ))}
        </div>
      );

    case 'heading':
      return (
        <h2
          style={{
            fontSize: props.fontSize,
            color: props.textColor,
            textAlign: props.textAlign as any,
            margin: props.margin,
          }}
        >
          {props.heading}
        </h2>
      );

    case 'text':
      return (
        <p
          style={{
            fontSize: props.fontSize,
            color: props.textColor,
            textAlign: props.textAlign as any,
            margin: props.margin,
          }}
        >
          {props.text}
        </p>
      );

    case 'image':
      return (
        <img
          src={props.imageUrl}
          alt=""
          style={{
            width: '100%',
            borderRadius: props.borderRadius,
            margin: props.margin,
          }}
        />
      );

    case 'button':
      return (
        <a
          href={props.buttonLink}
          style={{
            display: 'inline-block',
            backgroundColor: props.backgroundColor,
            color: props.textColor,
            padding: props.padding,
            borderRadius: props.borderRadius,
            fontSize: props.fontSize,
            textDecoration: 'none',
            textAlign: props.textAlign as any,
          }}
        >
          {props.buttonText}
        </a>
      );

    case 'hero':
      return (
        <div
          style={{
            backgroundColor: props.backgroundColor,
            color: props.textColor,
            padding: props.padding,
            textAlign: props.textAlign as any,
          }}
        >
          <h1 style={{ fontSize: '48px', marginBottom: '16px', fontWeight: 'bold' }}>
            {props.heading}
          </h1>
          <p style={{ fontSize: '20px', marginBottom: '32px', opacity: 0.9 }}>
            {props.text}
          </p>
          <a
            href={props.buttonLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            {props.buttonText}
          </a>
        </div>
      );

    case 'pricing':
      return (
        <div
          style={{
            backgroundColor: props.backgroundColor,
            color: props.textColor,
            padding: props.padding,
            borderRadius: props.borderRadius,
            textAlign: props.textAlign as any,
            border: '2px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            {props.title}
          </h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '16px 0' }}>
            {props.price}
          </div>
          <ul style={{ listStyle: 'none', margin: '24px 0' }}>
            {props.features?.map((feature, idx) => (
              <li key={idx} style={{ margin: '8px 0' }}>
                ✓ {feature}
              </li>
            ))}
          </ul>
          <a
            href={props.buttonLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            {props.buttonText}
          </a>
        </div>
      );

    case 'spacer':
      return <div style={{ height: props.height }} />;

    case 'divider':
      return (
        <hr
          style={{
            backgroundColor: props.backgroundColor,
            height: props.height,
            border: 'none',
            margin: props.margin,
          }}
        />
      );

    default:
      return <div>Unknown block type: {type}</div>;
  }
}