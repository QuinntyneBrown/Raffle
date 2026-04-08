import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RaffleWithCounts } from '@raffle/shared';
import * as api from '@/lib/api';
import { Button } from '@/shared-ui/Button';
import { Spinner } from '@/shared-ui/Spinner';
import { useToast } from '@/shared-ui/ToastContext';
import { RaffleCard } from '../components/RaffleCard';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function DashboardPage() {
  const [raffles, setRaffles] = useState<RaffleWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const loadRaffles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listRaffles();
      setRaffles(data);
    } catch {
      addToast('Failed to load raffles', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadRaffles();
  }, [loadRaffles]);

  const handleActivate = async (id: string) => {
    try {
      await api.activateRaffle(id);
      addToast('Raffle activated', 'success');
      loadRaffles();
    } catch {
      addToast('Failed to activate raffle', 'error');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.deactivateRaffle(id);
      addToast('Raffle deactivated', 'success');
      loadRaffles();
    } catch {
      addToast('Failed to deactivate raffle', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.deleteRaffle(deleteTarget);
      addToast('Raffle deleted', 'success');
      setDeleteTarget(null);
      loadRaffles();
    } catch {
      addToast('Failed to delete raffle', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-anton text-[28px] text-[var(--fg-primary)] tracking-[1px]">Your Raffles</h1>
        <Button onClick={() => navigate('/admin/create')}>
          <span className="mr-2">+</span> New Raffle
        </Button>
      </div>

      {/* Raffle list */}
      {raffles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-[var(--fg-muted)] mb-4">
            You haven't created any raffles yet.
          </p>
          <Button onClick={() => navigate('/admin/create')}>
            Create Your First Raffle
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {raffles.map((raffle) => (
            <RaffleCard
              key={raffle.id}
              raffle={raffle}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Raffle"
        description="Are you sure you want to delete this raffle? This action cannot be undone. All participant data and draw history will be permanently removed."
        confirmLabel="Delete Raffle"
        confirmVariant="danger"
        loading={deleteLoading}
        icon={
          <div className="w-12 h-12 rounded-full bg-[var(--error-light)] flex items-center justify-center">
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
              className="text-[var(--error)]"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </div>
        }
      />
    </div>
  );
}
