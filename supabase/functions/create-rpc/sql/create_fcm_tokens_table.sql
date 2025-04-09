
-- وظيفة للتحقق من وجود جدول
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$ LANGUAGE plpgsql;

-- وظيفة لإنشاء جدول fcm_tokens
CREATE OR REPLACE FUNCTION public.create_fcm_tokens_table()
RETURNS VOID AS $$
BEGIN
  IF NOT public.check_table_exists('fcm_tokens') THEN
    CREATE TABLE public.fcm_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(user_id, token)
    );
    
    -- إنشاء سياسات RLS لحماية الجدول
    ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
    
    -- سياسة تسمح للمستخدمين برؤية رموزهم الخاصة فقط
    CREATE POLICY "المستخدمون يمكنهم رؤية رموزهم الخاصة فقط" ON public.fcm_tokens
      FOR SELECT USING (auth.uid() = user_id);
    
    -- سياسة تسمح للمستخدمين بإضافة رموزهم الخاصة فقط
    CREATE POLICY "المستخدمون يمكنهم إضافة رموزهم الخاصة فقط" ON public.fcm_tokens
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- سياسة تسمح للمستخدمين بتحديث رموزهم الخاصة فقط
    CREATE POLICY "المستخدمون يمكنهم تحديث رموزهم الخاصة فقط" ON public.fcm_tokens
      FOR UPDATE USING (auth.uid() = user_id);
    
    -- سياسة تسمح للمستخدمين بحذف رموزهم الخاصة فقط
    CREATE POLICY "المستخدمون يمكنهم حذف رموزهم الخاصة فقط" ON public.fcm_tokens
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END;
$$ LANGUAGE plpgsql;
