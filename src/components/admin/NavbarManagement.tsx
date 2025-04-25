
import React, { useState, useEffect } from 'react';
import { useAdmin } from "@/contexts/admin";
import { NavLink } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, Trash, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NavbarManagement = () => {
  const { navLinks, setNavLinks } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [newLink, setNewLink] = useState<{
    title: string;
    url: string;
    is_admin_only: boolean;
  }>({
    title: "",
    url: "",
    is_admin_only: false
  });

  // Fetch navbar links
  const fetchNavLinks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('navbar_links')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }

      // Cast the data to NavLink type
      if (data) {
        setNavLinks(data as unknown as NavLink[]);
      } else {
        setNavLinks([]);
      }
    } catch (error) {
      console.error('Error fetching navbar links:', error);
      toast.error('حدث خطأ أثناء جلب روابط شريط التنقل');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNavLinks();
  }, []);

  // Move link up in order
  const moveUp = async (link: NavLink, index: number) => {
    if (index === 0) return;
    
    try {
      // Get the link above
      const prevLink = navLinks[index - 1];
      
      // Swap orders in database
      await Promise.all([
        supabase
          .from('navbar_links')
          .update({ order: prevLink.order } as any)
          .eq('id', link.id as any),
        supabase
          .from('navbar_links')
          .update({ order: link.order } as any)
          .eq('id', prevLink.id as any)
      ]);
      
      // Update state to reflect changes
      const newLinks = [...navLinks];
      const temp = newLinks[index].order;
      newLinks[index].order = newLinks[index - 1].order;
      newLinks[index - 1].order = temp;
      [newLinks[index], newLinks[index - 1]] = [newLinks[index - 1], newLinks[index]];
      setNavLinks(newLinks);
      
      toast.success('تم تحديث ترتيب الروابط');
    } catch (error) {
      console.error('Error moving link up:', error);
      toast.error('حدث خطأ أثناء تحديث ترتيب الروابط');
    }
  };

  // Move link down in order
  const moveDown = async (link: NavLink, index: number) => {
    if (index === navLinks.length - 1) return;
    
    try {
      // Get the link below
      const nextLink = navLinks[index + 1];
      
      // Swap orders in database
      await Promise.all([
        supabase
          .from('navbar_links')
          .update({ order: nextLink.order } as any)
          .eq('id', link.id as any),
        supabase
          .from('navbar_links')
          .update({ order: link.order } as any)
          .eq('id', nextLink.id as any)
      ]);
      
      // Update state to reflect changes
      const newLinks = [...navLinks];
      const temp = newLinks[index].order;
      newLinks[index].order = newLinks[index + 1].order;
      newLinks[index + 1].order = temp;
      [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
      setNavLinks(newLinks);
      
      toast.success('تم تحديث ترتيب الروابط');
    } catch (error) {
      console.error('Error moving link down:', error);
      toast.error('حدث خطأ أثناء تحديث ترتيب الروابط');
    }
  };

  // Delete link
  const deleteLink = async (id: string) => {
    try {
      await supabase
        .from('navbar_links')
        .delete()
        .eq('id', id as any);
      
      setNavLinks(navLinks.filter(link => link.id !== id));
      toast.success('تم حذف الرابط بنجاح');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('حدث خطأ أثناء حذف الرابط');
    }
  };

  // Add new link
  const addLink = async () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast.error('يرجى إدخال عنوان ورابط صالحين');
      return;
    }
    
    try {
      // Find the maximum order value
      const maxOrder = navLinks.length > 0 
        ? Math.max(...navLinks.map(link => link.order)) 
        : 0;
      
      // Insert new link with order = maxOrder + 1
      const { data, error } = await supabase
        .from('navbar_links')
        .insert({
          title: newLink.title,
          url: newLink.url,
          order: maxOrder + 1,
          is_admin_only: newLink.is_admin_only
        } as any)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setNavLinks([...navLinks, data[0] as unknown as NavLink]);
        // Reset form
        setNewLink({
          title: "",
          url: "",
          is_admin_only: false
        });
        toast.success('تم إضافة الرابط بنجاح');
      }
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('حدث خطأ أثناء إضافة الرابط');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">إدارة روابط شريط التنقل</h3>
        <p className="text-sm text-muted-foreground">
          قم بإضافة وترتيب وحذف الروابط التي تظهر في شريط التنقل العلوي للموقع
        </p>
      </div>

      {/* List of existing links */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">الروابط الحالية</h4>
        <div className="border rounded-md">
          {navLinks.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              لا توجد روابط مضافة حتى الآن
            </div>
          ) : (
            <ul className="divide-y">
              {navLinks.map((link, index) => (
                <li key={link.id} className="p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{link.title}</span>
                    <span className="text-sm text-muted-foreground">{link.url}</span>
                    {link.is_admin_only && (
                      <span className="text-xs text-blue-500 mt-1">للمشرفين فقط</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveUp(link, index)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveDown(link, index)}
                      disabled={index === navLinks.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Add new link form */}
      <div className="space-y-4 border rounded-md p-4">
        <h4 className="text-md font-medium">إضافة رابط جديد</h4>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              العنوان
            </label>
            <Input
              id="title"
              placeholder="مثال: الرئيسية"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              الرابط
            </label>
            <Input
              id="url"
              placeholder="مثال: /about"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            />
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox
              id="admin-only"
              checked={newLink.is_admin_only}
              onCheckedChange={(checked) => 
                setNewLink({ ...newLink, is_admin_only: checked as boolean })
              }
            />
            <label
              htmlFor="admin-only"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              للمشرفين فقط
            </label>
          </div>
          
          <Button onClick={addLink} className="mt-2">
            <Plus className="ml-2 h-4 w-4" />
            إضافة رابط
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavbarManagement;
