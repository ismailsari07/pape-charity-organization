import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Users } from "lucide-react";
import type { Subscriber } from "../types/database.types";

interface SubscriberBadgeListProps {
  selectedSubscribers: Subscriber[];
  sendToAll: boolean;
  recipientCount: number;
  activeSubscribersCount: number;
  onRemoveSubscriber: (id: string) => void;
  onRemoveAll: () => void;
  onSelectAll: () => void;
}

/**
 * Displays selected subscribers as removable badges
 *
 * Shows either:
 * - Individual subscriber badges
 * - "Everybody" badge when sendToAll is true
 * - Placeholder text when no selection
 */
export function SubscriberBadgeList({
  selectedSubscribers,
  sendToAll,
  recipientCount,
  activeSubscribersCount,
  onRemoveSubscriber,
  onRemoveAll,
  onSelectAll,
}: SubscriberBadgeListProps) {
  console.log("updated selectall", sendToAll);
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Label>Alıcılar ({recipientCount})</Label>
        <div className="flex gap-2">
          {/* Clear button - only show when there are selections */}
          {!sendToAll && selectedSubscribers.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemoveAll}
              className="text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4 mr-1" />
              Temizle
            </Button>
          )}

          {/* Select All button */}
          <Button type="button" variant="outline" size="sm" onClick={onSelectAll} disabled={sendToAll}>
            <Users className="w-4 h-4 mr-1" />
            Tüm Aktif Aboneler ({activeSubscribersCount})
          </Button>
        </div>
      </div>

      {/* Badge Container */}
      <div className="flex flex-wrap items-center gap-2 min-h-14 p-3 border border-neutral-800 rounded-md bg-neutral-900">
        {sendToAll ? (
          // "Everybody" badge
          <Badge variant="default" className="text-sm">
            <Users className="w-3 h-3 mr-1" />
            Everybody ({activeSubscribersCount})
            <button type="button" onClick={onRemoveAll} className="ml-2 hover:text-red-300">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ) : selectedSubscribers.length > 0 ? (
          // Individual subscriber badges
          selectedSubscribers.map((subscriber) => (
            <Badge key={subscriber.id} variant="secondary" className="text-sm">
              {subscriber.name} ({subscriber.email})
              <button
                type="button"
                onClick={() => onRemoveSubscriber(subscriber.id)}
                className="ml-2 hover:text-red-300"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))
        ) : (
          // Placeholder text
          <span className="text-neutral-500 text-sm">
            Aşağıdaki tablodan abone seçin veya "Tüm Aktif Aboneler" butonuna tıklayın
          </span>
        )}
      </div>
    </div>
  );
}
