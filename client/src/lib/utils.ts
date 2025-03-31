import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Calculate player rating badge and title based on rating
export function getRatingInfo(rating: number): { 
  badgeColor: string; 
  title: string;
  iconClass: string;
} {
  if (rating >= 2000) {
    return {
      badgeColor: 'bg-[#FFC107] text-white',
      title: 'Master',
      iconClass: 'ri-award-fill'
    };
  } else if (rating >= 1800) {
    return {
      badgeColor: 'bg-blue-500 text-white',
      title: 'Expert',
      iconClass: 'ri-shield-star-line'
    };
  } else if (rating >= 1600) {
    return {
      badgeColor: 'bg-green-600 text-white',
      title: 'Skilled',
      iconClass: 'ri-user-star-line'
    };
  } else if (rating >= 1400) {
    return {
      badgeColor: 'bg-purple-500 text-white',
      title: 'Intermediate',
      iconClass: 'ri-user-line'
    };
  } else {
    return {
      badgeColor: 'bg-gray-500 text-white',
      title: 'Beginner',
      iconClass: 'ri-user-line'
    };
  }
}

// Get rank text color based on position
export function getRankColor(position: number): string {
  if (position === 1) return 'text-[#FFC107]';
  if (position === 2) return 'text-gray-500';
  if (position === 3) return 'text-amber-700';
  return 'text-gray-700';
}

// Get the name for a winner value
export function getWinnerName(winner: 'black' | 'white' | 'draw' | null): string {
  if (winner === 'black') return 'Black';
  if (winner === 'white') return 'White';
  if (winner === 'draw') return 'Draw';
  return 'In Progress';
}

// Determine if the user is on a mobile device
export function isMobile(): boolean {
  return window.innerWidth < 768;
}
