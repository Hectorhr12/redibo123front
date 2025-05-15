"use client"
import { useEffect } from "react"

interface ToastProps {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000) // 5 segundos

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in">
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 font-bold">×</button>
      </div>
    </div>
  )
}
