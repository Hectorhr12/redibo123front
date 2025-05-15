"use client"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface ToastProps {
  message: string
  duration?: number // por defecto 5 segundos
  onClose?: () => void
}

export default function Toast({ message, duration = 5000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className="bg-white text-black px-6 py-4 rounded-xl shadow-lg border border-gray-300 relative w-full max-w-sm">
        <button
          onClick={() => {
            setVisible(false)
            onClose?.()
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="font-medium">{message}</p>
      </div>
    </div>
  )
}
