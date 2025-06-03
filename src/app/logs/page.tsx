"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2 } from "lucide-react"
import { toast } from "sonner"
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface AutoTableOptions {
  head?: string[][];
  body?: (string | number)[][];
  startY?: number;
  theme?: string;
  styles?: {
    fontSize?: number;
  };
  headStyles?: {
    fillColor?: number[];
  };
}

// Add type declaration for jsPDF autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

// Updated interface to match the actual API response structure
interface Log {
  id: number
  user_id: number
  action_type?: string
  action_description?: string
  entity_type?: string
  entity_id?: number
  login_time?: string
  created_at?: string
  ip_address: string
  user_agent: string
  // Flattened user fields as they come from the API
  user_name: string
  user_email: string
  user_role: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
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
      toast.error('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLog = async (logId: number) => {
    if (!confirm('Are you sure you want to delete this log?')) return

    try {
      const response = await fetch(`/api/logs/${logId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.status === 'OK') {
        toast.success('Log deleted successfully')
        fetchLogs()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Failed to delete log:', error)
      toast.error('Failed to delete log')
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('System Logs Report', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22)

    // Prepare table data - updated to use the flattened user fields
    const tableData = logs.map(log => [
      log.user_name,
      log.user_email,
      log.user_role,
      log.action_type || 'Login',
      log.action_description || 'User login',
      log.entity_type || 'N/A',
      log.entity_id || 'N/A',
      log.created_at ? new Date(log.created_at).toLocaleString() : (log.login_time ? new Date(log.login_time).toLocaleString() : 'N/A'),
      log.ip_address
    ])

    // Add table
    doc.autoTable({
      head: [['User', 'Email', 'Role', 'Action', 'Description', 'Entity Type', 'Entity ID', 'Time', 'IP Address']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    })

    // Save the PDF
    doc.save('system-logs.pdf')
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-500 mt-1">View all system activity logs</p>
        </div>
        <Button onClick={exportToPDF} className="mt-4 md:mt-0">
          <Download className="w-4 h-4 mr-2" />
          Export to PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>List of all system activities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading logs...</div>
          ) : logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={`${log.id}-${index}`} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{log.user_name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{log.user_email}</span>
                      <span className="mx-1">•</span>
                      <span>{log.user_role}</span>
                      <span className="mx-1">•</span>
                      <span>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : (log.login_time ? new Date(log.login_time).toLocaleString() : 'N/A')}
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">{log.action_type || 'Login'}:</span>{' '}
                      {log.action_description || 'User login'}
                      {log.entity_type && (
                        <>
                          {' '}
                          <span className="text-gray-500">
                            ({log.entity_type}
                            {log.entity_id ? ` #${log.entity_id}` : ''})
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      IP: {log.ip_address}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No logs found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}