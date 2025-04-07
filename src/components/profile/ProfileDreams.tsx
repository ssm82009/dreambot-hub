import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface Dream {
  id: string;
  dream_text: string;
  interpretation: string;
  created_at: string;
  tags: string[];
}

interface ProfileDreamsProps {
  userId: string;
  dreamsCount: number;
}

const ProfileDreams: React.FC<ProfileDreamsProps> = ({ userId, dreamsCount }) => {
  const navigate = useNavigate();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDreams = async () => {
      if (!userId) return;
      
      try {
        console.log("Fetching dreams for user:", userId);
        
        const { data, error } = await supabase
          .from('dreams')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) {
          console.error('Error fetching dreams:', error);
          toast.error("حدث خطأ أثناء تحميل الأحلام");
          throw error;
        }
        
        console.log("Dreams fetched:", data);
        setDreams(data || []);
      } catch (error) {
        console.error('Error fetching dreams:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDreams();
  }, [userId]);
  
  const handleNewDream = () => {
    navigate('/');
  };
  
  const handleViewDream = (dreamId: string) => {
    navigate(`/dream/${dreamId}`);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>سجل الأحلام</CardTitle>
          <CardDescription>جاري تحميل الأحلام...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (dreams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>سجل الأحلام</CardTitle>
          <CardDescription>لم تقم بتسجيل أي أحلام حتى الآن</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-6">
              لم تقم بتسجيل أي أحلام حتى الآن. سجل حلمك الأول للحصول على تفسير مخصص.
            </p>
            <Button onClick={handleNewDream}>
              <Plus className="mr-2 h-4 w-4" />
              تسجيل حلم جديد
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>سجل الأحلام</CardTitle>
          <CardDescription>
            آخر {dreams.length} أحلام قمت بتفسيرها (الإجمالي: {dreamsCount})
          </CardDescription>
        </div>
        <Button onClick={handleNewDream}>
          <Plus className="mr-2 h-4 w-4" />
          حلم جديد
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b">
              <tr>
                <th className="pb-3 pt-2 font-medium">التاريخ</th>
                <th className="pb-3 pt-2 font-medium">الحلم</th>
                <th className="pb-3 pt-2 font-medium">الوسوم</th>
                <th className="pb-3 pt-2 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {dreams.map((dream) => (
                <tr key={dream.id} className="border-b">
                  <td className="py-3">{formatDate(dream.created_at)}</td>
                  <td className="py-3">
                    <div className="max-w-md">
                      <p className="truncate">{dream.dream_text}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {dream.tags && dream.tags.length > 0 ? 
                        dream.tags.map((tag, index) => (
                          <span key={index} className="inline-block px-2 py-1 text-xs bg-muted rounded-full">
                            {tag}
                          </span>
                        )) : 
                        <span className="text-muted-foreground text-sm">لا توجد وسوم</span>
                      }
                    </div>
                  </td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDream(dream.id)}>
                      <ExternalLink className="h-4 w-4 ml-1" />
                      عرض
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileDreams;
