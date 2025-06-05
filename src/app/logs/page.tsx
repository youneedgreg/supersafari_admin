"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Trash2, AlertTriangle } from "lucide-react"
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
  const [clearingLogs, setClearingLogs] = useState(false)
  const [logTypeToDelete, setLogTypeToDelete] = useState<string>('all')

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
      const response = await fetch(`/api/logs?id=${logId}`, {
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

  const handleClearLogs = async () => {
    const typeLabels = {
      'login': 'login logs',
      'activity': 'activity logs', 
      'all': 'all logs'
    }
    
    const confirmMessage = `Are you sure you want to clear ${typeLabels[logTypeToDelete as keyof typeof typeLabels]}? This action cannot be undone.`
    
    if (!confirm(confirmMessage)) return
    
    setClearingLogs(true)
    try {
      const response = await fetch(`/api/logs?action=clear-logs&type=${logTypeToDelete}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.status === 'OK') {
        toast.success(data.message)
        // Refresh logs to show updated list
        fetchLogs()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Failed to clear logs:', error)
      toast.error('Failed to clear logs')
    } finally {
      setClearingLogs(false)
    }
  }

  const formatDateTime = (log: Log): string => {
    // Try different date fields in order of preference
    const dateString = log.created_at || log.login_time
    
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      
      // Debug: Let's see what we're working with
      console.log('Raw date string:', dateString)
      console.log('Parsed date (UTC):', date.toISOString())
      console.log('Parsed date (local):', date.toLocaleString())
      
      // First, let's try without timezone specification to see current behavior
      const localTime = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      
      // Also try with explicit Kenya timezone
      const kenyaTime = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Africa/Nairobi'
      })
      
      console.log('Local time:', localTime)
      console.log('Kenya time:', kenyaTime)
      
      // For now, let's manually add 3 hours to see if that fixes it
      const adjustedDate = new Date(date.getTime() + (3 * 60 * 60 * 1000))
      const manualAdjusted = adjustedDate.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      
      console.log('Manual +3 hours:', manualAdjusted)
      
      // Return the manually adjusted time for now
      return manualAdjusted
      
    } catch (error) {
      console.error('Date parsing error:', error)
      return 'Invalid Date'
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('System Logs Report', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}`, 14, 22)

    // Prepare table data with properly formatted dates
    const tableData = logs.map(log => [
      log.user_name,
      log.user_email,
      log.user_role,
      log.action_type || 'Login',
      log.action_description || 'User login',
      log.entity_type || 'N/A',
      log.entity_id || 'N/A',
      formatDateTime(log),
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
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <Select value={logTypeToDelete} onValueChange={setLogTypeToDelete}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="login">Login Logs</SelectItem>
                <SelectItem value="activity">Activity Logs</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleClearLogs} 
              variant="destructive"
              disabled={clearingLogs || logs.length === 0}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {clearingLogs ? 'Clearing...' : 'Clear'}
            </Button>
          </div>
          <Button onClick={exportToPDF} disabled={logs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            List of all system activities ({logs.length} total)
          </CardDescription>
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
                      <span className="font-medium text-gray-700">
                        {formatDateTime(log)}
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