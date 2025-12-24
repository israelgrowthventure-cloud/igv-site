import React from 'react';

/**
 * BrandName Component
 * 
 * CRITICAL: The brand name "Israel Growth Venture" must NEVER be translated
 * and must always display in LTR direction, even in RTL (Hebrew) context.
 * 
 * This component ensures the brand name is consistently displayed across
 * the entire application.
 */
export const BRAND_NAME = 'Israel Growth Venture';
export const BRAND_NAME_SHORT = 'IGV';

export const BrandName = ({ short = false, className = '' }) => {
  return (
    <span className={`brand-name-constant ${className}`}>
      {short ? BRAND_NAME_SHORT : BRAND_NAME}
    </span>
  );
};

export default BrandName;
