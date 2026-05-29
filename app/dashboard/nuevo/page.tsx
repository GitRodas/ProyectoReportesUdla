"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useIncidents } from "@/context/incidents-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Upload,
  X,
  Loader2,
  CheckCircle,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  INCIDENT_TYPE_LABELS,
  CAMPUS_LOCATIONS,
  type IncidentType,
} from "@/lib/types";

export default function NuevoIncidentePage() {
  const router = useRouter();
  const { addIncident } = useIncidents();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [tipo, setTipo] = useState<IncidentType | "">("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/heic,image/heif";
  const MAX_IMAGE_SIZE_MB = 10;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);

    if (!isImage) {
      setError("Seleccione un archivo de imagen válido.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`La imagen no debe superar ${MAX_IMAGE_SIZE_MB} MB.`);
      return;
    }

    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setError("No se pudo leer la imagen. Intente con otra foto.");
      setImageFile(null);
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no está disponible en este navegador");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("[v0] Geolocation error:", error);
        setError("No se pudo obtener la ubicación. Por favor selecciónela manualmente.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!tipo) {
      setError("Por favor seleccione el tipo de incidente");
      return;
    }
    if (!descripcion.trim()) {
      setError("Por favor ingrese una descripción");
      return;
    }
    if (!imagePreview || !imageFile) {
      setError("Por favor adjunte una fotografía");
      return;
    }
    if (!ubicacion) {
      setError("Por favor seleccione la ubicación");
      return;
    }

    setIsSubmitting(true);

    try {
      await addIncident({
        tipo: tipo as IncidentType,
        descripcion,
        ubicacionTexto: ubicacion,
        latitud: coordinates?.lat,
        longitud: coordinates?.lng,
        imageFile,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al enviar el reporte"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/dashboard">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reportar Incidente</h1>
        <p className="text-muted-foreground">
          Complete el formulario para registrar un nuevo incidente
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Incident Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tipo de Incidente</CardTitle>
            <CardDescription>
              Seleccione la categoría que mejor describe el incidente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={tipo} onValueChange={(value) => setTipo(value as IncidentType)}>
              <SelectTrigger className="bg-input/50">
                <SelectValue placeholder="Seleccione el tipo de incidente" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INCIDENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      {value === "bano" && "🚿"}
                      {value === "electricidad" && "⚡"}
                      {value === "infraestructura" && "🏗️"}
                      {value === "seguridad" && "🔒"}
                      {value === "limpieza" && "🧹"}
                      {value === "otro" && "📋"}
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Descripción</CardTitle>
            <CardDescription>
              Describa el incidente con el mayor detalle posible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Hay una fuga de agua en el lavamanos del segundo piso. El agua no para de correr..."
              className="min-h-[120px] bg-input/50"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {descripcion.length}/500 caracteres
            </p>
          </CardContent>
        </Card>

        {/* Photo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Fotografía</CardTitle>
            <CardDescription>
              Adjunte una foto del incidente (obligatorio)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Cámara: capture abre la cámara en móvil */}
            <input
              type="file"
              ref={cameraInputRef}
              accept={ACCEPTED_IMAGE_TYPES}
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
            {/* Galería: sin capture para permitir elegir fotos guardadas */}
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Vista previa de la imagen"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-32 flex-col gap-2"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm">Tomar Foto</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-32 flex-col gap-2"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm">Subir desde Galería</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ubicación</CardTitle>
            <CardDescription>
              Indique dónde se encuentra el incidente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Lugar en el Campus</Label>
              <Select value={ubicacion} onValueChange={setUbicacion}>
                <SelectTrigger className="bg-input/50">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Seleccione la ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                Obtener GPS (opcional)
              </Button>

              {coordinates && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle className="w-4 h-4" />
                  Coordenadas obtenidas
                </div>
              )}
            </div>

            {coordinates && (
              <p className="text-xs text-muted-foreground">
                Lat: {coordinates.lat.toFixed(6)}, Lng:{" "}
                {coordinates.lng.toFixed(6)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1 gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Enviar Reporte
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
