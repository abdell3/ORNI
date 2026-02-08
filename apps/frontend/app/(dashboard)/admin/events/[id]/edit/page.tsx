"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { fetchEventById } from "@/lib/api/client";
import { updateEvent } from "@/lib/api/admin";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Loader } from "@/components/ui/Loader";
import { Alert } from "@/components/ui/Alert";

type FormData = {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
};

function toDatetimeLocal(isoDate: string): string {
  const d = new Date(isoDate);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    fetchEventById(id)
      .then((event) => {
        setValue("title", event.title);
        setValue("description", event.description);
        setValue("date", toDatetimeLocal(event.date));
        setValue("location", event.location);
        setValue("capacity", event.capacity);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Erreur";
        setFetchError(msg === "NOT_FOUND" ? "Événement introuvable" : msg);
      })
      .finally(() => setLoading(false));
  }, [id, setValue]);

  async function onSubmit(data: FormData) {
    try {
      await updateEvent(id, {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        capacity: Number(data.capacity),
      });
      router.push("/admin/events?updated=1");
      router.refresh();
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err instanceof Error ? err.message : "Erreur",
      });
    }
  }

  if (loading) {
    return (
      <div>
        <SectionTitle as="h1" className="mb-6">
          Modifier l&apos;événement
        </SectionTitle>
        <Loader />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div>
        <SectionTitle as="h1" className="mb-6">
          Modifier l&apos;événement
        </SectionTitle>
        <Alert type="error" message={fetchError} />
        <Link href="/admin/events" className="mt-4 inline-block text-[#4f46e5] hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/events"
        className="mb-6 inline-block text-sm text-[#a1a1aa] hover:text-white hover:underline"
      >
        ← Retour à la liste
      </Link>
      <SectionTitle as="h1" className="mb-6">
        Modifier l&apos;événement
      </SectionTitle>
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Titre"
            id="title"
            error={errors.title?.message}
            {...register("title", { required: "Le titre est requis" })}
          />
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full rounded-lg border border-[#2d2d3a] bg-[#0b0b0f] px-3 py-2.5 text-white placeholder:text-[#71717a] focus:border-[#4f46e5] focus:outline-none focus:ring-1 focus:ring-[#4f46e5]"
              {...register("description", {
                required: "La description est requise",
              })}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
          <Input
            label="Date"
            id="date"
            type="datetime-local"
            error={errors.date?.message}
            {...register("date", { required: "La date est requise" })}
          />
          <Input
            label="Lieu"
            id="location"
            error={errors.location?.message}
            {...register("location", { required: "Le lieu est requis" })}
          />
          <Input
            label="Capacité"
            id="capacity"
            type="number"
            min={1}
            error={errors.capacity?.message}
            {...register("capacity", {
              required: "La capacité est requise",
              min: { value: 1, message: "Au moins 1" },
              valueAsNumber: true,
            })}
          />
          {errors.root?.message && (
            <Alert type="error" message={errors.root.message} />
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>
              Enregistrer
            </Button>
            <Link href="/admin/events">
              <Button type="button" variant="secondary">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
