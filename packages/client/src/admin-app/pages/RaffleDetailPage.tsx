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
          <h1 className="font-anton text-[28px] text-[var(--fg-primary)] tracking-[1px]">{raffle.name}</h1>
          <Badge variant={raffle.isActive ? 'active' : 'inactive'}>
            {raffle.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/raffles/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResetDialogOpen(true)}
            disabled={drawnCount === 0}
            className="text-[var(--warning)] hover:text-[var(--warning)]"
          >
            Reset Draws
          </Button>
          {raffle.isActive ? (
            <Button variant="ghost" size="sm" onClick={handleDeactivate} className="text-[var(--error)] hover:text-[var(--error)]">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-[32px] font-bold text-[var(--accent)] font-mono">{totalParticipants}</p>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1">Total Participants</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-[32px] font-bold text-[var(--success)] font-mono">{drawnCount}</p>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1">Names Drawn</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-[32px] font-bold text-[var(--fg-primary)] font-mono">{remainingCount}</p>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1">Remaining</p>
        </div>
      </div>

      {/* Two columns: Participants | Draw History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Participants list */}
        <div>
          <h2 className="text-base font-semibold text-[var(--fg-primary)] mb-3">Participants</h2>
          <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-1">
            {participants.map((p, index) => (
              <div
                key={p.id}
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-md ${
                  index % 2 === 1 ? 'bg-[var(--bg-secondary)]' : ''
                }`}
              >
                <span className="text-[13px] text-[var(--fg-primary)]">
                  {p.name}
                </span>
                <span className={`text-[11px] ${
                  p.isDrawn ? 'text-[var(--success)]' : 'text-[var(--fg-muted)]'
                }`}>
                  {p.isDrawn ? 'Drawn' : 'Available'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Draw History */}
        <div>
          <h2 className="text-base font-semibold text-[var(--fg-primary)] mb-3">Draw History</h2>
          {drawHistory.length === 0 ? (
            <p className="text-sm text-[var(--fg-muted)] text-center py-8">
              No names have been drawn yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto pr-1">
              {drawHistory.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-secondary)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-semibold text-[var(--accent)] font-mono">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-[var(--fg-primary)]">{p.name}</span>
                  </div>
                  {p.drawnAt && (
                    <span className="text-xs text-[var(--fg-muted)]">
                      {new Date(p.drawnAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
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
        title="Reset Raffle Draws"
        description="Are you sure you want to reset all draws? All draw history will be cleared and all names will be returned to the available pool."
        confirmLabel="Reset Draws"
        confirmVariant="danger"
        loading={resetLoading}
        icon={
          <div className="w-12 h-12 rounded-full bg-[var(--warning-light)] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--warning)]"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </div>
        }
      />
    </div>
  );
}
