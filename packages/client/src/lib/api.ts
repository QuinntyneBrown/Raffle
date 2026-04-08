import type {
  ActiveRafflePublic,
  AdminUser,
  CreateRaffleInput,
  DrawResult,
  LoginInput,
  RaffleWithCounts,
  SelfRegistrationInput,
  UpdateRaffleInput,
} from '@raffle/shared';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let csrfToken: string | null = null;

class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/admin/csrf-token`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new ApiError(res.status, 'CSRF_FETCH_FAILED', 'Failed to fetch CSRF token');
  }
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken!;
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && !csrfToken) {
    try {
      await fetchCsrfToken();
    } catch {
      // CSRF fetch may fail for unauthenticated routes — that's OK
    }
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorData: { error?: { code?: string; message?: string } } = {};
    try {
      errorData = await res.json();
    } catch {
      // response may not be JSON
    }
    const code = errorData.error?.code || 'UNKNOWN_ERROR';
    const message = errorData.error?.message || `Request failed with status ${res.status}`;

    // If CSRF token was invalid, fetch a new one and retry once
    if (res.status === 403 && code === 'INVALID_CSRF_TOKEN') {
      await fetchCsrfToken();
      headers['X-CSRF-Token'] = csrfToken!;
      const retryRes = await fetch(`${BASE_URL}${url}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });
      if (!retryRes.ok) {
        let retryError: { error?: { code?: string; message?: string } } = {};
        try {
          retryError = await retryRes.json();
        } catch {
          // ignore
        }
        throw new ApiError(
          retryRes.status,
          retryError.error?.code || 'UNKNOWN_ERROR',
          retryError.error?.message || `Request failed with status ${retryRes.status}`,
        );
      }
      if (retryRes.status === 204) return undefined as T;
      return retryRes.json();
    }

    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function get<T>(url: string): Promise<T> {
  return request<T>('GET', url);
}

function post<T>(url: string, body?: unknown): Promise<T> {
  return request<T>('POST', url, body);
}

function put<T>(url: string, body?: unknown): Promise<T> {
  return request<T>('PUT', url, body);
}

function del<T>(url: string): Promise<T> {
  return request<T>('DELETE', url);
}

// ── Public API ────────────────────────────────────────────────

export async function getActiveRaffle(): Promise<ActiveRafflePublic | null> {
  try {
    const data = await get<{ raffle: ActiveRafflePublic }>('/api/public/active-raffle');
    return data.raffle;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function drawName(): Promise<DrawResult> {
  const data = await post<{ result: DrawResult }>('/api/public/draw');
  return data.result;
}

export async function registerParticipant(name: string): Promise<{ name: string }> {
  const data = await post<{ participant: { name: string } }>('/api/public/register', { name } as SelfRegistrationInput);
  return data.participant;
}

// ── Admin Auth ────────────────────────────────────────────────

export async function login(input: LoginInput): Promise<AdminUser> {
  const data = await post<{ user: AdminUser }>('/api/auth/login', input);
  return data.user;
}

export async function logout(): Promise<void> {
  await post<unknown>('/api/auth/logout');
}

export async function getMe(): Promise<AdminUser> {
  const data = await get<{ user: AdminUser }>('/api/auth/me');
  return data.user;
}

// ── Admin Raffles ─────────────────────────────────────────────

export async function listRaffles(): Promise<RaffleWithCounts[]> {
  const data = await get<{ raffles: RaffleWithCounts[] }>('/api/admin/raffles');
  return data.raffles;
}

export interface RaffleDetail {
  id: string;
  name: string;
  heading: string;
  subheading: string | null;
  theme: string;
  animationStyle: string;
  presentationMode: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totalParticipants: number;
  drawnCount: number;
  remainingCount: number;
  participants: {
    id: string;
    raffleId: string;
    name: string;
    isDrawn: boolean;
    drawnAt: string | null;
    drawOrder: number | null;
    createdAt: string;
  }[];
}

export async function getRaffle(id: string): Promise<RaffleDetail> {
  const data = await get<{ raffle: RaffleDetail }>(`/api/admin/raffles/${id}`);
  return data.raffle;
}

export async function createRaffle(data: CreateRaffleInput): Promise<RaffleDetail> {
  const res = await post<{ raffle: RaffleDetail }>('/api/admin/raffles', data);
  return res.raffle;
}

export async function updateRaffle(id: string, data: UpdateRaffleInput): Promise<RaffleDetail> {
  const res = await put<{ raffle: RaffleDetail }>(`/api/admin/raffles/${id}`, data);
  return res.raffle;
}

export async function deleteRaffle(id: string): Promise<void> {
  await del<unknown>(`/api/admin/raffles/${id}`);
}

export async function resetDraws(id: string): Promise<void> {
  await post<unknown>(`/api/admin/raffles/${id}/reset`);
}

export async function activateRaffle(id: string): Promise<void> {
  await post<unknown>(`/api/admin/raffles/${id}/activate`);
}

export async function deactivateRaffle(id: string): Promise<void> {
  await post<unknown>(`/api/admin/raffles/${id}/deactivate`);
}

export { ApiError };
