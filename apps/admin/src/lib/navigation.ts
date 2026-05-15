import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wallet,
  Settings,
  BarChart3,
  FileText,
  UserPlus,
  Wrench,
  User,
  ClipboardList,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  LifeBuoy,
  Key,
  Search,
  UserCog
} from 'lucide-react';
import { UserRole } from '@repo/types';

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

const ALL_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.OPERATOR, UserRole.PROVIDER, UserRole.WORKER];

export const navigationItems: NavItem[] = [
  // Shared
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ALL_ROLES,
  },
  
  // Admin & Operator
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.OPERATOR],
  },
  {
    label: 'Operator',
    href: '/dashboard/operators',
    icon: UserPlus,
    roles: [UserRole.ADMIN],
  },
  
  // Shared Management
  {
    label: 'Booking Details',
    href: '/dashboard/bookings',
    icon: Briefcase,
    roles: ALL_ROLES,
  },
  {
    label: 'Wallet',
    href: '/dashboard/wallets',
    icon: Wallet,
    roles: ALL_ROLES,
  },
  
  // Specialized Admin/Operator
  {
    label: 'KYC',
    href: '/dashboard/kyc',
    icon: ShieldCheck,
    roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.PROVIDER, UserRole.WORKER],
  },
  {
    label: 'QR Code',
    href: '/dashboard/qr-codes',
    icon: QrCode,
    roles: ALL_ROLES,
  },
  
  // Admin Only
  {
    label: 'Fine & Penalty',
    href: '/dashboard/penalties',
    icon: AlertTriangle,
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Technical Issues',
    href: '/dashboard/issues',
    icon: LifeBuoy,
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Analysis Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    roles: [UserRole.ADMIN],
  },

  // Provider/Worker Specific
  {
    label: 'Search Works',
    href: '/dashboard/search-works',
    icon: Search,
    roles: [UserRole.WORKER],
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    roles: [UserRole.PROVIDER, UserRole.WORKER],
  },
  {
    label: 'Support Ticket',
    href: '/dashboard/support',
    icon: LifeBuoy,
    roles: [UserRole.PROVIDER, UserRole.WORKER],
  },
  
  // Shared Account
  {
    label: 'Change Password',
    href: '/dashboard/change-password',
    icon: Key,
    roles: ALL_ROLES,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: [UserRole.ADMIN, UserRole.PROVIDER, UserRole.WORKER],
  },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navigationItems.filter((item) => item.roles.includes(role));
}

export function getDashboardRedirect(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/dashboard/admin';
    case UserRole.OPERATOR:
      return '/dashboard/operator';
    case UserRole.PROVIDER:
      return '/dashboard/provider';
    case UserRole.WORKER:
      return '/dashboard/worker';
    default:
      return '/dashboard';
  }
}

export const roleBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  OPERATOR: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  PROVIDER: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  WORKER: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};
