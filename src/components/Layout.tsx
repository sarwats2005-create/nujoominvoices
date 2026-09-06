import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background">
      <Header />
      <main className="container mx-auto w-full max-w-full py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
