import React from 'react'
import {
  BarChart3,
  CreditCard,
  Search,
  ShoppingBag,
  AlertTriangle,
  Ban,
  Bell,
  BookOpen,
  Camera,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  Crown,
  DollarSign,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Home as HomeIcon,
  Hourglass,
  Leaf,
  Lock,
  Lightbulb,
  Mic,
  Mountain,
  PauseCircle,
  RefreshCcw,
  School,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  User,
  Users,
  Dumbbell,
  Wrench,
  XCircle,
  Newspaper,
  LogOut,
  Rocket,
  Eye,
  FileText,
  Gift,
  Laptop,
  Package,
  Pencil,
  PenSquare,
  Trash2,
  Briefcase,
  Shirt,
  ArrowUp,
} from 'lucide-react'

const normalizeSymbol = (symbol) => String(symbol || '').replace(/\uFE0F/g, '').trim()

const ICON_MAP = {
  // Home page
  '🌐': Globe,
  '🌱': Leaf,
  '🚫': Ban,
  '🤝': Handshake,
  '📚': BookOpen,
  '🌟': Star,
  '💪': Dumbbell,

  // Events
  '📅': Calendar,
  '🎤': Mic,
  '🔧': Wrench,
  '🎓': GraduationCap,
  '📋': ClipboardList,
  '🏔': Mountain,

  // Payments / admin
  '✅': CheckCircle2,
  '❌': XCircle,
  '⏳': Hourglass,
  '⏸': PauseCircle,
  '💝': Heart,
  '🛒': ShoppingCart,
  '💰': DollarSign,
  '💳': CreditCard,
  '📊': BarChart3,
  '🛍': ShoppingBag,
  '🔍': Search,
  '🔎': Search,
  '🏥': Heart,
  '🚨': AlertTriangle,
  '🔄': RefreshCcw,
  '💡': Lightbulb,
  '🚀': Rocket,
  '🏠': HomeIcon,
  '📰': Newspaper,
  '🚪': LogOut,
  '📦': Package,
  '✏': Pencil,
  '📝': PenSquare,
  '👁': Eye,
  '📄': FileText,
  '🗑': Trash2,
  '⬆': ArrowUp,
  '🎁': Gift,
  '💻': Laptop,
  '👕': Shirt,
  '👜': Briefcase,

  // Users / roles / profile sections
  '👤': User,
  '👥': Users,
  '👑': Crown,
  '⭐': Star,
  '🏫': School,
  '🏘': HomeIcon,
  '🔒': Lock,
  '🔔': Bell,
  '🛡': Shield,
  '🕒': Clock,
  '⚙': Settings,
  '📷': Camera,

  // named symbols
  home: HomeIcon,
}

export default function RealIcon({
  symbol,
  className = 'w-5 h-5',
  colorClassName = 'text-white',
  badge = false,
  badgeClassName = 'w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900',
  title,
}) {
  const key = normalizeSymbol(symbol)
  const Icon = ICON_MAP[key] || ICON_MAP[key.replace(/\u200D/g, '')] || Star

  if (!badge) {
    return <Icon className={`${className} ${colorClassName}`} aria-label={title || key} />
  }

  return (
    <span className={`inline-flex items-center justify-center ${badgeClassName}`} title={title || key}>
      <Icon className={`${className} ${colorClassName}`} aria-hidden="true" />
    </span>
  )
}

