"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import { X } from "lucide-react"

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "info" | "warning"
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, "id">) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(id)
    }, 5000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ease-in-out ${
              toast.type === "success"
                ? "bg-green-100 border-l-4 border-green-500"
                : toast.type === "error"
                  ? "bg-red-100 border-l-4 border-red-500"
                  : toast.type === "warning"
                    ? "bg-yellow-100 border-l-4 border-yellow-500"
                    : "bg-blue-100 border-l-4 border-blue-500"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3
                  className={`font-medium ${
                    toast.type === "success"
                      ? "text-green-800"
                      : toast.type === "error"
                        ? "text-red-800"
                        : toast.type === "warning"
                          ? "text-yellow-800"
                          : "text-blue-800"
                  }`}
                >
                  {toast.title}
                </h3>
                {toast.description && (
                  <p
                    className={`text-sm mt-1 ${
                      toast.type === "success"
                        ? "text-green-600"
                        : toast.type === "error"
                          ? "text-red-600"
                          : toast.type === "warning"
                            ? "text-yellow-600"
                            : "text-blue-600"
                    }`}
                  >
                    {toast.description}
                  </p>
                )}
              </div>
              <button onClick={() => dismissToast(toast.id)} className="text-gray-500 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
