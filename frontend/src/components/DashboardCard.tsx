import type { ReactNode } from 'react'

type DashboardCardProps = {
  title: string
  value: string | number
  icon: ReactNode
  color: string
  active?: boolean
  onClick?: () => void
}
export function DashboardCard({
  title,
  value,
  icon,
  color,
  active,
  onClick,
}: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white
        p-6
        rounded-2xl
        shadow
        transition-all
        hover:shadow-lg
        cursor-pointer

        ${
          active
            ? 'ring-2 ring-blue-500'
            : ''
        }
      `}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            {title}
          </p>

          <h2
            className={`text-4xl font-black mt-2 ${color}`}
          >
            {value}
          </h2>
        </div>

        {icon}
      </div>
    </div>
  )
}