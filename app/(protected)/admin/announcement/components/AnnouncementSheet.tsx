// components/admin/tabs/AnnouncementSheet.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Announcement, AnnouncementFormData } from "@/types/announcement";
import { uploadImage, validateImage, deleteImage } from "@/lib/utils";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

const announcementFormSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir").max(255),
  description: z.string().min(1, "Açıklama gereklidir"),
  image_url: z.string().optional().nullable(),
  image_alt_text: z.string().optional(),
  button_text: z.string().optional().nullable(),
  button_url: z.string().url("Geçerli bir URL girin").optional().nullable(),
  display_type: z.enum(["hero", "widget"]),
  priority: z.number().min(1).max(10),
  expires_at: z.string().min(1, "Son tarih seçin"),
  status: z.enum(["draft", "published", "archived"]).optional(),
  hasButton: z.boolean().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

interface AnnouncementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onSave: (data: AnnouncementFormData) => Promise<void>;
  isLoading: boolean;
}

const getPriorityLabel = (value: number): string => {
  if (value >= 8) return "🔥 Çok Yüksek";
  if (value >= 5) return "⭐ Orta";
  return "💤 Düşük";
};

const getDefaultExpiryDate = (option: string): string => {
  const date = new Date();
  switch (option) {
    case "1week":
      date.setDate(date.getDate() + 7);
      break;
    case "2weeks":
      date.setDate(date.getDate() + 14);
      break;
    case "1month":
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return format(date, "yyyy-MM-dd");
};

export default function AnnouncementSheet({
  open,
  onOpenChange,
  announcement,
  onSave,
  isLoading,
}: AnnouncementSheetProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [expiryOption, setExpiryOption] = useState<"1week" | "2weeks" | "1month" | "custom">("2weeks");

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: null,
      image_alt_text: "",
      button_text: null,
      button_url: null,
      display_type: "widget",
      priority: 5,
      expires_at: getDefaultExpiryDate("2weeks"),
      status: "draft",
      hasButton: false,
    },
  });

  // Reset form when announcement changes or sheet opens/closes
  useEffect(() => {
    if (announcement) {
      const expiryDate = announcement.expires_at.split("T")[0];
      form.reset({
        title: announcement.title,
        description: announcement.description,
        image_url: announcement.image_url,
        image_alt_text: announcement.image_alt_text || "",
        button_text: announcement.button_text,
        button_url: announcement.button_url,
        display_type: announcement.display_type,
        priority: announcement.priority,
        expires_at: expiryDate,
        status: announcement.status,
        hasButton: !!(announcement.button_text && announcement.button_url),
      });
      setPreviewImage(announcement.image_url);
      setExpiryOption("custom");
    } else {
      form.reset({
        title: "",
        description: "",
        image_url: null,
        image_alt_text: "",
        button_text: null,
        button_url: null,
        display_type: "widget",
        priority: 5,
        expires_at: getDefaultExpiryDate("2weeks"),
        status: "draft",
        hasButton: false,
      });
      setPreviewImage(null);
      setExpiryOption("2weeks");
    }
  }, [announcement, open, form]);

  // Update expiry date when option changes
  useEffect(() => {
    if (expiryOption !== "custom") {
      form.setValue("expires_at", getDefaultExpiryDate(expiryOption));
    }
  }, [expiryOption, form]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = validateImage(file);
    if (!validation.valid) {
      form.setError("image_url", {
        message: validation.error,
      });
      return;
    }

    try {
      setUploadingImage(true);

      // Delete old image if exists
      const oldImageUrl = form.getValues("image_url");
      if (oldImageUrl && announcement) {
        await deleteImage(oldImageUrl);
      }

      // Upload new image
      const imageUrl = await uploadImage(file);
      form.setValue("image_url", imageUrl);
      setPreviewImage(imageUrl);
    } catch (error) {
      form.setError("image_url", {
        message: error instanceof Error ? error.message : "Yükleme başarısız",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    const imageUrl = form.getValues("image_url");
    if (imageUrl) {
      await deleteImage(imageUrl);
    }
    form.setValue("image_url", null);
    setPreviewImage(null);
  };

  const onSubmit = async (values: AnnouncementFormValues) => {
    const formData: AnnouncementFormData = {
      title: values.title,
      description: values.description,
      image_url: values.image_url,
      image_alt_text: values.image_alt_text,
      button_text: values.hasButton ? values.button_text : null,
      button_url: values.hasButton ? values.button_url : null,
      display_type: values.display_type,
      priority: values.priority,
      expires_at: values.expires_at,
      status: values.status || "draft",
    };

    await onSave(formData);
  };

  const hasButton = form.watch("hasButton");
  const priority = form.watch("priority");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-neutral-950 rounded-lg m-4 border border-neutral-800 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{announcement ? "Duyuruyu Düzenle" : "Yeni Duyuru"}</SheetTitle>
          <SheetDescription>
            {announcement ? "Duyuru bilgilerini güncelleyin" : "Sitede gösterilecek yeni bir duyuru ekleyin"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 flex flex-col gap-6 h-full">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Başlık *</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Site Bakımı" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Duyuru detaylarını yazın..."
                      {...field}
                      disabled={isLoading}
                      className="border-neutral-800 text-white bg-neutral-900"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resim (İsteğe Bağlı)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {previewImage && (
                        <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                            disabled={uploadingImage}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          disabled={uploadingImage || isLoading}
                          className="h-12 py-3"
                        />
                        {uploadingImage && <span className="text-gray-500">Yükleniyor...</span>}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>JPG, PNG, WebP (Max 5MB)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Alt Text */}
            {previewImage && (
              <FormField
                control={form.control}
                name="image_alt_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resim Açıklaması (SEO)</FormLabel>
                    <FormControl>
                      <Input placeholder="Resmi açıklayın..." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Display Type */}
            <FormField
              control={form.control}
              name="display_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nerede Gösterilsin? *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger disabled={isLoading}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hero">
                        <span>🔥 Hero Banner (Anasayfa Üstü)</span>
                      </SelectItem>
                      <SelectItem value="widget">
                        <span>📱 Widget (Yan Floating Card)</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === "hero" ? "Sadece 1 duyuru gösterilir" : "En fazla 3 duyuru gösterilir"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Button Toggle */}
            <div className="border rounded-xl border-neutral-800 p-4 my-3 space-y-6">
              <FormField
                control={form.control}
                name="hasButton"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="mb-0">Buton Ekle</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Button Fields (Conditional) */}
              {hasButton && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                  <FormField
                    control={form.control}
                    name="button_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buton Metni</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Örn: Daha Fazla Bilgi"
                            {...field}
                            value={field.value || ""}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="button_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buton Linki</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Örn: https://example.com veya /page"
                            {...field}
                            value={field.value || ""}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>İç link (/path) veya dış link (https://...)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="border rounded-xl border-neutral-800 p-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Öncelik (1-10) *</FormLabel>
                      <span className="text-sm font-semibold text-blue-600">{getPriorityLabel(field.value)}</span>
                    </div>
                    <FormControl>
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={isLoading}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Düşük</span>
                          <span className="font-semibold">{field.value}</span>
                          <span>Yüksek</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {priority >= 8 && "Yüksek: Hero banner'a uygun"}
                      {priority >= 5 && priority < 8 && "Orta: Widget'e ideal"}
                      {priority < 5 && "Düşük: Arka plan duyurusu"}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* Expiry Date */}
            <div className="border rounded-xl border-neutral-800 p-4">
              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ne Kadar Süre Gösterilsin? *</FormLabel>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => setExpiryOption("1week")}
                          size={"sm"}
                          className={`${
                            expiryOption === "1week"
                              ? "bg-blue-100 border-blue-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          1 Hafta
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setExpiryOption("2weeks")}
                          size={"sm"}
                          className={`${
                            expiryOption === "2weeks"
                              ? "bg-blue-100 border-blue-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          2 Hafta
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setExpiryOption("1month")}
                          size={"sm"}
                          className={`${
                            expiryOption === "1month"
                              ? "bg-blue-100 border-blue-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          1 Ay
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setExpiryOption("custom")}
                          size={"sm"}
                          className={`${
                            expiryOption === "custom"
                              ? "bg-blue-100 border-blue-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          Özel
                        </Button>
                      </div>

                      {expiryOption === "custom" && (
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-12 py-3"
                            disabled={isLoading}
                            min={format(new Date(), "yyyy-MM-dd")}
                          />
                        </FormControl>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col justify-end gap-4 pt-6">
              <Button type="submit" disabled={isLoading || uploadingImage}>
                {isLoading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || uploadingImage}
              >
                İptal
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
