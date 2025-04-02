
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ColorInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  register: any;
  name: string;
};

const ColorInput: React.FC<ColorInputProps> = ({ 
  label, 
  value, 
  onChange, 
  register, 
  name 
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input 
          type="color" 
          className="w-12 h-10 p-1" 
          {...register(name)}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input 
          className="flex-1" 
          dir="ltr" 
          {...register(name)}
        />
      </div>
    </div>
  );
};

export default ColorInput;
