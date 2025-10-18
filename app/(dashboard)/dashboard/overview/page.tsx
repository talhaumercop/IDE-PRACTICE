'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Menu, LogOut, Package, ShoppingCart, Settings, LayoutDashboard, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import LogoutButton from '@/modules/auth/components/logout'
import TotalSales from '@/components/TotalSales'
import SalesChart from '@/components/SalesChart'

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const userName = 'Talha' // You can replace with actual user data later

  return (
     <div className="flex w-full min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-64"}`}
      >
        <div className="flex flex-col h-full p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold tracking-tight text-primary">🛍️ Admin Panel</h1>
            <button
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {[
              { href: "/dashboard/overview", icon: LayoutDashboard, label: "Dashboard" },
              { href: "/dashboard/products", icon: Package, label: "Products" },
              { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders" },
              { href: "/dashboard/customers", icon: Users, label: "Customers" },
              { href: "/dashboard/settings", icon: Settings, label: "Settings" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
              >
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
          </nav>

          <Separator className="my-4" />
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b shadow-sm flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-600 hover:text-gray-800"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg font-semibold tracking-tight">
              Welcome back, {userName} 👋
            </h2>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 p-6 md:p-10 space-y-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                title: "Manage Products",
                desc: "Add, edit, and track your inventory",
                icon: <Package size={28} className="mx-auto text-blue-500 mb-3" />,
                href: "/dashboard/products",
              },
              {
                title: "View Orders",
                desc: "Track and manage customer orders",
                icon: <ShoppingCart size={28} className="mx-auto text-green-500 mb-3" />,
                href: "/dashboard/orders",
              },
              {
                title: "Customers",
                desc: "View your customer list and activity",
                icon: <Users size={28} className="mx-auto text-purple-500 mb-3" />,
                href: "/dashboard/customers",
              },
            ].map((card) => (
              <Card
                key={card.title}
                className="hover:shadow-lg transition border border-gray-100 bg-white"
              >
                <CardContent className="p-6 text-center">
                  {card.icon}
                  <h3 className="font-semibold mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{card.desc}</p>
                  <Link href={card.href}>
                    <Button variant="default" size="sm">
                      Go
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Analytics Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Total Sales Overview</h3>
              <TotalSales />
            </div>

            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Sales Chart</h3>
              <SalesChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage
