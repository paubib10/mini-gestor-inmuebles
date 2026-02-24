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

  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const crearInmueble = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const precioNum = Number(precio);

    const { data, error } = await supabase
      .from("inmuebles")
      .insert([{ titulo, precio: precioNum, estado: "disponible" }])
      .select("id,titulo,precio,estado");

    setSubmitting(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // Añadir al listado sin recargar
    if (data && data[0]) {
      setInmuebles((prev) => [data[0] as Inmueble, ...prev]);
    }

    setTitulo("");
    setPrecio("");
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Inmuebles</h1>

      <form onSubmit={crearInmueble} className="mb-6 border border-white rounded p-3 space-y-3 bg-black text-white">
        <div className="font-medium">Añadir inmueble</div>

        <div className="flex gap-3">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            className="flex-1 border border-white rounded px-3 py-2 text-white bg-gray-800"
            required
          />
          <input
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Precio"
            type="number"
            className="w-40 border border-white rounded px-3 py-2 text-white bg-gray-800"
            required
            min={0}
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Añadir"}
          </button>
        </div>
      </form>

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