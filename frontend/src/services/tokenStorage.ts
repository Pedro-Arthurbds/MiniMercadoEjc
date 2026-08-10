import type { User } from "../contexts/AuthContext"

const STORAGE_KEY = "auth"

type StoredAuth = {
    token: string
    user: User
}

function readStorage(): StoredAuth | null {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try{
        return JSON.parse(raw) as StoredAuth
    }catch {
        sessionStorage.removeItem(STORAGE_KEY)
        return null
    }
}

export function setAuth(token: string, user: User): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
}

export function getToken(): string | null {
    return readStorage()?.token ?? null
}

export function getUser(): User | null {
    return readStorage()?.user ?? null
}

export function clearAuth(): void {
    sessionStorage.removeItem(STORAGE_KEY)
}