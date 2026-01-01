import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type ShiftStatus = 'open' | 'claimed' | 'completed' | 'cancelled';

export interface Shift {
  id: string;
  manager_id: string;
  title: string;
  description: string | null;
  required_skills: string[];
  location: unknown;
  start_time: string;
  end_time: string;
  status: ShiftStatus;
  created_at: string;
}

export interface ShiftInsert {
  manager_id: string;
  title: string;
  description?: string | null;
  required_skills?: string[];
  location?: unknown;
  start_time: string;
  end_time: string;
  status?: ShiftStatus;
}

export interface ShiftUpdate {
  title?: string;
  description?: string | null;
  required_skills?: string[];
  location?: unknown;
  start_time?: string;
  end_time?: string;
  status?: ShiftStatus;
}

export interface ShiftClaim {
  id: string;
  shift_id: string;
  worker_id: string;
  claimed_at: string;
}

export const fetchManagerShifts = (managerId: string) => {
  return supabase
    .from('shifts')
    .select('*')
    .eq('manager_id', managerId)
    .order('start_time', { ascending: true });
};

export const fetchOpenShifts = () => {
  return supabase
    .from('shifts')
    .select('*')
    .eq('status', 'open')
    .order('start_time', { ascending: true });
};

export const createShift = (payload: ShiftInsert) => {
  return supabase
    .from('shifts')
    .insert(payload)
    .select('*')
    .single();
};

export const updateShift = (shiftId: string, updates: ShiftUpdate) => {
  return supabase
    .from('shifts')
    .update(updates)
    .eq('id', shiftId)
    .select('*')
    .single();
};

export const updateShiftStatus = (shiftId: string, status: ShiftStatus) => {
  return supabase
    .from('shifts')
    .update({ status })
    .eq('id', shiftId)
    .select('*')
    .single();
};

export const deleteShift = (shiftId: string) => {
  return supabase
    .from('shifts')
    .delete()
    .eq('id', shiftId);
};

export const claimShift = (shiftId: string, workerId: string) => {
  return supabase
    .from('shift_claims')
    .insert({ shift_id: shiftId, worker_id: workerId })
    .select('*')
    .single();
};

export const cancelClaim = (claimId: string) => {
  return supabase
    .from('shift_claims')
    .delete()
    .eq('id', claimId);
};

export const cancelClaimForShift = (shiftId: string, workerId: string) => {
  return supabase
    .from('shift_claims')
    .delete()
    .eq('shift_id', shiftId)
    .eq('worker_id', workerId);
};

export const subscribeToShifts = (onChange: (payload: unknown) => void): RealtimeChannel => {
  return supabase
    .channel('shifts-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, onChange)
    .subscribe();
};

export const subscribeToShiftClaims = (onChange: (payload: unknown) => void): RealtimeChannel => {
  return supabase
    .channel('shift-claims-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_claims' }, onChange)
    .subscribe();
};
