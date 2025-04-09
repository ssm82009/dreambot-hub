
import React from 'react';
import { HomeSectionStyle } from '@/contexts/admin/types';

type HeroProps = {
  title: string;
  subtitle: string;
  style?: HomeSectionStyle;
};

const Hero = ({ title, subtitle, style = {} }: HeroProps) => {
  return (
    <section 
      className="py-20 px-4 text-center rtl"
      style={{
        backgroundColor: style.backgroundColor || '#ffffff',
        color: style.textColor || '#000000'
      }}
    >
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{title}</h1>
        <p className="text-lg md:text-xl opacity-90 mb-8 max-w-3xl mx-auto">{subtitle}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="#try-it" 
            className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            جرّب الآن
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
