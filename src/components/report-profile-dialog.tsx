"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"
import { API_URL } from "@/utils/bakend"

interface ReportProfileDialogProps {
  children: React.ReactNode
  renterId: string
  renterName: string
}

export default function ReportProfileDialog({ children, renterId, renterName }: ReportProfileDialogProps) {
  const [reason, setReason] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasReportedBefore, setHasReportedBefore] = useState(false)
  const [reachedDailyLimit, setReachedDailyLimit] = useState(false)
  const maxLength = 200 // Límite máximo de caracteres

  // Verificar si el usuario ya ha reportado a este arrendatario
  useEffect(() => {
    const checkPreviousReports = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token || !renterId) return

        const response = await fetch(`${API_URL}/api/reportes?reportadoId=${renterId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const reports = await response.json()
          const hasReported = reports.some((report: any) => report.estado !== "RECHAZADO")
          setHasReportedBefore(hasReported)
        }
      } catch (error) {
        console.error("Error checking previous reports:", error)
      }
    }

    if (isOpen) {
      checkPreviousReports()
      setReachedDailyLimit(false) // Resetear el estado del límite diario al abrir
    }
  }, [renterId, isOpen])

  const handleAdditionalInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= maxLength) {
      setAdditionalInfo(text)
    }
  }

  const handleSubmit = async () => {
    if (hasReportedBefore) {
      toast.error("Ya has reportado a este usuario anteriormente")
      setIsOpen(false)
      return
    }

    if (!reason) {
      toast.error("Por favor, seleccione un motivo para el reporte")
      return
    }

    if (additionalInfo.length > maxLength) {
      toast.error(`La información adicional no puede exceder los ${maxLength} caracteres`)
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_URL}/api/reportes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_reportado: renterId,
          motivo: reason,
          informacion_adicional: additionalInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error.includes("límite de reportes")) {
          setReachedDailyLimit(true)
          toast.error("Has alcanzado el límite de reportes por día")
        } else if (data.error.includes("reportado a este usuario")) {
          setHasReportedBefore(true)
          toast.error("Ya has reportado a este usuario anteriormente")
        } else {
          toast.error(data.error || "No se pudo enviar el reporte")
        }
        throw new Error(data.error)
      }

      toast.success("Reporte enviado. Su reporte ha sido enviado correctamente y será revisado por nuestro equipo.")
      setReason("")
      setAdditionalInfo("")
      setIsOpen(false)
    } catch (error) {
      console.error("Error submitting report:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDialogMessage = () => {
    if (hasReportedBefore) {
      return (
        <div className="mt-2 flex items-center text-red-500 text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          Ya has reportado a este usuario anteriormente. No puedes enviar múltiples reportes al mismo usuario.
        </div>
      )
    }
    if (reachedDailyLimit) {
      return (
        <div className="mt-2 flex items-center text-red-500 text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          Has alcanzado el límite de reportes por día (2 reportes/24 horas).
        </div>
      )
    }
    return "Por favor, indique el motivo por el cual está reportando a este arrendatario. Los reportes son anónimos y serán revisados por nuestro equipo."
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar a {renterName}</DialogTitle>
          <DialogDescription>
            {getDialogMessage()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo del reporte</label>
            <Select 
              value={reason} 
              onValueChange={setReason} 
              disabled={hasReportedBefore || reachedDailyLimit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="información_falsa">Información falsa en el perfil</SelectItem>
                <SelectItem value="comportamiento_inapropiado">Comportamiento inapropiado</SelectItem>
                <SelectItem value="daños_propiedad">Daños a la propiedad</SelectItem>
                <SelectItem value="incumplimiento_normas">Incumplimiento de normas</SelectItem>
                <SelectItem value="otro">Otro motivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Información adicional 
              <span className="text-xs text-muted-foreground ml-2">
                ({additionalInfo.length}/{maxLength} caracteres)
              </span>
            </label>
            <Textarea
              placeholder="Proporcione detalles adicionales sobre el reporte..."
              value={additionalInfo}
              onChange={handleAdditionalInfoChange}
              rows={4}
              maxLength={maxLength}
              className="resize-none"
              disabled={hasReportedBefore || reachedDailyLimit}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || hasReportedBefore || reachedDailyLimit}
            variant={hasReportedBefore || reachedDailyLimit ? "destructive" : "default"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : hasReportedBefore ? (
              "No se permiten múltiples reportes"
            ) : reachedDailyLimit ? (
              "Límite de reportes alcanzado"
            ) : (
              "Enviar reporte"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
