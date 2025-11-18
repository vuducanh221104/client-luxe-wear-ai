"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateMeta } from "@/lib/utils";
import { GithubIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register as apiRegister, saveTokens } from "@/services/authUserService";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/authSlice";
import { useForm } from "react-hook-form";

type RegisterForm = { name: string; email: string; password: string; confirmPassword: string };

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<RegisterForm>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = handleSubmit(async (data: RegisterForm) => {
    setApiError(null);
    setInfo(null);
    const { name, email, password } = data;
    try {
      const res = await apiRegister(email.trim(), password, name.trim());
      if (!res.success) throw new Error(res.message || "Register failed");

      if (res.data?.requiresEmailConfirmation) {
        setInfo("Vui lòng kiểm tra email để xác nhận tài khoản.");
        setTimeout(() => router.push("/auth/login"), 1500);
      } else if (res.data?.user) {
        saveTokens(res.data?.accessToken, res.data?.refreshToken);
        dispatch(
          setCredentials({
            user: {
              id: res.data.user.id,
              email: res.data.user.email,
              name: res.data.user.name ?? null,
              role: (res.data as any)?.user?.role,
              email_verified: (res.data as any)?.user?.email_verified,
              is_active: (res.data as any)?.user?.is_active,
              last_login: (res.data as any)?.user?.last_login,
            },
            accessToken: res.data.accessToken ?? null,
            refreshToken: res.data.refreshToken ?? null
          })
        );
        router.push("/dashboard");
      }
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors as Array<{ msg: string; param?: string }>;
      if (Array.isArray(apiErrors)) {
        apiErrors.forEach((e) => {
          const field = (e.param as keyof RegisterForm) || "email";
          setError(field, { type: "server", message: e.msg });
        });
      } else {
        setApiError(err?.response?.data?.message || err?.message || "Đăng ký thất bại");
      }
    }
  });

  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="hidden w-1/2 bg-gray-100 lg:block">
        <img src={`/images/cover.png`} alt="Login visual" className="h-full w-full object-cover" />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Register</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create a new account to access the dashboard.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name" className={errors.name ? "text-red-600" : ""}>
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  {...register("name", {
                    required: "Vui lòng nhập tên",
                    minLength: { value: 2, message: "Tên tối thiểu 2 ký tự" },
                    maxLength: { value: 100, message: "Tên tối đa 100 ký tự" },
                  })}
                  className={`w-full ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm font-medium text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className={errors.email ? "text-red-600" : ""}>
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Vui lòng nhập email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email không hợp lệ",
                    },
                  })}
                  className={`w-full ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm font-medium text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className={errors.password ? "text-red-600" : ""}>
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                    minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                    maxLength: { value: 128, message: "Mật khẩu tối đa 128 ký tự" },
                  })}
                  className={`w-full ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm font-medium text-red-600">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className={errors.confirmPassword ? "text-red-600" : ""}>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword", {
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: (value) =>
                      value === password || "Mật khẩu xác nhận không khớp",
                  })}
                  className={`w-full ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm font-medium text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {apiError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-sm font-medium text-red-800">{apiError}</p>
                </div>
              )}
              {info && (
                <div className="rounded-md bg-green-50 border border-green-200 p-3">
                  <p className="text-sm font-medium text-green-800">{info}</p>
                </div>
              )}
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-muted px-2 text-gray-500">or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <GithubIcon className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account? {""}
              <a href="/auth/login" className="text-primary hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
