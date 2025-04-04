
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ProfileNavigationButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      className="w-full" 
      onClick={() => navigate('/profile')}
    >
      الذهاب للملف الشخصي
    </Button>
  );
};

export default ProfileNavigationButton;
