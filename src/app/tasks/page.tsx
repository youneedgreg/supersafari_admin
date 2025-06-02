"use client"

import { useEffect, useState } from "react"
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
import { Clock, Filter, MoreHorizontal, Plus, Search, User, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Define types for task and client
interface Task {
  id: number
  title: string
  description: string
  dueDate: string
  priority: "high" | "medium" | "low"
  status: "pending" | "completed"
  clientId: number | null
  clientName: string | null
}

interface Client {
  id: number
  name: string
}

export default function TasksPage() {
  // State variables
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as "high" | "medium" | "low",
    clientId: null as number | null
  })
  
  // Current task being edited
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks")
      
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks", {
        description: "There was an error loading your tasks. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch clients for the select dropdown
  const fetchClients = async () => {
    try {
      // You might need to create a clients API endpoint or use a mock list
      // For now, creating a mock client list based on the original mockTasks
      const uniqueClients = [
        { id: 1, name: "John & Sarah Smith" },
        { id: 2, name: "David Williams" },
        { id: 3, name: "Thompson Family" },
        { id: 4, name: "Maria Garcia" },
        { id: 5, name: "Chen Family" }
      ]
      setClients(uniqueClients)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchTasks()
    fetchClients()
  }, [])

  // Handle adding a new task
  const handleAddTask = async () => {
    try {
      setSubmitting(true)
      
      // Validate form
      if (!newTask.title.trim()) {
        toast.error("Please enter a task title")
        return
      }
      
      if (!newTask.dueDate) {
        toast.error("Please select a due date")
        return
      }
      
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          priority: newTask.priority,
          status: "pending",
          clientId: newTask.clientId
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to add task")
      }
      
      // Reset form and close dialog
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        clientId: null
      })
      
      setIsAddTaskOpen(false)
      toast.success("Task added successfully")
      
      // Reload tasks
      fetchTasks()
    } catch (error) {
      console.error("Error adding task:", error)
      toast.error("Failed to add task", {
        description: "There was an error adding your task. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle updating a task
  const handleUpdateTask = async () => {
    if (!currentTask) return
    
    try {
      setSubmitting(true)
      
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentTask.id,
          title: currentTask.title,
          description: currentTask.description,
          dueDate: currentTask.dueDate,
          priority: currentTask.priority,
          status: currentTask.status,
          clientId: currentTask.clientId
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update task")
      }
      
      setIsEditTaskOpen(false)
      toast.success("Task updated successfully")
      
      // Reload tasks
      fetchTasks()
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task", {
        description: "There was an error updating your task. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle deleting a task
  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete task")
      }
      
      toast.success("Task deleted successfully")
      
      // Reload tasks
      fetchTasks()
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task", {
        description: "There was an error deleting your task. Please try again.",
      })
    }
  }

  // Handle toggling task status
  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "pending" ? "completed" : "pending"
      
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: task.id,
          status: newStatus
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update task status")
      }
      
      toast.success(
        `Task marked as ${newStatus}`, 
        { description: `The task has been moved to the ${newStatus} list.` }
      )
      
      // Reload tasks
      fetchTasks()
    } catch (error) {
      console.error("Error updating task status:", error)
      toast.error("Failed to update task status", {
        description: "There was an error updating the task status. Please try again.",
      })
    }
  }

  // Open edit dialog with task details
  const openEditDialog = (task: Task) => {
    setCurrentTask(task)
    setIsEditTaskOpen(true)
  }

  // Filter tasks based on active tab and search query
  const filteredTasks = tasks.filter(
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

  // Format date string for display (input: YYYY-MM-DD, output: Month DD, YYYY)
  const formatDateInput = (dateString: string) => {
    if (!dateString) return ""
    const [year, month, day] = dateString.split("-")
    return `${year}-${month}-${day}`
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
            <DialogContent className="sm:max-w-[525px] bg-white">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task to keep track of your work.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input 
                      id="task-title" 
                      placeholder="Enter task title" 
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea 
                      id="task-description" 
                      placeholder="Enter task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-due-date">Due Date</Label>
                    <Input 
                      id="task-due-date" 
                      type="date" 
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({...newTask, priority: value as "high" | "medium" | "low"})}
                    >
                      <SelectTrigger id="task-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-client">Related Client (Optional)</Label>
                    <Select
                      value={newTask.clientId?.toString() || ""}
                      onValueChange={(value) => setNewTask({...newTask, clientId: value ? parseInt(value) : null})}
                    >
                      <SelectTrigger id="task-client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={handleAddTask}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Task'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Task Dialog */}
          <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
            <DialogContent className="sm:max-w-[525px] bg-white">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>Update task details.</DialogDescription>
              </DialogHeader>
              {currentTask && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="edit-task-title">Task Title</Label>
                      <Input 
                        id="edit-task-title" 
                        placeholder="Enter task title" 
                        value={currentTask.title}
                        onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-task-description">Description</Label>
                      <Textarea 
                        id="edit-task-description" 
                        placeholder="Enter task description"
                        value={currentTask.description}
                        onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-task-due-date">Due Date</Label>
                      <Input 
                        id="edit-task-due-date" 
                        type="date" 
                        value={formatDateInput(currentTask.dueDate)}
                        onChange={(e) => setCurrentTask({...currentTask, dueDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-task-priority">Priority</Label>
                      <Select
                        value={currentTask.priority}
                        onValueChange={(value) => setCurrentTask({...currentTask, priority: value as "high" | "medium" | "low"})}
                      >
                        <SelectTrigger id="edit-task-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-task-client">Related Client (Optional)</Label>
                      <Select
                        value={currentTask.clientId?.toString() || ""}
                        onValueChange={(value) => setCurrentTask({...currentTask, clientId: value ? parseInt(value) : null})}
                      >
                        <SelectTrigger id="edit-task-client">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditTaskOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={handleUpdateTask}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Task'
                  )}
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
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-500">Loading tasks...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
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
                        onCheckedChange={() => handleToggleTaskStatus(task)}
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
                                <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                  Edit Task
                                </DropdownMenuItem>
                                {status === "pending" ? (
                                  <DropdownMenuItem onClick={() => handleToggleTaskStatus(task)}>
                                    Mark as Completed
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleToggleTaskStatus(task)}>
                                    Mark as Pending
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  Delete Task
                                </DropdownMenuItem>
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