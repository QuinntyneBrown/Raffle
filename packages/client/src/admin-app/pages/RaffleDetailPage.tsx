import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '@/lib/api';
import type { RaffleDetail } from '@/lib/api';
import { Badge } from '@/shared-ui/Badge';
import { Button } from '@/shared-ui/Button';
import { Spinner } from '@/shared-ui/Spinner';
import { useToast } from '@/shared-ui/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function RaffleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [raffle, setRaffle] = useState<RaffleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const loadRaffle = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getRaffle(id);
      setRaffle(data);
    } catch {
      addToast('Failed to load raffle', 'error');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, addToast]);

  useEffect(() => {
    loadRaffle();
  }, [loadRaffle]);

  const handleActivate = async () => {
    if (!id) return;
    try {
      await api.activateRaffle(id);
      addToast('Raffle activated', 'success');
      loadRaffle();
    } catch {
      addToast('Failed to activate raffle', 'error');
    }
  };

  const handleDeactivate = async () => {
    if (!id) return;
    try {
      await api.deactivateRaffle(id);
      addToast('Raffle deactivated', 'success');
      loadRaffle();
    } catch {
      addToast('Failed to deactivate raffle', 'error');
    }
  };

  const handleReset = async () => {
    if (!id) return;
    try {
      setResetLoading(true);
      await api.resetDraws(id);
      addToast('Draws reset successfully', 'success');
      setResetDialogOpen(false);
      loadRaffle();
    } catch {
      addToast('Failed to reset draws', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading || !raffle) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalParticipants = raffle.totalParticipants;
  const drawnCount = raffle.drawnCount;
  const remainingCount = raffle.remainingCount;
  const participants = raffle.participants;

  // Sort draw history by drawOrder
  const drawHistory = participants
    .filter((p) => p.isDrawn)
    .sort((a, b) => (a.drawOrder || 0) - (b.drawOrder || 0));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[var(--fg-primary)]">{raffle.name}</h1>
          <Badge variant={raffle.isActive ? 'active' : 'inactive'}>
            {raffle.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/admin/raffles/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setResetDialogOpen(true)}
            disabled={drawnCount === 0}
          >
            Reset Draws
          </Button>
          {raffle.isActive ? (
            <Button variant="secondary" size="sm" onClick={handleDeactivate}>
              Deactivate
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleActivate}>
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-[var(--fg-primary)]">{totalParticipants}</p>
          <p className="text-sm text-[var(--fg-muted)] mt-1">Total Participants</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-[var(--accent)]">{drawnCount}</p>
          <p className="text-sm text-[var(--fg-muted)] mt-1">Names Drawn</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-[var(--success)]">{remainingCount}</p>
          <p className="text-sm text-[var(--fg-muted)] mt-1">Remaining</p>
        </div>
      </div>

      {/* Two columns: Participants | Draw History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants list */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[var(--fg-primary)] mb-4">Participants</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-primary)]/50"
              >
                <span
                  className={`text-sm ${
                    p.isDrawn ? 'text-[var(--fg-muted)] line-through' : 'text-[var(--fg-primary)]'
                  }`}
                >
                  {p.name}
                </span>
                <Badge variant={p.isDrawn ? 'warning' : 'active'}>
                  {p.isDrawn ? 'Drawn' : 'Available'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Draw History */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[var(--fg-primary)] mb-4">Draw History</h2>
          {drawHistory.length === 0 ? (
            <p className="text-sm text-[var(--fg-muted)] text-center py-8">
              No names have been drawn yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {drawHistory.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--bg-primary)]/50"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-sm font-bold text-[var(--accent)]">
                    {index + 1}
                  </span>
                  <span className="text-sm text-[var(--fg-primary)] flex-1">{p.name}</span>
                  {p.drawnAt && (
                    <span className="text-xs text-[var(--fg-muted)]">
                      {new Date(p.drawnAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reset Draws Confirmation */}
      <ConfirmDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Reset All Draws"
        description="Are you sure you want to reset all draws? This will mark all participants as undrawn and clear the draw history."
        confirmLabel="Reset Draws"
        confirmVariant="danger"
        loading={resetLoading}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        }
      />
    </div>
  );
}
