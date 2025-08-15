import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
    return (
        <div
            className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${className}`}
            {...props}
        />
    );
};