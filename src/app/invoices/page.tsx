/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CreditCard, Download, Eye, Filter, MoreHorizontal, Plus, Printer, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

// Mock invoices data
const mockInvoices = [
  {
    id: "INV-001",
    clientName: "John & Sarah Smith",
    clientId: 1,
    amount: 3500,
    date: "May 5, 2023",
    dueDate: "May 15, 2023",
    status: "paid",
    items: [
      { description: "Safari Package - 10 days", quantity: 2, price: 1500, total: 3000 },
      { description: "Airport Transfer", quantity: 1, price: 500, total: 500 },
    ],
  },
  {
    id: "INV-002",
    clientName: "David Williams",
    clientId: 2,
    amount: 3500,
    date: "May 8, 2023",
    dueDate: "May 18, 2023",
    status: "pending",
    items: [
      { description: "Safari Package - 10 days", quantity: 1, price: 3000, total: 3000 },
      { description: "Photography Tour Add-on", quantity: 1, price: 500, total: 500 },
    ],
  },
  {
    id: "INV-003",
    clientName: "Thompson Family",
    clientId: 3,
    amount: 7200,
    date: "May 10, 2023",
    dueDate: "May 20, 2023",
    status: "pending",
    items: [
      { description: "Safari Package - 12 days", quantity: 4, price: 1500, total: 6000 },
      { description: "Airport Transfer", quantity: 1, price: 700, total: 700 },
      { description: "Educational Tour Add-on", quantity: 1, price: 500, total: 500 },
    ],
  },
  {
    id: "INV-004",
    clientName: "Maria Garcia",
    clientId: 4,
    amount: 4200,
    date: "May 15, 2023",
    dueDate: "May 25, 2023",
    status: "draft",
    items: [
      { description: "Safari Package - 10 days", quantity: 2, price: 1800, total: 3600 },
      { description: "Romantic Dinner Experience", quantity: 1, price: 600, total: 600 },
    ],
  },
  {
    id: "INV-005",
    clientName: "Robert Johnson",
    clientId: 6,
    amount: 3800,
    date: "June 1, 2023",
    dueDate: "June 10, 2023",
    status: "paid",
    items: [
      { description: "Safari Package - 12 days", quantity: 1, price: 3200, total: 3200 },
      { description: "Photography Equipment Rental", quantity: 1, price: 600, total: 600 },
    ],
  },
]

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false)

  // Filter invoices based on active tab and search query
  const filteredInvoices = mockInvoices.filter((invoice) => {
    // Filter by tab
    if (activeTab !== "all" && invoice.status !== activeTab) return false

    // Filter by search query
    if (searchQuery === "") return true
    return (
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Get invoice status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "draft":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsViewInvoiceOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-500 mt-1">Create and manage client invoices</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Create a new invoice for a client.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="client">Client</Label>
                    <Select>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">John & Sarah Smith</SelectItem>
                        <SelectItem value="2">David Williams</SelectItem>
                        <SelectItem value="3">Thompson Family</SelectItem>
                        <SelectItem value="4">Maria Garcia</SelectItem>
                        <SelectItem value="5">Chen Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="invoice-date">Invoice Date</Label>
                    <Input id="invoice-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input id="due-date" type="date" />
                  </div>

                  <div className="col-span-2 border rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Invoice Items</h4>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-1 h-3 w-3" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-6">
                          <Label htmlFor="item-1-desc">Description</Label>
                          <Input id="item-1-desc" placeholder="Item description" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="item-1-qty">Qty</Label>
                          <Input id="item-1-qty" type="number" min="1" defaultValue="1" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="item-1-price">Price</Label>
                          <Input id="item-1-price" type="number" min="0" placeholder="0.00" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="item-1-total">Total</Label>
                          <Input id="item-1-total" readOnly placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Additional notes for the invoice" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddInvoiceOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" className="mr-2">
                  Save as Draft
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsAddInvoiceOpen(false)
                    toast.success("Invoice created successfully", {
                      description: "The invoice has been sent to the client.",
                    })
                  }}
                >
                  Create Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Invoice tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>

        {/* Invoice list */}
        <TabsContent value={activeTab} className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg bg-green-100 text-green-600 mr-4`}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">{invoice.id}</h3>
                          <Badge className={`ml-3 ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="mr-2 h-4 w-4" />
                            {invoice.clientName}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-2 h-4 w-4" />
                            Due: {invoice.dueDate}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-4 md:mt-0 space-x-2">
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-semibold">Ksh {invoice.amount.toLocaleString()}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                          <DropdownMenuItem>Send to Client</DropdownMenuItem>
                          {invoice.status === "pending" && <DropdownMenuItem>Mark as Paid</DropdownMenuItem>}
                          {invoice.status === "draft" && <DropdownMenuItem>Finalize Invoice</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* View Invoice Dialog */}
      <Dialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white">
          <DialogHeader>
            <DialogTitle>Invoice {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>{selectedInvoice?.clientName}</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="py-4">
              <div className="flex justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl">Safari Management</h3>
                  <p className="text-gray-500">123 Safari Road</p>
                  <p className="text-gray-500">Nairobi, Kenya</p>
                  <p className="text-gray-500">info@safariadmin.com</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl">INVOICE</p>
                  <p className="text-gray-500">Invoice #: {selectedInvoice.id}</p>
                  <p className="text-gray-500">Date: {selectedInvoice.date}</p>
                  <p className="text-gray-500">Due Date: {selectedInvoice.dueDate}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">Bill To:</h4>
                <p>{selectedInvoice.clientName}</p>
              </div>

              <div className="border rounded-md overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedInvoice.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">Ksh {item.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">Ksh {item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-6">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>Ksh {selectedInvoice.amount}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">Ksh {selectedInvoice.amount}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Notes:</h4>
                <p className="text-gray-600 text-sm">
                  Thank you for your business. Payment is due within 10 days of invoice date.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewInvoiceOpen(false)}>
              Close
            </Button>
            <Button variant="outline" className="mr-2">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
