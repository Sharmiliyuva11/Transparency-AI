import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FiLogOut, FiSettings } from 'react-icons/fi'
import { BsMoonStars } from 'react-icons/bs'
import { FaRegUserCircle } from 'react-icons/fa'

export type SidebarItem = {
  label: string
  icon: ReactNode
  active?: boolean
}

type DashboardLayoutProps = {
  role: string
  user: string
  sidebarItems: SidebarItem[]
  children: ReactNode
}

export function DashboardLayout({ role, user, sidebarItems, children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="logo-badge">O</div>
          <div>
            <h2>AI Expense Transparency</h2>
            <p>Financial Trust Through AI</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`sidebar-link${item.active ? ' active' : ''}`}
              type="button"
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" type="button">
          <FiLogOut />
          Logout
        </button>
      </aside>
      <div className="dashboard-body">
        <header className="dashboard-header">
          <div>
            <p className="header-eyebrow">Welcome back</p>
            <h1>{role}</h1>
          </div>
          <div className="header-actions">
            <button className="icon-button" type="button">
              <BsMoonStars />
            </button>
            <button className="icon-button" type="button">
              <FiSettings />
            </button>
            <div className="header-user">
              <FaRegUserCircle />
              <div>
                <p>{user}</p>
                <span>{role}</span>
              </div>
            </div>
            <Link className="accent-button" to="/">
              Upload Receipt
            </Link>
          </div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  )
}
