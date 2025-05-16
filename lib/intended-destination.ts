"use client"

// Keys for storing intended destination data
const INTENDED_DESTINATION_KEY = "diceyDecisions_intendedDestination"
const INTENDED_ROOM_CODE_KEY = "diceyDecisions_intendedRoomCode"

/**
 * Stores the intended destination and room code for post-login redirect
 */
export function storeIntendedDestination(path: string, roomCode?: string) {
  try {
    // Store the full path
    localStorage.setItem(INTENDED_DESTINATION_KEY, path)

    // If a room code is provided, store it separately
    if (roomCode) {
      localStorage.setItem(INTENDED_ROOM_CODE_KEY, roomCode)
    }
  } catch (error) {
    console.error("Failed to store intended destination:", error)
  }
}

/**
 * Retrieves the stored intended destination
 */
export function getIntendedDestination(): string | null {
  try {
    return localStorage.getItem(INTENDED_DESTINATION_KEY)
  } catch (error) {
    console.error("Failed to retrieve intended destination:", error)
    return null
  }
}

/**
 * Retrieves the stored room code
 */
export function getIntendedRoomCode(): string | null {
  try {
    return localStorage.getItem(INTENDED_ROOM_CODE_KEY)
  } catch (error) {
    console.error("Failed to retrieve intended room code:", error)
    return null
  }
}

/**
 * Clears the stored intended destination and room code
 */
export function clearIntendedDestination() {
  try {
    localStorage.removeItem(INTENDED_DESTINATION_KEY)
    localStorage.removeItem(INTENDED_ROOM_CODE_KEY)
  } catch (error) {
    console.error("Failed to clear intended destination:", error)
  }
}
