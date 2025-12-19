import type { HTMLAttributes } from 'react'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showPercentage?: boolean
  title: string
}

export function Progress({
  value,
  title,
  max = 100,
  showPercentage = true,
  className = '',
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`w-full ${className}`} {...props}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <span className="text-sm font-bold text-blue-600">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div
        className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
