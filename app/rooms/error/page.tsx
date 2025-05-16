"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RoomErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("Room not found or access denied")

  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setErrorMessage(decodeURIComponent(message))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-xl text-center">Room Error</CardTitle>
          <CardDescription className="text-center text-red-500">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-4">
            The room you're trying to join might not exist, or you may not have permission to access it.
          </p>
          <p className="text-center text-gray-600">
            You can try entering a different room code or create your own decision room.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Link href="/rooms/join">
            <Button variant="outline">Try Another Code</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
