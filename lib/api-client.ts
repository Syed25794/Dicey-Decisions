"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

export function useApiClient() {
  const router = useRouter()
  const { showToast } = useToast()

  // Helper to get cookies
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
    return undefined
  }

  const getAuthHeaders = () => {
    const accessToken = getCookie("accessToken")
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
  }

  const handleResponse = async (res: Response) => {
    // For non-ok responses, try to parse the error
    if (!res.ok) {
      if (res.status === 401) {
        // Try to refresh the token
        try {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include", // Include cookies
          })

          if (!refreshRes.ok) {
            // If refresh fails, redirect to login
            showToast({
              title: "Session Expired",
              description: "Please log in again to continue",
              type: "error",
            })
            router.push("/login")
            throw new ApiError("Session expired. Please log in again.", 401)
          }

          // If refresh succeeds, retry the original request
          const retryRes = await fetch(res.url, {
            method: res.method,
            headers: {
              ...res.headers,
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: res.bodyUsed ? undefined : await res.clone().text(),
            credentials: "include", // Include cookies
          })

          if (!retryRes.ok) {
            const errorData = await retryRes.json().catch(() => ({}))
            throw new ApiError(errorData.error || "Request failed", retryRes.status)
          }

          return retryRes.json()
        } catch (error) {
          if (error instanceof ApiError) throw error
          router.push("/login")
          throw new ApiError("Authentication failed", 401)
        }
      }

      // For other errors, parse the error message
      const errorData = await res.json().catch(() => ({}))
      throw new ApiError(errorData.error || "Request failed", res.status)
    }

    // For successful responses, parse the JSON
    return res.json().catch(() => ({}))
  }

  return {
    get: async (url: string) => {
      try {
        const res = await fetch(url, {
          headers: {
            ...getAuthHeaders(),
          },
          credentials: "include", // Include cookies
        })
        return handleResponse(res)
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        throw new ApiError("Network error", 0)
      }
    },

    post: async (url: string, body: any) => {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          credentials: "include", // Include cookies
        })

        return handleResponse(res)
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        throw new ApiError("Network error", 0)
      }
    },

    patch: async (url: string, body: any) => {
      try {
        const res = await fetch(url, {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          credentials: "include", // Include cookies
        })

        return handleResponse(res)
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        throw new ApiError("Network error", 0)
      }
    },

    delete: async (url: string) => {
      try {
        const res = await fetch(url, {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
          credentials: "include", // Include cookies
        })

        return handleResponse(res)
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        throw new ApiError("Network error", 0)
      }
    },
  }
}
