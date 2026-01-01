import React from 'react';

// Base Skeleton Component
export const Skeleton = ({ className = '', animate = true }) => (
  <div className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`} />
);

// Text Line Skeleton
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`} 
      />
    ))}
  </div>
);

// Stat Card Skeleton
export const SkeletonStatCard = () => (
  <div className="bg-white p-6 rounded-lg shadow border">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16 mt-2" />
      </div>
      <Skeleton className="w-8 h-8 rounded" />
    </div>
  </div>
);

// Table Row Skeleton
export const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="border-b">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className={`h-4 ${i === 0 ? 'w-32' : 'w-20'}`} />
      </td>
    ))}
  </tr>
);

// Table Skeleton
export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="bg-white rounded-lg shadow border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// List Item Skeleton
export const SkeletonListItem = () => (
  <div className="flex items-center gap-4 p-4 border-b">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

// Dashboard Skeleton
export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Quick Access Buttons */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
    
    {/* Bottom Panels */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow border">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between py-2 border-b">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Pipeline Card Skeleton
export const SkeletonPipelineCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm border">
    <Skeleton className="h-5 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-3" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

// Pipeline Column Skeleton
export const SkeletonPipelineColumn = () => (
  <div className="flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4">
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonPipelineCard key={i} />
      ))}
    </div>
  </div>
);

// Contact/Lead Detail Skeleton
export const SkeletonDetail = () => (
  <div className="bg-white rounded-lg shadow border p-6">
    <div className="flex items-start gap-4 mb-6">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
