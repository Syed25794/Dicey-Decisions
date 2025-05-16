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
        <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Room</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete <span className="font-medium">"{roomTitle}"</span>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="sm:w-auto w-full">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="sm:w-auto w-full">
            {isDeleting ? (
              <>
                <span className="animate-pulse">Deleting...</span>
              </>
            ) : (
              <>Delete Room</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
