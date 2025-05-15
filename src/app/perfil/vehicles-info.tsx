"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { API_URL } from "@/utils/bakend"
import { SteeringWheel } from "./steering-wheel-icon"

interface UserProfile {
    id: number;
    nombre: string;
    correo: string;
    telefono: string;
    fecha_nacimiento: string;
    genero: string;
    ciudad: {
      id: number;
      nombre: string;
    };
    roles: string[];
  }

export function VehiclesInfo() {
  const [roles, setRoles] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchRoles = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      try {
        const res = await axios.get<UserProfile>(`${API_URL}/api/perfil`, {
          headers: { 
            Authorization: `Bearer ${token}` }
        })
        setRoles(res.data.roles || [])
      } catch (error) {
        console.error("Error al obtener roles", error)
      }
    }

    fetchRoles()
  }, [])

  return (
    <div className="p-3 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 justify-center">
        {roles.includes("HOST") && (
          <>
            <div
              className="w-full max-w-64 h-32 bg-black text-white hover:bg-gray-900 rounded-xl p-3 text-center shadow-md cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out mx-auto"
              onClick={() => router.push("/vehicles/misVehicles")}
            >
              <SteeringWheel className="mx-auto mb-2 h-10 w-10" />
              <p className="text-lg font-semibold truncate px-2">Mis Vehículos</p>
            </div>
          </>
        )}

        {roles.includes("RENTER") && (
          <div
            className="w-full max-w-64 h-32 bg-black text-white hover:bg-gray-900 rounded-xl p-3 text-center shadow-md cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out mx-auto"
            onClick={() => router.push("/vehicles/vehiclesRentados")}
          >
            <SteeringWheel className="mx-auto mb-2 h-10 w-10" />
            <p className="text-lg font-semibold truncate px-2">Vehículos Rentados</p>
          </div>
        )}
      </div>
    </div>
  )
}
