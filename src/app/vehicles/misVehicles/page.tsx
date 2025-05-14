"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/Header";
import CarDashboard from "@/components/Autos/MisCarros";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/utils/bakend";

export default function MisVehiclesPage() {
  const [hostId, setHostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInfo, setAuthInfo] = useState<{[key: string]: string | null}>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchHostId = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("auth_token");
        
        if (token) {
          const response = await fetch(`${API_URL}/api/perfil`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setHostId(userData.id.toString());
          } else {
            console.error("Error al obtener el perfil del usuario");
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del host",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostId();
  }, [toast]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mis Vehículos</h1>
          <Link href="/">
            <Button variant="outline">Atrás</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : hostId ? (
          <CarDashboard hostId={hostId} />
        ) : (
          <div className="text-center py-8">
            {!localStorage.getItem("id") ? (
              <>
                <p className="text-muted-foreground mb-4">
                  No hay sesión activa. Por favor, inicie sesión.
                </p>
                <div className="mb-4 p-4 border rounded bg-gray-50 text-sm">
                  <h3 className="font-semibold mb-2">Información de depuración:</h3>
                  <pre className="whitespace-pre-wrap text-left">
                    {JSON.stringify(authInfo, null, 2)}
                  </pre>
                </div>
                <Link href="/login">
                  <Button>Iniciar sesión</Button>
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">
                No se pudo cargar la información del host
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}