
-- وظيفة لإنشاء جدول firebase_config
CREATE OR REPLACE FUNCTION public.create_firebase_config_table()
RETURNS VOID AS $$
BEGIN
  IF NOT public.check_table_exists('firebase_config') THEN
    CREATE TABLE public.firebase_config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      api_key TEXT NOT NULL,
      auth_domain TEXT NOT NULL,
      project_id TEXT NOT NULL,
      storage_bucket TEXT NOT NULL,
      messaging_sender_id TEXT NOT NULL,
      app_id TEXT NOT NULL,
      measurement_id TEXT,
      service_account_key JSONB,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- إنشاء سياسات RLS لحماية الجدول
    ALTER TABLE public.firebase_config ENABLE ROW LEVEL SECURITY;
    
    -- سياسة تسمح للمشرفين فقط برؤية التكوينات
    CREATE POLICY "المشرفون فقط يمكنهم رؤية تكوينات Firebase" ON public.firebase_config
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    -- سياسة تسمح للمشرفين فقط بإضافة التكوينات
    CREATE POLICY "المشرفون فقط يمكنهم إضافة تكوينات Firebase" ON public.firebase_config
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    -- سياسة تسمح للمشرفين فقط بتحديث التكوينات
    CREATE POLICY "المشرفون فقط يمكنهم تحديث تكوينات Firebase" ON public.firebase_config
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    -- سياسة تسمح للمشرفين فقط بحذف التكوينات
    CREATE POLICY "المشرفون فقط يمكنهم حذف تكوينات Firebase" ON public.firebase_config
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END;
$$ LANGUAGE plpgsql;
