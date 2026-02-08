"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createEvent } from "@/lib/api/admin";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Alert } from "@/components/ui/Alert";

type FormData = {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
};

export default function NewEventPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    try {
      await createEvent({
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        capacity: Number(data.capacity),
      });
      router.push("/admin/events?created=1");
      router.refresh();
    } catch (err) {
      setError(
        "root",
        {
          type: "manual",
          message: err instanceof Error ? err.message : "Erreur",
        }
      );
    }
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
        Créer un événement
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
              Créer
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
