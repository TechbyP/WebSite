// AdminLayout.tsx
import React from 'react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white flex">
      <main className="flex-grow transition-all duration-500 ease-in-out no-horizontal-overflow w-full max-w-[100vw]">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;