import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { login } from "@/features/auth/api/authApi";
import { authStore } from "@/features/auth/model/authStore";

// —— Schema: identifier is email OR username ——
const usernameRegex = /^[a-zA-Z0-9_]{3,32}$/;
const LoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your email or username")
    .refine(
      (v) => z.string().email().safeParse(v).success || usernameRegex.test(v),
      "Enter a valid email or username"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  remember: z.boolean().optional().default(false),
});
type LoginValues = z.infer<typeof LoginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: Location } };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: "", password: "", remember: true },
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      // Call API
      const { accessToken } = await login(values);
      // Seed token and fetch profile
      const store = authStore.getState();
      store.setAccessToken(accessToken);

      // Ensure profile is loaded before navigation
      try {
        await store.loadMe();
      } catch (profileError) {
        console.error("Failed to load profile after login:", profileError);
        // Still proceed with navigation, profile might load later
      }

      // Redirect to the page the user wanted, or home
      const to = location.state?.from?.pathname ?? "/";
      navigate(to, { replace: true });
    } catch (e) {
      const err = e as AxiosError<any>;
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed";
      setError("password", { message: serverMsg });
      setError("root.server", { message: serverMsg }); // optional form-level error for SRs
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
                  Harness the power of AI to trade smarter, faster, and with
                  greater confidence than ever before.
                </p>
              </header>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
                aria-describedby="form-errors"
              >
                {/* Identifier (email or username) */}
                <div>
                  <label
                    htmlFor="identifier"
                    className="mb-1 block text-sm font-medium"
                  >
                    Email or Username
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    inputMode="text"
                    className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    placeholder="alex.jordan@gmail.com or your_handle"
                    {...register("identifier")}
                    aria-invalid={!!errors.identifier}
                  />
                  {errors.identifier && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {errors.identifier.message}
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
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-violet-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
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

                {/* Google button (placeholder) */}
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white px-5 py-3 font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  onClick={() => window.alert("Use OAuth flow here")}
                >
                  Continue with Google
                </button>

                {/* Sign up hint */}
                <p className="text-center text-sm text-neutral-600">
                  Don’t have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-violet-700 hover:underline"
                  >
                    Sign up
                  </Link>
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
