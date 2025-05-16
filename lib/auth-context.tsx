"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  clearError: () => void
  setError: (error:string | null ) => void
  refreshToken: () => Promise<boolean>
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshPromise, setRefreshPromise] = useState<Promise<boolean> | null>(null)
  const [refreshAttempts, setRefreshAttempts] = useState(0)
  const router = useRouter()
  const toast = useToast()

  const showToast = useCallback(
    (toastData: { title: string; description: string; type: "success" | "error" | "info" | "warning" }) => {
      if (toast?.showToast) {
        toast.showToast(toastData)
      } else {
        console.log(`[Toast] ${toastData.title}: ${toastData.description}`)
      }
    },
    [toast],
  )

  const clearError = () => setError(null)

  // Function to refresh the token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    // Prevent excessive refresh attempts
    if (refreshAttempts > 2) {
      console.error("Too many refresh attempts, giving up")
      return false
    }

    // If already refreshing, return the existing promise
    if (isRefreshing && refreshPromise) {
      return refreshPromise
    }

    setIsRefreshing(true)
    setRefreshAttempts((prev) => prev + 1)

    const promise = new Promise<boolean>(async (resolve) => {
      try {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include", // Include cookies
        })

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          setUser(refreshData.user)
          setRefreshAttempts(0) // Reset attempts on success
          resolve(true)
        } else {
          console.error("Token refresh failed:", await refreshRes.text())
          setUser(null)
          resolve(false)
        }
      } catch (error) {
        console.error("Token refresh error:", error)
        setUser(null)
        resolve(false)
      } finally {
        setIsRefreshing(false)
        setRefreshPromise(null)
      }
    }) as Promise<boolean>

    setRefreshPromise(promise)
    return promise
  }, [isRefreshing, refreshPromise, refreshAttempts])

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/auth/me", {
          credentials: "include", // Include cookies
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          // If not authenticated
          setUser(null)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Set up a timer to refresh the token periodically
  useEffect(() => {
    if (!user) return

    // Refresh token every 25 minutes (5 minutes before the 30-minute expiration)
    const refreshInterval = setInterval(
      () => {
        refreshToken()
      },
      25 * 60 * 1000,
    )

    return () => clearInterval(refreshInterval)
  }, [user, refreshToken])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Include cookies
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      setUser(data.user)
      setRefreshAttempts(0) // Reset refresh attempts on successful login

      showToast({
        title: "Login Successful",
        description: "Welcome back!",
        type: "success",
      })

      // The redirect is now handled in the login page component
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include", // Include cookies
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // With email verification, we don't set the user here
      // The user will be set after email verification

      showToast({
        title: "Registration Initiated",
        description: data.message || "Please check your email to complete registration",
        type: "success",
      })

      // Redirect to a verification pending page
      router.push("/verification-pending?email=" + encodeURIComponent(email))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies
      })

      setUser(null)
      setRefreshAttempts(0) // Reset refresh attempts on logout

      showToast({
        title: "Logged Out",
        description: "You have been successfully logged out",
        type: "info",
      })

      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)

      showToast({
        title: "Error",
        description: "There was a problem logging you out",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        error,
        setError,
        clearError,
        refreshToken,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
