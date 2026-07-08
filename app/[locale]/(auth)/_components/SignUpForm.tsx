"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosed, EyeIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Link, useRouter } from "@/i18n/routing";

function SignUpForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const tForm = useTranslations("Auth.zod");
  const tAuth = useTranslations("Auth");
  const tError = useTranslations("Auth.errors");
  const [showPassword, setshowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const passwordSchema = z
    .string()
    .min(8, { message: tForm("passwordLength") })
    .max(20, { message: tForm("passwordMaxLength") })
    .regex(/[a-z]/, { message: tForm("passwordLowercase") })
    .regex(/[A-Z]/, { message: tForm("passwordUppercase") })
    .regex(/[0-9]/, { message: tForm("passwordNumber") })
    .regex(/[^a-zA-Z0-9]/, { message: tForm("passwordSpecial") });

  const signUpSchema = z
    .object({
      email: z.string().email({
        message: tAuth("invalidEmail"),
      }),
      password: passwordSchema,
      confirmPassword: passwordSchema,
      acceptTerms: z.boolean({ message: tAuth("acceptTerms") }).refine((data) => data === true, {
        message: tAuth("acceptTerms"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tAuth("passwordMismatch"),
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof signUpSchema>>({
    mode: "onChange",
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsPending(true);
    try {
      await signIn("password", {
        email: data.email,
        password: data.password,
        flow: "signUp",
      });
      toast.success(tAuth("signUpSuccess"));
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("already exists")) {
        form.setError("email", {
          type: "manual",
          message: tError("existingEmailDesc"),
        });
        toast.error(tError("existingEmail"), { duration: 1500 });
      } else {
        toast.error(tError("unexpected"), { duration: 1500 });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-3 overflow-x-hidden px-2">
      <Form {...form}>
        <form className="space-y-3 w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="text-sm text-muted-foreground font-normal">{tAuth("email")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="arnold@schwarzenegger.com"
                    {...field}
                    className="placeholder:text-muted-foreground/50"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-0 relative">
                <FormLabel className="text-sm text-muted-foreground font-normal">{tAuth("password")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={isPending}
                      placeholder={tAuth("passwordPlaceholder")}
                      {...field}
                      className="placeholder:text-muted-foreground/50"
                      type={showPassword ? "text" : "password"}
                    />
                    <span
                      className="absolute right-1 top-1/2 cursor-pointer text-muted-foreground"
                      onClick={() => setshowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeClosed className="absolute right-2 top-1/2 -translate-y-1/2 size-5" />
                      ) : (
                        <EyeIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-5" />
                      )}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-0 relative">
                <FormLabel className="text-sm text-muted-foreground font-normal">{tAuth("confirmPassword")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={isPending}
                      placeholder={tAuth("confirmPassword")}
                      {...field}
                      className="placeholder:text-muted-foreground/50"
                      type={showPassword ? "text" : "password"}
                    />
                    <span
                      className="absolute right-1 top-1/2 cursor-pointer text-muted-foreground"
                      onClick={() => setshowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeClosed className="absolute right-2 top-1/2 -translate-y-1/2 size-5" />
                      ) : (
                        <EyeIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-5" />
                      )}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex justify-start items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      className="placeholder:text-muted-foreground/50"
                      disabled={isPending}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-xs">
                    {tAuth("preTerms")}
                    <Link className="cursor-pointer text-primary" href="/terms">
                      {tAuth("terms")}
                    </Link>
                    {tAuth("inTerms")}
                    <Link className="cursor-pointer text-primary" href="/privacy">
                      {tAuth("privacy")}
                    </Link>
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <ShinyButton className="w-full" disabled={isPending} type="submit">
            {!isPending ? tAuth("signUp") : <Loader2 className="size-4 animate-spin" />}
          </ShinyButton>
        </form>
      </Form>
    </div>
  );
}

export default SignUpForm;
