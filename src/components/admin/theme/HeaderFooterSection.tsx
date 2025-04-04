
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ColorInput from './ColorInput';

type HeaderFooterSectionProps = {
  headerColor: string;
  footerColor: string;
  footerText: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
  register: any;
  setValue: any;
};

const HeaderFooterSection: React.FC<HeaderFooterSectionProps> = ({ 
  headerColor, 
  footerColor, 
  footerText, 
  socialLinks, 
  register, 
  setValue 
}) => {
  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-semibold mb-3">الهيدر والفوتر</h3>
      <div className="space-y-4">
        <ColorInput 
          label="لون خلفية الهيدر"
          value={headerColor}
          onChange={(value) => setValue("headerColor", value)}
          register={register}
          name="headerColor"
        />
        <ColorInput 
          label="لون خلفية الفوتر"
          value={footerColor}
          onChange={(value) => setValue("footerColor", value)}
          register={register}
          name="footerColor"
        />
        <div className="space-y-2">
          <Label>نص الفوتر</Label>
          <Input 
            placeholder="جميع الحقوق محفوظة ©" 
            {...register("footerText")}
          />
        </div>
        <div className="space-y-2">
          <Label>روابط التواصل الاجتماعي</Label>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label className="min-w-24">تويتر</Label>
              <Input 
                placeholder="https://twitter.com/..." 
                dir="ltr" 
                {...register("twitterLink")}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label className="min-w-24">فيسبوك</Label>
              <Input 
                placeholder="https://facebook.com/..." 
                dir="ltr" 
                {...register("facebookLink")}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label className="min-w-24">انستغرام</Label>
              <Input 
                placeholder="https://instagram.com/..." 
                dir="ltr" 
                {...register("instagramLink")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterSection;
