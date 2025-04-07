
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useParams } from 'react-router-dom';
import DreamDetailsContent from '@/components/dreams/DreamDetailsContent';

const DreamDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 px-4 rtl">
        <div className="container mx-auto">
          <DreamDetailsContent dreamId={id} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DreamDetails;
