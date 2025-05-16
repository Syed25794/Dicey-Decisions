"use client"

// Constants for storage keys
const STORAGE_PREFIX = "diceyDecisions_"
const INTENDED_DESTINATION_KEY = `${STORAGE_PREFIX}intendedDestination`
const INTENDED_ROOM_CODE_KEY = `${STORAGE_PREFIX}intendedRoomCode`
const REDIRECT_TIMESTAMP_KEY = `${STORAGE_PREFIX}redirectTimestamp`
const REDIRECT_EXPIRY_TIME = 30 * 60 * 1000 // 30 minutes in milliseconds

/**
 * Stores information about the user's intended destination for post-login redirect
 * @param path The full path to redirect to after login
 * @param roomCode Optional room code to store separately
 */
export function storeIntendedDestination(path: string, roomCode?: string): void {
  try {
    // Store the current timestamp to check for expiry later
    const timestamp = Date.now()
    localStorage.setItem(REDIRECT_TIMESTAMP_KEY, timestamp.toString())

    // Store the full path
    localStorage.setItem(INTENDED_DESTINATION_KEY, path)

    // If a room code is provided, store it separately for easier access
    if (roomCode) {
      localStorage.setItem(INTENDED_ROOM_CODE_KEY, roomCode)
    }

    console.log(`Stored intended destination: ${path}${roomCode ? ` with room code: ${roomCode}` : ""}`)
  } catch (error) {
    console.error("Failed to store intended destination:", error)
  }
}

/**
 * Retrieves the stored intended destination if it hasn't expired
 * @returns The stored path or null if not found or expired
 */
export function getIntendedDestination(): string | null {
  try {
    // Check if the redirect has expired
    const timestamp = localStorage.getItem(REDIRECT_TIMESTAMP_KEY)
    if (timestamp) {
      const storedTime = Number.parseInt(timestamp, 10)
      const currentTime = Date.now()

      if (currentTime - storedTime > REDIRECT_EXPIRY_TIME) {
        // Redirect has expired, clear it and return null
        clearIntendedDestination()
        return null
      }
    }

    return localStorage.getItem(INTENDED_DESTINATION_KEY)
  } catch (error) {
    console.error("Failed to retrieve intended destination:", error)
    return null
  }
}

/**
 * Retrieves the stored room code if it hasn't expired
 * @returns The stored room code or null if not found or expired
 */
export function getIntendedRoomCode(): string | null {
  try {
    // Check if the redirect has expired
    const timestamp = localStorage.getItem(REDIRECT_TIMESTAMP_KEY)
    if (timestamp) {
      const storedTime = Number.parseInt(timestamp, 10)
      const currentTime = Date.now()

      if (currentTime - storedTime > REDIRECT_EXPIRY_TIME) {
        // Redirect has expired, clear it and return null
        clearIntendedDestination()
        return null
      }
    }

    return localStorage.getItem(INTENDED_ROOM_CODE_KEY)
  } catch (error) {
    console.error("Failed to retrieve intended room code:", error)
    return null
  }
}

/**
 * Clears all stored redirect information
 */
export function clearIntendedDestination(): void {
  try {
    localStorage.removeItem(INTENDED_DESTINATION_KEY)
    localStorage.removeItem(INTENDED_ROOM_CODE_KEY)
    localStorage.removeItem(REDIRECT_TIMESTAMP_KEY)
  } catch (error) {
    console.error("Failed to clear intended destination:", error)
  }
}

/**
 * Checks if there is a valid intended destination stored
 * @returns True if there is a non-expired intended destination
 */
export function hasValidIntendedDestination(): boolean {
  return getIntendedDestination() !== null
}
