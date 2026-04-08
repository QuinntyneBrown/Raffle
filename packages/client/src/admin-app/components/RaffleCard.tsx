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
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--fg-muted)]/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-[var(--fg-primary)] truncate">
              {raffle.name}
            </h3>
            <Badge variant={raffle.isActive ? 'active' : 'inactive'}>
              {raffle.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-[var(--fg-muted)] truncate">
            {raffle.heading}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[var(--bg-primary)] rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-[var(--fg-primary)]">{raffle.totalParticipants}</p>
          <p className="text-xs text-[var(--fg-muted)]">Participants</p>
        </div>
        <div className="bg-[var(--bg-primary)] rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-[var(--accent)]">{raffle.drawnCount}</p>
          <p className="text-xs text-[var(--fg-muted)]">Drawn</p>
        </div>
        <div className="bg-[var(--bg-primary)] rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-[var(--success)]">{raffle.remainingCount}</p>
          <p className="text-xs text-[var(--fg-muted)]">Remaining</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
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
          variant="danger"
          size="sm"
          onClick={() => onDelete(raffle.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
