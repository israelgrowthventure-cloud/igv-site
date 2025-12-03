import React from 'react';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </div>
  );
};

