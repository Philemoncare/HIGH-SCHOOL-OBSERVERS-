// Design System - Shared styles and utilities for consistent, polished UI

export const gradients = {
  primary: 'bg-gradient-to-r from-red-600 via-red-700 to-red-800',
  secondary: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600',
  accent: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600',
  info: 'bg-gradient-to-r from-blue-500 to-cyan-600',
  dark: 'bg-gradient-to-r from-gray-800 via-gray-900 to-black',
  light: 'bg-gradient-to-r from-gray-50 via-white to-gray-50',
  hero: 'bg-gradient-to-br from-red-600 via-red-700 via-pink-600 to-purple-700',
  card: 'bg-gradient-to-br from-white via-gray-50 to-white',
}

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  colored: 'shadow-lg shadow-red-500/20',
  coloredXL: 'shadow-2xl shadow-red-500/30',
  glow: 'shadow-lg shadow-red-500/50',
  inner: 'shadow-inner',
}

export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 }
  },
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  }
}

export const cardStyles = {
  base: 'bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden',
  hover: 'transition-all duration-300 hover:shadow-xl hover:shadow-red-500/20 hover:-translate-y-1',
  elevated: 'bg-white rounded-2xl shadow-2xl shadow-red-500/20 border border-gray-100',
  gradient: 'bg-gradient-to-br from-white via-red-50/30 to-white rounded-2xl shadow-xl border border-red-100/50',
}

export const buttonStyles = {
  primary: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:-translate-y-0.5',
  secondary: 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold px-6 py-3 rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5',
  outline: 'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300',
  ghost: 'text-gray-700 hover:text-red-600 hover:bg-red-50 font-medium px-4 py-2 rounded-lg transition-all duration-300',
}

export const textStyles = {
  heading1: 'text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight',
  heading2: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
  heading3: 'text-2xl md:text-3xl font-bold',
  heading4: 'text-xl md:text-2xl font-semibold',
  body: 'text-base md:text-lg text-gray-700 leading-relaxed',
  small: 'text-sm text-gray-600',
  gradient: 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent',
}

export const sectionStyles = {
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 md:py-16 lg:py-20',
  sectionLarge: 'py-16 md:py-20 lg:py-24',
}

export const badgeStyles = {
  primary: 'bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md',
  secondary: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-md',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md',
  info: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md',
}
