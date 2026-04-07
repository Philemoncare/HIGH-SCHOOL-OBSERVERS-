import { useNavigation } from '../contexts/NavigationContext'
import { ArrowLeft } from 'lucide-react'

/**
 * Renders a "Back" control that goes to the previous in-app location when possible,
 * otherwise to the given fallback path. Use for detail pages and admin sub-pages
 * so back goes to where the user came from (e.g. list or dashboard), not always home.
 *
 * @param {string} fallbackPath - Path when there is no previous history (e.g. '/events', '/admin')
 * @param {React.ReactNode} children - Label, e.g. "Back to Events" (default: "Back")
 * @param {string} className - Optional Tailwind classes
 * @param {boolean} showIcon - Show ArrowLeft icon (default true)
 */
const BackButton = ({
  fallbackPath = '/',
  children = 'Back',
  className = 'text-red-600 font-medium hover:underline flex items-center gap-1',
  showIcon = true
}) => {
  const { goBack } = useNavigation()

  return (
    <button
      type="button"
      onClick={() => goBack(fallbackPath)}
      className={className}
    >
      {showIcon && <ArrowLeft className="w-4 h-4 flex-shrink-0" />}
      {children}
    </button>
  )
}

export default BackButton
