"use client";

import { useState, useEffect } from 'react';
import { API_URL } from "@/utils/bakend";


interface BackendCarResponse {
  id: number;
  vim?: string;
  vin?: string;
  anio?: number;
  año?: number;
  marca: string;
  modelo: string;
  placa: string;
  asientos: number;
  puertas: number;
  soat: boolean;
  precio_por_dia: number;
  num_mantenimientos: number;
  transmision?: string;
  transmicion?: string;
  estado: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  combustibles?: { tipoDeCombustible: string }[];
  caracteristicas?: { nombre: string }[];
  imagenes?: { url: string, public_id: string }[];
  [key: string]: any; // Para otros campos que puedan venir
}

interface Car {
  id: number;
  vim: string;
  anio: number;
  marca: string;
  modelo: string;
  placa: string;
  asientos: number;
  puertas: number;
  soat: boolean;
  precio_por_dia: number;
  num_mantenimientos: number;
  transmision: string;
  estado: string;
  direccion: {
    calle: string;
    num_casa: string;
    provincia: {
      nombre: string;
      ciudad: {
        nombre: string;
      };
    };
  };
  combustiblesporCarro: {
    combustible: {
      tipoDeCombustible: string;
    };
  }[];
  caracteristicasAdicionalesCarro: {
    carasteristicasAdicionales: {
      nombre: string;
    };
  }[];
  imagenes: {
    data: string;
    public_id?: string;
  }[];
}

interface CarDashboardProps {
  hostId: string
}

