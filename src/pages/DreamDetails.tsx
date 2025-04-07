
import React, { useEffect } from 'react';
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useParams, useLocation } from 'react-router-dom';
import DreamDetailsContent from '@/components/dreams/DreamDetailsContent';

const DreamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  // إعادة تعيين موضع التمرير للأعلى عند تغيير المسار
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 rtl" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <div className="container mx-auto px-4 py-6">
          <DreamDetailsContent dreamId={id} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DreamDetails;
