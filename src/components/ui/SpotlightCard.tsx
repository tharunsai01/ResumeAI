import { useRef, useState, forwardRef, type HTMLAttributes } from "react"

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the spotlight gradient in pixels */
  spotlightSize?: number
  /** Color of the spotlight, any valid CSS color */
  spotlightColor?: string
}

const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  (
    {
      children,
      className = "",
      spotlightSize = 300,
      spotlightColor = "rgba(79, 70, 229, 0.12)",
      style,
      ...rest
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const handleMouseEnter = () => setOpacity(1)
    const handleMouseLeave = () => setOpacity(0)

    return (
      <div
        ref={(node) => {
          // Support both internal ref and forwarded ref
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof ref === "function") ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }}
        className={`relative ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={style}
        {...rest}
      >
        {/* Spotlight gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 65%)`,
          }}
        />
        {children}
      </div>
    )
  }
)

SpotlightCard.displayName = "SpotlightCard"

export default SpotlightCard
