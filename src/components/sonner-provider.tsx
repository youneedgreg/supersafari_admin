"use client"

import { Toaster as SonnerToaster } from "sonner"

export function SonnerProvider() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "white",
          color: "black",
          border: "1px solid #E2E8F0",
        },
        className: "border shadow-lg",
      }}
      theme="light"
      closeButton
    />
  )
}
