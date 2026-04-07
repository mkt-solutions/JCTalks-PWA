export interface UserProfile {
  name: string;
  birthdate: string;
  gender: string;
  language: string;
  createdAt: string;
  isPremium: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const STORAGE_KEYS = {
  USER: 'jc_talks_user',
  CHAT: 'jc_talks_chat',
};

export function calculateAge(birthdate: string): number {
  const [year, month, day] = birthdate.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString();
}

export function getTrialDaysRemaining(createdAt: string): number {
  const created = new Date(createdAt);
  const today = new Date();
  const diffTime = today.getTime() - created.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, 3 - diffDays);
}
