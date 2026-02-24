"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Inmueble = {
  id: string;
  titulo: string;
  precio: number;
  estado: "disponible" | "vendido";
};

export default function Home() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("inmuebles")
        .select("id,titulo,precio,estado,created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setInmuebles((data as Inmueble[]) ?? []);
      }

      setLoading(false);
    };

    load();
  }, []);

  const marcarComoVendido = async (id: string) => {
    const { error } = await supabase
      .from("inmuebles")
      .update({ estado: "vendido" })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setInmuebles((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, estado: "vendido" } : i
      )
    );
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Inmuebles</h1>

      {loading && <p>Cargando...</p>}
      {errorMsg && <p className="text-red-600">Error: {errorMsg}</p>}

      {!loading && !errorMsg && (
        <ul className="space-y-3">
          {inmuebles.map((i) => (
            <li
              key={i.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{i.titulo}</div>
                <div className="text-sm text-gray-600 capitalize">
                  Estado: {i.estado}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="font-semibold">{i.precio} €</div>

                {i.estado === "disponible" && (
                  <button
                    onClick={() => marcarComoVendido(i.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Marcar como vendido
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}