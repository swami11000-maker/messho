import { Crown, Landmark, LayoutDashboard, LifeBuoy, LineChart, RefreshCcw, Settings, ShieldCheck, ShoppingBag, Trophy, Users, CreditCard, MessagesSquare, icons, Wallet2Icon, WalletCardsIcon, Wallet } from "lucide-react";

export const plans = [
  { id: 'starter', name: 'Starter', price: 499, spins: 1, rewards: '₹650 - ₹750', bestFor: 'Trying it out', color: 'from-emerald-400 to-green-600' },
  { id: 'basic', name: 'Basic', price: 999, spins: 1, rewards: '₹1,750 - ₹1,900', bestFor: 'Getting started', color: 'from-blue-400 to-blue-600' },
  { id: 'standard', name: 'Standard', price: 1499, spins: 2, rewards: '₹2,800 - ₹3,000', bestFor: 'Most balanced', popular: true, color: 'from-violet-500 to-purple-700' },
  { id: 'advanced', name: 'Advanced', price: 1999, spins: 3, rewards: '₹3,900 - ₹4,100', bestFor: 'More rewards', color: 'from-orange-400 to-red-500' },
  { id: 'pro', name: 'Pro', price: 3000, spins: 4, rewards: '₹6,000 - ₹6,300', bestFor: 'High rewards', color: 'from-yellow-400 to-orange-500' },
  { id: 'elite', name: 'Elite', price: 5000, spins: 6, rewards: '₹10,500 - ₹11,500', bestFor: 'Max rewards', color: 'from-cyan-400 to-blue-600' },
  { id: 'legend', name: 'Legend', price: 10000, spins: 13, rewards: '₹21,000 - ₹22,500', bestFor: 'Ultimate rewards', color: 'from-fuchsia-500 to-purple-700' }
];

export const customerNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {label : 'Wallet' , href: '/dashboard/wallet',icon : Wallet},
  { label: 'Buy Membership', href: '/dashboard/membership', icon: ShoppingBag },
  { label: 'My Cards', href: '/dashboard/cards', icon: CreditCard },
  { label: 'Daily Spin', href: '/dashboard/spin', icon: RefreshCcw },
  { label: 'Rewards', href: '/dashboard/rewards', icon: Trophy },
  { label: 'Referrals', href: '/dashboard/referrals', icon: Users },
  { label: 'Transactions', href: '/dashboard/transactions', icon: LineChart },
  { label: 'Withdraw', href: '/dashboard/withdraw', icon: Landmark },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Support', href: '/dashboard/support', icon: LifeBuoy }
];

export const adminNav = [
  { label: 'Command Center', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Withdrawal Desk', href: '/admin/withdrawals', icon: Landmark },
  { label: 'Reward Control', href: '/admin/reward-control', icon: Crown },
  { label: 'Treasury', href: '/admin/treasury', icon: ShieldCheck },
  { label: 'Audit Logs', href: '/admin/audit', icon: LineChart },
  { label: 'Support Tickets', href: '/admin/support', icon: MessagesSquare },
  { label: 'Admin Settings', href: '/admin/settings', icon: Settings }
];

export const wheelValues = ['₹0', '₹35', '₹50', '₹55', '₹76', '₹114', '₹230'];
