import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// --- Schema
const SignupSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    username: z
      .string()
      .min(3, "At least 3 characters")
      .max(32, "Max 32 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscore"),
    password: z
      .string()
      .min(8, "Use 8+ characters")
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Include letters and numbers"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    dateOfBirth: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date")
      .refine((v) => {
        const dob = new Date(v);
        const today = new Date();
        const age =
          today.getFullYear() -
          dob.getFullYear() -
          (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
            ? 1
            : 0);
        return age >= 13; // example age gate; adjust per policy
      }, "You must be at least 13 years old"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof SignupSchema>;

async function fakeSignupApi(values: SignupValues) {
  await new Promise((r) => setTimeout(r, 900));
  return { ok: true, userId: "u_123" } as const;
}

export const SignUpPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: SignupValues) => {
    try {
      const res = await fakeSignupApi(values);
      if (!res.ok) throw new Error("Sign up failed");
      window.alert(`Signed up! userId=${res.userId} (replace with navigation)`);
    } catch (err: any) {
      setError("username", { message: err?.message ?? "Sign up failed" });
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-14">
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 md:grid-cols-2">
          {/* Left form panel (reversed layout) */}
          <section className="order-2 p-8 sm:p-12 md:order-1">
            <div className="mx-auto w-full max-w-md">
              <header className="mb-8 text-left">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Create your account
                </h1>
                <p className="mt-2 text-sm text-neutral-600">
                  Start trading with Intelli Trade — it only takes a minute.
                </p>
              </header>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
              >
                {/* Name row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1 block text-sm font-medium"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Alex"
                      autoComplete="given-name"
                      className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                      {...register("firstName")}
                      aria-invalid={!!errors.firstName}
                    />
                    {errors.firstName && (
                      <p role="alert" className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1 block text-sm font-medium"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Smith"
                      autoComplete="family-name"
                      className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                      {...register("lastName")}
                      aria-invalid={!!errors.lastName}
                    />
                    {errors.lastName && (
                      <p role="alert" className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    placeholder="you@example.com"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1 block text-sm font-medium"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    placeholder="your_handle"
                    {...register("username")}
                    aria-invalid={!!errors.username}
                  />
                  {errors.username && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Passwords row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1 block text-sm font-medium"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                      placeholder="••••••••"
                      {...register("password")}
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && (
                      <p role="alert" className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-neutral-500">
                      Use at least 8 characters with letters and numbers.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1 block text-sm font-medium"
                    >
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      aria-invalid={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && (
                      <p role="alert" className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="mb-1 block text-sm font-medium"
                  >
                    Date of birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    autoComplete="bday"
                    className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    {...register("dateOfBirth")}
                    aria-invalid={!!errors.dateOfBirth}
                  />
                  {errors.dateOfBirth && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating account…" : "Sign up"}
                </button>

                <p className="text-sm text-neutral-600">
                  By creating an account, you agree to our{" "}
                  <a
                    className="font-medium text-violet-700 hover:underline"
                    href="#/terms"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    className="font-medium text-violet-700 hover:underline"
                    href="#/privacy"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>

                <p className="text-sm text-neutral-600">
                  Already have an account?{" "}
                  <a
                    className="font-semibold text-violet-700 hover:underline"
                    href="/login"
                  >
                    Log in
                  </a>
                </p>
              </form>
            </div>
          </section>

          {/* Right visual panel (image/video) */}
          <aside className="relative order-1 hidden md:block md:order-2">
            {/* Swap <img> for <video> if you prefer */}
            <img
              src="/media/trading-signup.jpg"
              alt="Creative workspace"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative h-full w-full bg-black/10 p-8 text-white">
              <img
                src="/media/logo.png"
                alt="Intelli Trade Logo"
                className="absolute right-8 top-8 h-8 w-auto"
                loading="lazy"
              />
              <figure className="absolute bottom-8 left-8 right-8">
                <blockquote className="text-2xl font-semibold leading-snug">
                  “Empowering traders with real-time intelligence for every
                  market move.”
                </blockquote>
              </figure>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
