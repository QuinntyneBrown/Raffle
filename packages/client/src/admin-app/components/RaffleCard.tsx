import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { RaffleWithCounts } from '@raffle/shared';
import { Badge } from '@/shared-ui/Badge';
import { Button } from '@/shared-ui/Button';

interface RaffleCardProps {
  raffle: RaffleWithCounts;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RaffleCard({ raffle, onActivate, onDeactivate, onDelete }: RaffleCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--fg-muted)]/30 transition-colors">
      {/* Top: Name + Badge */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-[var(--fg-primary)] truncate">
          {raffle.name}
        </h3>
        <Badge variant={raffle.isActive ? 'active' : 'inactive'}>
          {raffle.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Stats as inline text */}
      <div className="flex gap-6 mb-3">
        <span className="text-[13px] text-[var(--fg-muted)]">{raffle.totalParticipants} participants</span>
        <span className="text-[13px] text-[var(--fg-muted)]">{raffle.drawnCount} drawn</span>
        <span className="text-[13px] text-[var(--fg-muted)]">{raffle.remainingCount} remaining</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {raffle.isActive ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDeactivate(raffle.id)}
          >
            Deactivate
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onActivate(raffle.id)}
          >
            Activate
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/admin/raffles/${raffle.id}`)}
        >
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(raffle.id)}
          className="text-[var(--error)] hover:text-[var(--error)]"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
