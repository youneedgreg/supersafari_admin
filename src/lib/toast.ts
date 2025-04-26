import { toast } from "sonner"

type ToastType = "success" | "error" | "info" | "warning"

export function showToast(message: string, type: ToastType = "info", description?: string) {
  const options = {
    description,
    duration: 5000,
  }

  switch (type) {
    case "success":
      toast.success(message, options)
      break
    case "error":
      toast.error(message, options)
      break
    case "warning":
      toast.warning(message, options)
      break
    case "info":
    default:
      toast.info(message, options)
      break
  }
}
    