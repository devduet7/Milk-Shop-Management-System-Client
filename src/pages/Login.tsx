// <== IMPORTS ==>
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { memo, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Moon, Sun, Milk, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/validators/authSchemas";

// <== LOGIN PAGE COMPONENT ==>
const Login = () => {
  // SHOW PASSWORD STATE
  const [showPw, setShowPw] = useState<boolean>(false);
  // THEME HOOK
  const { theme, toggleTheme } = useTheme();
  // LOGIN MUTATION HOOK - DESTRUCTURE ONLY STABLE REFERENCES
  const { mutate: loginMutate, isPending } = useLogin();
  // FORM SETUP WITH ZOD RESOLVER
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    // ZOD SCHEMA RESOLVER FOR VALIDATION
    resolver: zodResolver(loginSchema),
    // VALIDATE AND CLEAR ERRORS ON CHANGE (ERRORS DISAPPEAR AS USER TYPES)
    mode: "onChange",
    // DEFAULT VALUES
    defaultValues: {
      email: "",
      password: "",
    },
  });
  // TOGGLE PASSWORD VISIBILITY
  const handleTogglePassword = useCallback((): void => {
    setShowPw((prev) => !prev);
  }, []);
  // FORM SUBMIT HANDLER
  const onSubmit = useCallback(
    (data: LoginFormValues): void => {
      // CALL LOGIN MUTATION WITH PER-CALL TOAST CALLBACKS
      loginMutate(data, {
        // SHOW SUCCESS TOAST ON SUCCESSFUL LOGIN
        onSuccess: () => {
          toast.success("Welcome Back! Login Successful");
        },
        // SHOW ERROR TOAST ON FAILED LOGIN
        onError: (error) => {
          toast.error(
            error.response?.data?.message ?? "Login Failed. Please Try Again",
          );
        },
      });
    },
    [loginMutate],
  );
  // RETURNING THE LOGIN PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* THEME TOGGLE - FIXED TO CORNER ON ALL SCREEN SIZES */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          {theme === "light" ? (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </Button>
      </div>
      {/* BACKGROUND CIRCLE TOP LEFT */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      {/* BACKGROUND CIRCLE BOTTOM RIGHT */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
      {/* FORM CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
        className="w-full max-w-md"
      >
        {/* FORM CARD */}
        <div className="glass-card p-6 sm:p-8">
          {/* LOGO */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Milk className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
          {/* FORM HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your Milk Shop account
            </p>
          </motion.div>
          {/* FORM CONTENT */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* EMAIL INPUT */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@milkshop.com"
                className="mt-1.5"
                {...register("email")}
              />
              {/* EMAIL VALIDATION ERROR - CLEARS ON TYPING VIA mode: "onChange" */}
              {errors.email && (
                <p className="text-destructive text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </motion.div>
            {/* PASSWORD INPUT */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
                {/* PASSWORD VISIBILITY TOGGLE */}
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* PASSWORD VALIDATION ERROR - CLEARS ON TYPING VIA mode: "onChange" */}
              {errors.password && (
                <p className="text-destructive text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </motion.div>
            {/* SIGN IN BUTTON */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button type="submit" className="w-full" disabled={isPending}>
                {/* LOADER ICON WHILE PENDING */}
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default memo(Login);