const CarDashboard = ({ hostId }: CarDashboardProps) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugResponse, setDebugResponse] = useState<any>(null);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [stats, setStats] = useState<{total: number, autos_con_placa: number} | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }

        console.log(`Realizando petición a: ${API_URL}/api/carros/${hostId}`);
        const response = await fetch(`${API_URL}/api/carros/${hostId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error de API:", response.status, errorText);
          throw new Error(`Error al obtener los autos: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Respuesta del backend:", data);
        setDebugResponse(data);
        
        if (!data.autos || !Array.isArray(data.autos)) {
          throw new Error('Formato de respuesta inválido: no se encontró el arreglo "autos"');
        }
        
        
        const formattedCars: Car[] = data.autos.map((car: BackendCarResponse) => {
          console.log("Procesando auto:", car);
          
          
          return {
            id: car.id,
            vim: car.vim || car.vin || '',
            anio: car.anio || car.año || 0,
            marca: car.marca || '',
            modelo: car.modelo || '',
            placa: car.placa || '',
            asientos: car.asientos || 0,
            puertas: car.puertas || 0,
            soat: car.soat || false,
            precio_por_dia: car.precio_por_dia || 0,
            num_mantenimientos: car.num_mantenimientos || 0,
            transmision: car.transmision || car.transmicion || '',
            
            estado: car.estado === 'Disponible' ? 'DISPONIBLE' : 
                   car.estado === 'Reservado' ? 'RESERVADO' : 'MANTENIMIENTO',
            
            
            direccion: {
              calle: car.direccion || '',
              num_casa: car.num_casa || '',
              provincia: {
                nombre: car.provincia || '',
                ciudad: {
                  nombre: car.ciudad || ''
                }
              }
            },
            
           
            combustiblesporCarro: car.combustibles ? 
              car.combustibles.map(c => ({
                combustible: { tipoDeCombustible: c.tipoDeCombustible }
              })) : [],
            
            
            caracteristicasAdicionalesCarro: car.caracteristicas ? 
              car.caracteristicas.map(c => ({
                carasteristicasAdicionales: { nombre: c.nombre }
              })) : [],
            
           
            imagenes: car.imagenes ? 
              car.imagenes.map(img => ({
                data: img.url,
                public_id: img.public_id
              })) : []
          };
        });
        
        console.log("Autos formateados:", formattedCars);
        setCars(formattedCars);
        
        setStats({
          total: data.total || 0,
          autos_con_placa: data.autos_con_placa || 0
        });
      } catch (err) {
        console.error("Error completo:", err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [hostId]);

  const selectedCar = cars.find(car => car.id === selectedCarId);

  if (loading) {
    return <div className="p-6 text-center">Cargando autos...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        {debugResponse && (
          <div className="mt-4 p-4 border rounded bg-gray-50 text-sm max-h-96 overflow-auto">
            <h3 className="font-semibold mb-2">Respuesta del servidor:</h3>
            <pre className="whitespace-pre-wrap text-left">
              {JSON.stringify(debugResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (cars.length === 0) {
    return <div className="p-6 text-center">No tienes autos registrados</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tablero de Estado de Automóviles</h1>
      
      {/* Listado de vehículos en tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cars.map((car) => (
          <div 
            key={car.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedCarId === car.id 
                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
                : 'hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCarId(car.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{car.marca} {car.modelo}</h3>
                <p className="text-gray-600">{car.anio} • {car.placa}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                car.estado === 'DISPONIBLE' 
                  ? 'bg-green-100 text-green-800' 
                  : car.estado === 'RESERVADO'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {car.estado}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Transmisión:</span> {car.transmision}</div>
              <div><span className="text-gray-500">Precio/día:</span> ${car.precio_por_dia}</div>
              <div>
                <span className="text-gray-500">Combustible:</span> 
                {car.combustiblesporCarro && car.combustiblesporCarro[0]?.combustible?.tipoDeCombustible || 'No especificado'}
              </div>
              <div>
                <span className="text-gray-500">Ciudad:</span> 
                {car.direccion?.provincia?.ciudad?.nombre || 'Ciudad no especificada'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detalle del vehículo seleccionado */}
      {selectedCar ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">
              {selectedCar.marca} {selectedCar.modelo} ({selectedCar.anio})
            </h2>
            <button 
              onClick={() => setSelectedCarId(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cerrar detalle
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-700 mb-2">Información del Vehículo</h3>
                <div className="space-y-2">
                  <p><strong>VIM:</strong> {selectedCar.vim}</p>
                  <p><strong>Placa:</strong> {selectedCar.placa || 'No registrada'}</p>
                  <p><strong>Transmisión:</strong> {selectedCar.transmision}</p>
                  <p><strong>Asientos/Puertas:</strong> {selectedCar.asientos} / {selectedCar.puertas}</p>
                  <p><strong>SOAT:</strong> {selectedCar.soat ? 'Vigente' : 'No vigente'}</p>
                  <p><strong>Mantenimientos:</strong> {selectedCar.num_mantenimientos}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-700 mb-2">Ubicación</h3>
                <p>{selectedCar.direccion?.calle} {selectedCar.direccion?.num_casa && `#${selectedCar.direccion.num_casa}`}</p>
                <p>{selectedCar.direccion?.provincia?.ciudad?.nombre || 'Ciudad no especificada'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded ${
                selectedCar.estado === 'DISPONIBLE' 
                  ? 'bg-green-50 border-green-200' 
                  : selectedCar.estado === 'RESERVADO'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
              } border`}>
                <h3 className="font-medium text-gray-700 mb-2">Estado Actual</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{selectedCar.estado}</span>
                  <div className="text-3xl">
                    {selectedCar.estado === 'DISPONIBLE' ? '✅' : 
                     selectedCar.estado === 'RESERVADO' ? '🕒' : '⛔'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                  <p className="text-sm text-blue-600">Precio por día</p>
                  <p className="text-2xl font-bold">${selectedCar.precio_por_dia}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded border border-purple-100">
                  <p className="text-sm text-purple-600">Combustible</p>
                  <p className="text-2xl font-bold">
                    {selectedCar.combustiblesporCarro && selectedCar.combustiblesporCarro[0]?.combustible?.tipoDeCombustible || 'No especificado'}
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                <h3 className="font-medium text-gray-700 mb-2">Características</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCar.caracteristicasAdicionalesCarro && 
                   selectedCar.caracteristicasAdicionalesCarro.length > 0 ? (
                    selectedCar.caracteristicasAdicionalesCarro.map((caracteristica, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {caracteristica.carasteristicasAdicionales.nombre}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No hay características registradas</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
          Seleccione un vehículo para ver detalles completos
        </div>
      )}
    </div>
  );
};

export default CarDashboard;