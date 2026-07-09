"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const CTF_CATEGORIES = [
  "web",
  "pwn",
  "crypto",
  "reverse",
  "forensics",
  "misc",
  "osint",
  "blockchain",
  "hardware",
  "network",
  "stego",
  "mobile",
  "ppc",
] as const;

function SubmitForm() {
  const t = useTranslations("Submit");
  const router = useRouter();
  const submit = useMutation(api.submissions.submit);
  const [pending, setPending] = useState(false);

  const schema = z.object({
    name: z.string().min(1, t("required")).max(100),
    year: z.number().int().min(1990, t("yearError")).max(2099, t("yearError")),
    url: z.string().url(t("urlError")).min(1, t("required")),
    categories: z.array(z.string()).optional(),
    notes: z.string().max(500).optional(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", year: new Date().getFullYear(), url: "", categories: [], notes: "" },
  });

  const selectedCategories = form.watch("categories") ?? [];

  const toggleCategory = (cat: string) => {
    const current = form.getValues("categories") ?? [];
    if (current.includes(cat)) {
      form.setValue(
        "categories",
        current.filter((c) => c !== cat),
        { shouldValidate: true }
      );
    } else {
      form.setValue("categories", [...current, cat], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setPending(true);
    try {
      await submit({
        name: data.name,
        year: String(data.year),
        url: data.url,
        categories: data.categories ?? [],
        notes: data.notes || undefined,
      });
      toast.success(t("success"));
      router.push("/");
    } catch {
      toast.error(t("error"));
    } finally {
      setPending(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="font-mono text-[11px] tracking-wider text-muted-foreground">
                {t("name")}
              </FormLabel>
              <FormControl>
                <Input disabled={pending} placeholder="DEF CON CTF" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="font-mono text-[11px] tracking-wider text-muted-foreground">
                {t("year")}
              </FormLabel>
              <FormControl>
                <Input
                  disabled={pending}
                  max={2099}
                  min={1990}
                  placeholder="2025"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="font-mono text-[11px] tracking-wider text-muted-foreground">
                {t("url")}
              </FormLabel>
              <FormControl>
                <Input disabled={pending} placeholder="https://ctftime.org/event/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories"
          render={() => (
            <FormItem className="space-y-1.5">
              <FormLabel className="font-mono text-[11px] tracking-wider text-muted-foreground">
                {t("categories")}
              </FormLabel>
              <div className="flex flex-wrap gap-1.5">
                {CTF_CATEGORIES.map((cat) => (
                  <button
                    className={cn(
                      "rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors",
                      selectedCategories.includes(cat)
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border text-muted-foreground hover:border-brand/50"
                    )}
                    disabled={pending}
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="font-mono text-[11px] tracking-wider text-muted-foreground">
                {t("notes")}
              </FormLabel>
              <FormControl>
                <Input disabled={pending} placeholder={t("notesPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={pending} type="submit">
          {pending ? <Loader2 className="size-4 animate-spin" /> : t("cta")}
        </Button>
      </form>
    </Form>
  );
}

export default SubmitForm;
