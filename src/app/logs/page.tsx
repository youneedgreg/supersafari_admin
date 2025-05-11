"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface LoginLog {
  id: number
  user_id: number
  login_time: string
  ip_address: string
  user_agent: string
  user: {
    name: string
    email: string
    role: string
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs')
      const data = await response.json()
      
      if (data.status === 'OK') {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Login Logs</h1>
          <p className="text-gray-500 mt-1">View user login history</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logins</CardTitle>
          <CardDescription>List of recent user logins</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading logs...</div>
          ) : logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{log.user.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{log.user.email}</span>
                      <span className="mx-1">•</span>
                      <span>{log.user.role}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(log.login_time).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      IP: {log.ip_address}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No login logs found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 