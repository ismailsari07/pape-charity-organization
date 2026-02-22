"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TabHeader from "../components/TabHeader";
import AnnouncementCard from "../announcement/components/AnnouncementCard";
import AnnouncementSheet from "../announcement/components/AnnouncementSheet";
import DeleteConfirmDialog from "../announcement/components/DeleteConfirmDialog";
import { Announcement, AnnouncementFormData } from "@/types/announcement";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
} from "@/lib/api/announcements";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FilterStatus = "all" | "draft" | "published" | "archived";
type FilterType = "all" | "hero" | "widget";

export default function AnnouncementsTab() {
  const queryClient = useQueryClient();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch announcements
  const {
    data: announcements = [],
    isLoading: isLoadingAnnouncements,
    error: announcementError,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => getAnnouncements(),
  });

  // Create/Update mutation
  const createMutation = useMutation({
    mutationFn: (data: AnnouncementFormData) =>
      selectedAnnouncement ? updateAnnouncement(selectedAnnouncement.id, data) : createAnnouncement(data),
    onSuccess: () => {
      toast.success(selectedAnnouncement ? "Duyuru güncellenmiştir" : "Yeni duyuru oluşturulmuştur");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setSheetOpen(false);
      setSelectedAnnouncement(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Bir hata meydana geldi");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      toast.success("Duyuru silinmiştir");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Silinme başarısız");
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (id: string) => publishAnnouncement(id),
    onSuccess: () => {
      toast.success("Duyuru yayınlanmıştır");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Yayınlama başarısız");
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveAnnouncement(id),
    onSuccess: () => {
      toast.success("Duyuru arşivlenmiştir");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Arşivleme başarısız");
    },
  });

  // Duplicate announcement
  const duplicateMutation = useMutation({
    mutationFn: async (announcement: Announcement) => {
      const newData: AnnouncementFormData = {
        title: `${announcement.title} (Kopya)`,
        description: announcement.description,
        image_url: announcement.image_url,
        image_alt_text: announcement.image_alt_text || undefined,
        button_text: announcement.button_text || null,
        button_url: announcement.button_url || null,
        display_type: announcement.display_type,
        priority: announcement.priority,
        expires_at: announcement.expires_at,
        status: "draft",
      };
      return createAnnouncement(newData);
    },
    onSuccess: () => {
      toast.success("Duyuru çoğaltılmıştır");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Çoğaltma başarısız");
    },
  });

  // Filter and search
  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filterStatus !== "all" && announcement.status !== filterStatus) return false;
    if (filterType !== "all" && announcement.display_type !== filterType) return false;
    if (
      searchTerm &&
      !announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !announcement.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Stats
  const stats = {
    total: announcements.length,
    published: announcements.filter((a) => a.status === "published").length,
    draft: announcements.filter((a) => a.status === "draft").length,
    archived: announcements.filter((a) => a.status === "archived").length,
  };

  const handleOpenSheet = (announcement?: Announcement) => {
    setSelectedAnnouncement(announcement || null);
    setSheetOpen(true);
  };

  const handleEditClick = (announcement: Announcement) => {
    handleOpenSheet(announcement);
  };

  const handleDeleteClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAnnouncement) return;
    await deleteMutation.mutateAsync(selectedAnnouncement.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader title="Duyurular" description="Site çapında gösterilecek duyuruları yönetin" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-neutral-400">Toplam Duyuru</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-neutral-50 font-semibold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-neutral-400">Yayınlı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-neutral-50 font-semibold">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-neutral-400">Taslak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-neutral-50 font-semibold">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-neutral-400">Arşivlenmiş</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-neutral-50 font-semibold">{stats.archived}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Button */}
      <div>
        <Button onClick={() => handleOpenSheet()}>
          <Plus />
          Yeni Duyuru Ekle
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ara</label>
          <Input
            type="text"
            placeholder="Başlık veya açıklama ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-neutral-800 text-white bg-neutral-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Durum</label>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="published">✓ Yayınlı</SelectItem>
                <SelectItem value="draft">📝 Taslak</SelectItem>
                <SelectItem value="archived">📦 Arşivlenmiş</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tür</label>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="hero">🔥 Hero</SelectItem>
                <SelectItem value="widget">📱 Widget</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div>
        {isLoadingAnnouncements ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : announcementError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Duyurular yüklenirken hata meydana geldi
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-600">
              {announcements.length === 0
                ? "Henüz duyuru yok. Yeni bir duyuru ekleyin."
                : "Filtrelerinize uygun duyuru bulunamadı."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onPublish={(ann) => publishMutation.mutate(ann.id)}
                onArchive={(ann) => archiveMutation.mutate(ann.id)}
                onDuplicate={(ann) => duplicateMutation.mutate(ann)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sheet */}
      <AnnouncementSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        announcement={selectedAnnouncement}
        onSave={(data) => {
          return new Promise<void>((resolve) => {
            createMutation.mutate(data, {
              onSuccess: () => {
                resolve();
              },
              onError: () => {
                resolve(); // Error zaten toast gösteriyor
              },
            });
          });
        }}
        isLoading={createMutation.isPending}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Duyuru Sil"
        description={`"${selectedAnnouncement?.title}" başlıklı duyuruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
