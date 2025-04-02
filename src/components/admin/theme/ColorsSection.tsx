
import React from 'react';
import ColorInput from './ColorInput';

type ColorsSectionProps = {
  primaryColor: string;
  buttonColor: string;
  textColor: string;
  backgroundColor: string;
  register: any;
  setValue: any;
};

const ColorsSection: React.FC<ColorsSectionProps> = ({ 
  primaryColor, 
  buttonColor, 
  textColor, 
  backgroundColor, 
  register, 
  setValue 
}) => {
  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-semibold mb-3">الألوان الرئيسية</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ColorInput 
          label="اللون الرئيسي"
          value={primaryColor}
          onChange={(value) => setValue("primaryColor", value)}
          register={register}
          name="primaryColor"
        />
        <ColorInput 
          label="لون الأزرار"
          value={buttonColor}
          onChange={(value) => setValue("buttonColor", value)}
          register={register}
          name="buttonColor"
        />
        <ColorInput 
          label="لون النص"
          value={textColor}
          onChange={(value) => setValue("textColor", value)}
          register={register}
          name="textColor"
        />
        <ColorInput 
          label="لون الخلفية"
          value={backgroundColor}
          onChange={(value) => setValue("backgroundColor", value)}
          register={register}
          name="backgroundColor"
        />
      </div>
    </div>
  );
};

export default ColorsSection;
