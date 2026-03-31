"use client";

import * as React from "react";
import { useState, useId, useEffect, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, ArrowLeft, MailCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

interface SignInFormProps {
  onSubmit: (data: { username: string; password: string }) => Promise<void>;
  onForgotPassword?: () => void;
  error?: string;
  loading?: boolean;
}

function SignInForm({ onSubmit, onForgotPassword, error, loading }: SignInFormProps) {
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await onSubmit({
      username: data.get("email") as string,
      password: data.get("password") as string,
    });
  };
  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email below to sign in</p>
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email or Username</Label>
          <Input id="email" name="email" type="text" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password-signin">Password</Label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
          <PasswordInput id="password-signin" name="password" required autoComplete="current-password" placeholder="Password" />
        </div>
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

interface SignUpFormProps {
  onSubmit: (data: { username: string; email: string; password: string }) => Promise<void>;
  error?: string;
  loading?: boolean;
}

function SignUpForm({ onSubmit, error, loading }: SignUpFormProps) {
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await onSubmit({
      username: data.get("name") as string,
      email: data.get("email") as string,
      password: data.get("password") as string,
    });
  };
  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your details below to sign up</p>
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="name">Username</Label>
          <Input id="name" name="name" type="text" placeholder="johndoe" required autoComplete="username" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="Password"/>
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Creating account…" : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}

// ── OTP Verify Form ──────────────────────────────────────────────────────────
interface OtpVerifyFormProps {
  email: string;
  onSubmit: (code: string) => Promise<void>;
  onBack: () => void;
  error?: string;
  loading?: boolean;
  purpose?: "signup" | "forgot_password";
}

export function OtpVerifyForm({ email, onSubmit, onBack, error, loading, purpose = "signup" }: OtpVerifyFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  const handleChange = (i: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(digits.join(""));
  };

  const isComplete = digits.every(Boolean);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
          <MailCheck className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">
          {purpose === "signup" ? "Verify your email" : "Enter reset code"}
        </h1>
        <p className="text-balance text-sm text-muted-foreground">
          We sent a 6-digit code to <strong className="text-foreground">{email}</strong>. It expires in 10 minutes.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            className="w-11 h-13 text-center text-xl font-bold rounded-lg border border-input bg-background shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            style={{ height: "52px" }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" variant="default" disabled={loading || !isComplete}>
          {loading ? "Verifying…" : purpose === "signup" ? "Verify & Create Account" : "Verify Code"}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>
    </form>
  );
}

// ── Forgot Password Form ──────────────────────────────────────────────────────
interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBack: () => void;
  error?: string;
  loading?: boolean;
}

export function ForgotPasswordForm({ onSubmit, onBack, error, loading }: ForgotPasswordFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await onSubmit(data.get("email") as string);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email and we'll send you a reset code.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Sending…" : "Send Reset Code"}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </button>
      </div>
    </form>
  );
}

// ── Reset Password Form ───────────────────────────────────────────────────────
interface ResetPasswordFormProps {
  onSubmit: (newPassword: string) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export function ResetPasswordForm({ onSubmit, error, loading }: ResetPasswordFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await onSubmit(data.get("password") as string);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Set new password</h1>
        <p className="text-balance text-sm text-muted-foreground">Must be at least 8 characters.</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <PasswordInput name="password" label="New Password" required autoComplete="new-password" placeholder="New password" />
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Saving…" : "Update Password"}
        </Button>
      </div>
    </form>
  );
}

interface AuthFormContainerProps {
  isSignIn: boolean;
  onToggle: () => void;
  onSignIn: SignInFormProps["onSubmit"];
  onSignUp: SignUpFormProps["onSubmit"];
  onForgotPassword?: () => void;
  error?: string;
  loading?: boolean;
}

function AuthFormContainer({ isSignIn, onToggle, onSignIn, onSignUp, onForgotPassword, error, loading }: AuthFormContainerProps) {
    return (
        <div className="mx-auto grid w-[350px] gap-2">
            {isSignIn
              ? <SignInForm onSubmit={onSignIn} onForgotPassword={onForgotPassword} error={error} loading={loading} />
              : <SignUpForm onSubmit={onSignUp} error={error} loading={loading} />
            }
            <div className="text-center text-sm">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="pl-1 text-foreground" onClick={onToggle} type="button">
                    {isSignIn ? "Sign up" : "Sign in"}
                </Button>
            </div>
        </div>
    );
}

interface AuthContentProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    }
}

export interface AuthUIProps {
    defaultSignIn?: boolean;
    signInContent?: AuthContentProps;
    signUpContent?: AuthContentProps;
    onSignIn: SignInFormProps["onSubmit"];
    onSignUp: SignUpFormProps["onSubmit"];
    onForgotPassword?: () => void;
    error?: string;
    loading?: boolean;
}

const defaultSignInContent = {
    image: {
        src: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80",
        alt: "AI neural network visualization"
    },
    quote: {
        text: "Your agents are waiting. Let's build something great.",
        author: "FlawLess"
    }
};

const defaultSignUpContent = {
    image: {
        src: "https://images.unsplash.com/photo-1676299081847-824916de030a?w=1200&auto=format&fit=crop&q=80",
        alt: "Futuristic AI technology"
    },
    quote: {
        text: "The future of automation starts here.",
        author: "FlawLess"
    }
};

export function AuthUI({
  defaultSignIn = true,
  signInContent = {},
  signUpContent = {},
  onSignIn,
  onSignUp,
  onForgotPassword,
  error,
  loading,
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(defaultSignIn);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
      image: { ...defaultSignInContent.image, ...signInContent.image },
      quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
      image: { ...defaultSignUpContent.image, ...signUpContent.image },
      quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <AuthFormContainer
          isSignIn={isSignIn}
          onToggle={toggleForm}
          onSignIn={onSignIn}
          onSignUp={onSignUp}
          onForgotPassword={onForgotPassword}
          error={error}
          loading={loading}
        />
      </div>

      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-6">
            <blockquote className="space-y-2 text-center text-foreground">
              <p className="text-lg font-medium">
                &ldquo;<Typewriter
                    key={currentContent.quote.text}
                    text={currentContent.quote.text}
                    speed={60}
                  />&rdquo;
              </p>
              <cite className="block text-sm font-light text-muted-foreground not-italic">
                  — {currentContent.quote.author}
              </cite>
            </blockquote>
        </div>
      </div>
    </div>
  );
}
