"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DeleteRoomDialogProps {
  roomId: string
  roomTitle: string
}

export function DeleteRoomDialog({ roomId, roomTitle }: DeleteRoomDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const api = useApiClient()
  const { showToast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await api.delete(`/api/rooms/${roomId}`)

      showToast({
        title: "Room Deleted",
        description: "The room has been deleted successfully",
        type: "success",
      })

      setIsOpen(false)
      router.push("/dashboard")
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to delete room",
        type: "error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors rounded-lg font-semibold flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl border border-red-100 bg-white">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-lg font-bold">Delete Room</DialogTitle>
          </div>
          <DialogDescription className="text-gray-700">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{roomTitle}"</span>?
            <span className="text-red-500 font-medium">This action cannot be undone.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="sm:w-auto w-full rounded-lg border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="sm:w-auto w-full rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition flex items-center justify-center"
          >
            {isDeleting ? (
              <span className="animate-pulse">Deleting...</span>
            ) : (
              <>Delete Room</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
