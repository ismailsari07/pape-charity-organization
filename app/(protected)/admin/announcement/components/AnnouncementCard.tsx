// components/admin/tabs/AnnouncementCard.tsx

"use client";

import { Announcement } from "@/types/announcement";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Archive, Eye, EyeOff, Copy } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onPublish?: (announcement: Announcement) => void;
  onArchive?: (announcement: Announcement) => void;
  onDuplicate?: (announcement: Announcement) => void;
}

const getPriorityColor = (priority: number): string => {
  if (priority >= 8) return "bg-red-100 text-red-800";
  if (priority >= 5) return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
};

const getPriorityLabel = (priority: number): string => {
  if (priority >= 8) return `🔥 ${priority}`;
  if (priority >= 5) return `⭐ ${priority}`;
  return `💤 ${priority}`;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    case "archived":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "published":
      return "✓ Yayınlı";
    case "draft":
      return "📝 Taslak";
    case "archived":
      return "📦 Arşivlenmiş";
    default:
      return status;
  }
};

export default function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onDuplicate,
}: AnnouncementCardProps) {
  const isExpiringSoon = new Date(announcement.expires_at).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000; // Less than 7 days

  const isExpired = new Date(announcement.expires_at) < new Date();

  const expiresInText = formatDistanceToNow(new Date(announcement.expires_at), { locale: tr, addSuffix: true });

  return (
    <div className="border border-neutral-800 text-white bg-neutral-900 rounded-lg overflow-hidden">
      {/* Image or Placeholder */}
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-700/50 to-gray-900/50 overflow-hidden">
        {announcement.image_url ? (
          <img
            src={announcement.image_url}
            alt={announcement.image_alt_text || announcement.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-4xl">📢</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(announcement.status)}`}
          >
            {getStatusLabel(announcement.status)}
          </span>
        </div>

        {/* Expiring Soon Badge */}
        {isExpiringSoon && !isExpired && (
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded">
              ⏰ Bitişe yakın
            </span>
          </div>
        )}

        {isExpired && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-semibold">Süresi Bitmiş</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-lg mb-2">{announcement.title}</h3>

        {/* Description */}
        <p className="text-sm text-neutral-500 mb-3">{announcement.description}</p>

        {/* Button Info */}
        {announcement.button_text && announcement.button_url && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
            <span className="font-semibold">Buton:</span> {announcement.button_text}
          </div>
        )}

        {/* Badges and Meta */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Priority */}
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(
              announcement.priority,
            )}`}
          >
            {getPriorityLabel(announcement.priority)}
          </span>

          {/* Display Type */}
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded">
            {announcement.display_type === "hero" ? "🔥 Hero" : "📱 Widget"}
          </span>
        </div>

        {/* Expiry Info */}
        <div className="mb-4 text-xs text-neutral-400 flex items-center gap-2">
          <span>📅 Süresi bitmek üzere: </span>
          <span className={isExpiringSoon && !isExpired ? "font-semibold text-orange-600" : ""}>{expiresInText}</span>
        </div>

        {/* Creation Info */}
        <div className="text-xs text-gray-400 mb-4">
          <span>Oluşturuldu: {format(new Date(announcement.created_at), "dd MMM yyyy", { locale: tr })}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(announcement)} className="flex-1">
            <Pencil className="w-4 h-4 mr-1" />
            Düzenle
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="px-2">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {announcement.status === "draft" && onPublish && (
                <DropdownMenuItem onClick={() => onPublish(announcement)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Yayınla
                </DropdownMenuItem>
              )}

              {announcement.status === "published" && onArchive && (
                <DropdownMenuItem onClick={() => onArchive(announcement)}>
                  <Archive className="w-4 h-4 mr-2" />
                  Arşivle
                </DropdownMenuItem>
              )}

              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(announcement)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Çoğalt
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => onDelete(announcement)} className="text-red-600 focus:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
