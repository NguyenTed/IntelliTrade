import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ---- Schema & Types (validation is done on the client; mirror on server) ----
const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  remember: z.boolean().optional().default(false),
});

type LoginValues = z.infer<typeof LoginSchema>;

// ---- Utilities (pretend API call) ----
async function fakeLoginApi(values: LoginValues) {
  // Replace with your real HTTP client (e.g., ky/axios/fetch wrapper)
  await new Promise((r) => setTimeout(r, 900));
  // Example: throw new Error("Invalid credentials");
  return { ok: true, token: "mock.jwt.token" } as const;
}

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "", remember: true },
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await fakeLoginApi(values);
      if (!res.ok) throw new Error("Invalid credentials");
      // 1) Persist token in httpOnly cookie server-side. If you must store client-side,
      //    keep it in memory or secure cookie; avoid localStorage for long-lived tokens.
      // 2) Redirect after login:
      window.alert("Logged in! (replace with router navigation)");
    } catch (err: any) {
      setError("password", { message: err?.message ?? "Login failed" });
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-14">
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 md:grid-cols-2">
          {/* Left visual panel */}
          <aside className="relative hidden md:block">
            <img
              src="/media/trading-login.jpg"
              alt="Bearish and Bullish image"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative h-full w-full bg-black/45 p-8 text-white">
              <img
                src="/media/logo.png"
                alt="Intelli Trade Logo"
                className="absolute left-8 top-8 h-8 w-auto"
                loading="lazy"
              />
              <figure className="absolute bottom-8 left-8 right-8">
                <blockquote className="text-2xl font-semibold leading-snug">
                  “You Trade. We Empower.”
                </blockquote>
                <figcaption className="mt-4 text-sm opacity-90">
                  Thuan Nguyen — CEO
                </figcaption>
              </figure>
            </div>
          </aside>

          {/* Right form panel */}
          <section className="p-8 sm:p-12">
            <div className="mx-auto w-full max-w-md">
              <header className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back to Intelli Trade
                </h1>
                <p className="mt-2 text-sm text-neutral-600">
                  Build your design system effortlessly with our powerful
                  component library.
                </p>
              </header>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
                aria-describedby="form-errors"
              >
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
                    inputMode="email"
                    className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    placeholder="alex.jordan@gmail.com"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
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
                    autoComplete="current-password"
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
                </div>

                {/* Row: forgot + remember */}
                <div className="flex items-center justify-between">
                  <a
                    href="#/forgot-password"
                    className="text-sm font-medium text-violet-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                  <label className="inline-flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-9 appearance-none rounded-full bg-neutral-300 outline-none transition focus:ring-2 focus:ring-violet-200 checked:bg-violet-600"
                      role="switch"
                      aria-label="Remember sign in details"
                      {...register("remember")}
                    />
                    <span className="text-sm text-neutral-700">
                      Remember sign in details
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Signing in…" : "Log in"}
                </button>

                {/* Divider */}
                <div className="relative py-3 text-center text-sm text-neutral-500">
                  <div className="absolute left-0 right-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-neutral-200" />
                  <span className="bg-white px-3">OR</span>
                </div>

                {/* Google button */}
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white px-5 py-3 font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  onClick={() => window.alert("Use OAuth flow here")}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C33.8 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.6 16.3 18.9 14 24 14c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6.1 29.1 4 24 4 16.1 4 9.3 8.6 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-7.9l-6.6 5.1C9.3 39.4 16.1 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.4 5.8-6.2 7.5l.1.1 6.2 5.2c-.4.4 7.6-4.4 7.6-16.8 0-1.2-.1-2.3-.4-3.5z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* Sign up hint */}
                <p className="text-center text-sm text-neutral-600">
                  Don’t have an account?{" "}
                  <a
                    href="/signup"
                    className="font-semibold text-violet-700 hover:underline"
                  >
                    Sign up
                  </a>
                </p>

                {/* Global form errors region (screen readers) */}
                <div id="form-errors" className="sr-only" aria-live="assertive">
                  {Object.values(errors).map((e, i) => (
                    <span key={i}>{e?.message}</span>
                  ))}
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
