"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Filter, MoreHorizontal, Plus, Search, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Mock tasks data
const mockTasks = [
  {
    id: 1,
    title: "Book flight for Thompson Family",
    description: "Need to book return flights from Toronto to Nairobi",
    dueDate: "May 10, 2023",
    priority: "high",
    status: "pending",
    clientId: 3,
    clientName: "Thompson Family",
  },
  {
    id: 2,
    title: "Send invoice to David Williams",
    description: "Prepare and send final invoice for safari package",
    dueDate: "May 8, 2023",
    priority: "medium",
    status: "pending",
    clientId: 2,
    clientName: "David Williams",
  },
  {
    id: 3,
    title: "Confirm hotel for Smith couple",
    description: "Call Serena Lodge to confirm reservation for 10 nights",
    dueDate: "May 9, 2023",
    priority: "high",
    status: "pending",
    clientId: 1,
    clientName: "John & Sarah Smith",
  },
  {
    id: 4,
    title: "Arrange airport transfer for Garcia",
    description: "Book airport pickup and drop-off",
    dueDate: "May 25, 2023",
    priority: "medium",
    status: "pending",
    clientId: 4,
    clientName: "Maria Garcia",
  },
  {
    id: 5,
    title: "Follow up with Chen Family about itinerary preferences",
    description: "Send email to confirm activity preferences",
    dueDate: "May 15, 2023",
    priority: "low",
    status: "pending",
    clientId: 5,
    clientName: "Chen Family",
  },
  {
    id: 6,
    title: "Update website with new safari packages",
    description: "Add summer specials to the website",
    dueDate: "May 20, 2023",
    priority: "medium",
    status: "completed",
    clientId: null,
    clientName: null,
  },
  {
    id: 7,
    title: "Renew partnership with local tour guides",
    description: "Schedule meeting to discuss renewal terms",
    dueDate: "May 30, 2023",
    priority: "low",
    status: "completed",
    clientId: null,
    clientName: null,
  },
]

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  // Filter tasks based on active tab and search query
  const filteredTasks = mockTasks.filter(
    (task) =>
      task.status === activeTab &&
      (searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.clientName && task.clientName.toLowerCase().includes(searchQuery.toLowerCase()))),
  )

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-500 mt-1">Manage your tasks and stay organized</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task to keep track of your work.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input id="task-title" placeholder="Enter task title" />
                  </div>
                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea id="task-description" placeholder="Enter task description" />
                  </div>
                  <div>
                    <Label htmlFor="task-due-date">Due Date</Label>
                    <Input id="task-due-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select>
                      <SelectTrigger id="task-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-client">Related Client (Optional)</Label>
                    <Select>
                      <SelectTrigger id="task-client">
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
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddTaskOpen(false)}>
                  Add Task
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
            placeholder="Search tasks..."
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

      {/* Task tabs */}
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* Task list for each tab */}
        {["pending", "completed"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No {status} tasks found</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Checkbox
                        id={`task-${task.id}`}
                        className="mt-1 h-5 w-5 border-2 border-green-500 text-green-600 rounded-md"
                        checked={status === "completed"}
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <label
                              htmlFor={`task-${task.id}`}
                              className={`font-medium ${status === "completed" ? "line-through text-gray-500" : ""}`}
                            >
                              {task.title}
                            </label>
                            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                          </div>
                          <div className="flex items-center mt-2 md:mt-0">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white">
                                <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                {status === "pending" ? (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      toast.success("Task marked as completed", {
                                        description: "The task has been moved to the completed list.",
                                      })
                                    }}
                                  >
                                    Mark as Completed
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>Mark as Pending</DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-red-600">Delete Task</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500 mt-2 space-y-1 md:space-y-0 md:space-x-4">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            Due: {task.dueDate}
                          </div>
                          {task.clientName && (
                            <div className="flex items-center">
                              <User className="mr-1 h-4 w-4" />
                              Client: {task.clientName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
