
import React from 'react';
import { Brain } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import AiSettingsForm from '@/components/admin/AiSettingsForm';
import { useAdmin } from '@/contexts/admin';
import { useAiSettingsHandler } from '@/hooks/settings';

const AiSettingsSection = () => {
  const { aiSettingsForm, activeSections, toggleSection } = useAdmin();
  const { handleAiSettingsSubmit } = useAiSettingsHandler();

  const togetherModels = [
    { id: 'meta-llama/Llama-3-70b-chat-hf', name: 'Llama 3 70B Chat', description: 'أقوى نموذج مفتوح المصدر للمحادثة', availability: 'paid' as const },
    { id: 'meta-llama/Llama-3-8b-chat-hf', name: 'Llama 3 8B Chat', description: 'نموذج متوسط الحجم مثالي للتطبيقات العامة', availability: 'free' as const },
    { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'نموذج مزيج قوي بتكلفة منخفضة', availability: 'free' as const },
    { id: 'codellama/CodeLlama-70b-Instruct-hf', name: 'CodeLlama 70B', description: 'متخصص في فهم وتوليد التعليمات المعقدة', availability: 'paid' as const },
    { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Meta Llama 3 8B', description: 'نموذج تعليمات متوازن', availability: 'free' as const },
    { id: 'upstage/SOLAR-10.7B-Instruct-v1.0', name: 'SOLAR 10.7B', description: 'نموذج محسن للغة العربية', availability: 'free' as const },
    { id: 'togethercomputer/StripedHyena-Nous-7B', name: 'StripedHyena 7B', description: 'نموذج خفيف وسريع', availability: 'free' as const },
  ];

  return (
    <AdminSection 
      title="إعدادات مزود خدمة الذكاء الاصطناعي" 
      description="تكوين مزود خدمة الذكاء الاصطناعي ومفاتيح API"
      icon={Brain}
      isOpen={activeSections.aiSettings}
      onToggle={() => toggleSection('aiSettings')}
    >
      <AiSettingsForm 
        initialData={aiSettingsForm}
        onSubmit={handleAiSettingsSubmit}
        togetherModels={togetherModels}
      />
    </AdminSection>
  );
};

export default AiSettingsSection;
