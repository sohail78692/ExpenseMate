"use client";

import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback, createContext, Children } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
// Importing class-variance-authority for the built-in button component
import { cva, type VariantProps } from "class-variance-authority";
// Importing icons from lucide-react
import { ArrowRight, Mail, Gem, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, PartyPopper, Loader, User } from "lucide-react";
// Importing animation components from framer-motion
import { AnimatePresence, motion, useInView, Variants, Transition } from "framer-motion";
import KineticDotsLoader from "@/components/ui/kinetic-dots-loader";

// --- CONFETTI LOGIC ---
import type { ReactNode } from "react"
import type { GlobalOptions as ConfettiGlobalOptions, CreateTypes as ConfettiInstance, Options as ConfettiOptions } from "canvas-confetti"
import confetti from "canvas-confetti"

type Api = { fire: (options?: ConfettiOptions) => void }
export type ConfettiRef = Api | null
const ConfettiContext = createContext<Api>({} as Api)

const Confetti = forwardRef<ConfettiRef, React.ComponentPropsWithRef<"canvas"> & { options?: ConfettiOptions; globalOptions?: ConfettiGlobalOptions; manualstart?: boolean }>((props, ref) => {
  const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props
  const instanceRef = useRef<ConfettiInstance | null>(null)
  const canvasRef = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      if (instanceRef.current) return
      instanceRef.current = confetti.create(node, { ...globalOptions, resize: true })
    } else {
      if (instanceRef.current) {
        instanceRef.current.reset()
        instanceRef.current = null
      }
    }
  }, [globalOptions])
  const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options])
  const api = useMemo(() => ({ fire }), [fire])
  useImperativeHandle(ref, () => api, [api])
  useEffect(() => { if (!manualstart) fire() }, [manualstart, fire])
  return <canvas ref={canvasRef} {...rest} />
})
Confetti.displayName = "Confetti";

// --- TEXT LOOP ANIMATION COMPONENT ---
type TextLoopProps = { children: React.ReactNode[]; className?: string; interval?: number; transition?: Transition; variants?: Variants; onIndexChange?: (index: number) => void; stopOnEnd?: boolean; };
export function TextLoop({ children, className, interval = 2, transition = { duration: 0.3 }, variants, onIndexChange, stopOnEnd = false }: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) {
          clearInterval(timer);
          return current;
        }
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);
  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };
  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.div key={currentIndex} initial='initial' animate='animate' exit='exit' transition={transition} variants={variants || motionVariants}>
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- BUILT-IN BLUR FADE ANIMATION COMPONENT ---
interface BlurFadeProps { children: React.ReactNode; className?: string; variant?: { hidden: { y: number }; visible: { y: number } }; duration?: number; delay?: number; yOffset?: number; inView?: boolean; inViewMargin?: string; blur?: string; }
function BlurFade({ children, className, variant, duration = 0.4, delay = 0, yOffset = 6, inView = true, inViewMargin = "-50px", blur = "6px" }: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as any });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: `blur(0px)` },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden" variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}


// --- BUILT-IN GLASS BUTTON COMPONENT (WITH CLICK FIX) ---
const glassButtonVariants = cva("relative isolate all-unset cursor-pointer rounded-full transition-all", { variants: { size: { default: "text-base font-medium", sm: "text-sm font-medium", lg: "text-lg font-medium", icon: "h-10 w-10" } }, defaultVariants: { size: "default" } });
const glassButtonTextVariants = cva("glass-button-text relative block select-none tracking-tighter", { variants: { size: { default: "px-6 py-3.5", sm: "px-4 py-2", lg: "px-8 py-4", icon: "flex h-10 w-10 items-center justify-center" } }, defaultVariants: { size: "default" } });
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof glassButtonVariants> { contentClassName?: string; }
export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const button = e.currentTarget.querySelector('button');
      if (button && e.target !== button) button.click();
    };
    return (
      <div className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)} onClick={handleWrapperClick}>
        <button className={cn("glass-button relative z-10", size !== "icon" && "w-full", glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
          <span className={cn(glassButtonTextVariants({ size }), size !== "icon" && "w-full", contentClassName)}>{children}</span>
        </button>
        <div className="glass-button-shadow rounded-full pointer-events-none"></div>
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";


// --- CHILD COMPONENTS ---
const modalSteps = [
    { message: "Signing you up...", icon: <Loader className="w-12 h-12 text-primary animate-spin" /> },
    { message: "Onboarding you...", icon: <Loader className="w-12 h-12 text-primary animate-spin" /> },
    { message: "Finalizing...", icon: <Loader className="w-12 h-12 text-primary animate-spin" /> },
    { message: "Welcome Aboard!", icon: <PartyPopper className="w-12 h-12 text-green-500" /> }
];
const TEXT_LOOP_INTERVAL = 1.5;

const DefaultLogo = () => ( <div className="bg-primary text-primary-foreground rounded-md p-1.5"> <Gem className="h-4 w-4" /> </div> );

// --- MAIN COMPONENT ---
export interface AuthComponentProps {
  logo?: React.ReactNode;
  brandName?: string;
  onSuccess?: () => void;
  mode?: "signup" | "signin";
  onSwitchMode?: () => void;
  onSubmitCredentials?: (credentials: { name?: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuthComponent = ({
  logo = <DefaultLogo />,
  brandName = "ExpenseMate",
  onSuccess,
  mode: initialMode = "signup",
  onSwitchMode,
  onSubmitCredentials,
  isModal = false,
  isOpen = true,
  onClose
}: AuthComponentProps) => {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<"signup" | "signin">(initialMode);
  const [direction, setDirection] = useState<number>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalStatus, setModalStatus] = useState<'closed' | 'loading' | 'error' | 'success'>('closed');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const confettiRef = useRef<ConfettiRef>(null);
  const prevInitialModeRef = useRef(initialMode);

  useEffect(() => {
    if (prevInitialModeRef.current !== initialMode) {
      prevInitialModeRef.current = initialMode;
      setDirection(initialMode === "signup" ? 1 : -1);
      setCurrentMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (!isModal || !isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModal, isOpen, onClose]);

  const handleToggleMode = () => {
    const next = currentMode === "signup" ? "signin" : "signup";
    setDirection(next === "signup" ? 1 : -1);
    setCurrentMode(next);
    setModalStatus('closed');
    setModalErrorMessage('');
    if (!isModal && typeof window !== "undefined") {
      window.history.replaceState(null, '', next === 'signup' ? '/register' : '/login');
    }
    if (onSwitchMode) onSwitchMode();
  };

  const isEmailValid = /\S+@\S+\.\S+/.test(email);

  const fireSideCanons = () => {
    const fire = confettiRef.current?.fire;
    if (fire) {
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
        const particleCount = 50;
        fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
        fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalStatus !== 'closed') return;

    if (currentMode === "signup") {
      if (!name.trim()) {
        setModalErrorMessage("Please enter your full name.");
        setModalStatus('error');
        return;
      }
      if (!isEmailValid) {
        setModalErrorMessage("Please enter a valid email address.");
        setModalStatus('error');
        return;
      }
      if (password.length < 6) {
        setModalErrorMessage("Password must be at least 6 characters long.");
        setModalStatus('error');
        return;
      }
      if (password !== confirmPassword) {
        setModalErrorMessage("Passwords do not match!");
        setModalStatus('error');
        return;
      }
    } else {
      if (!isEmailValid) {
        setModalErrorMessage("Please enter a valid email address.");
        setModalStatus('error');
        return;
      }
      if (!password) {
        setModalErrorMessage("Please enter your password.");
        setModalStatus('error');
        return;
      }
    }

    setModalStatus('loading');

    try {
      if (onSubmitCredentials) {
        const result = await onSubmitCredentials({ name: name.trim(), email, password });
        if (result && !result.success) {
          setModalErrorMessage(result.error || "Authentication failed. Please check your credentials.");
          setModalStatus('error');
          return;
        }
      } else if (currentMode === "signin") {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          if (res.error.includes("User not found") || res.error.includes("No user found")) {
            setModalErrorMessage("No account found with this email. Please check your email or sign up.");
          } else if (res.error.includes("password") || res.error.includes("Invalid")) {
            setModalErrorMessage("Incorrect password. Please try again or use 'Forgot Password'.");
          } else {
            setModalErrorMessage("Invalid email or password. Please try again.");
          }
          setModalStatus('error');
          return;
        }
      } else {
        // Sign up mode
        const regRes = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email,
            password,
          }),
        });

        if (!regRes.ok) {
          const data = await regRes.json();
          setModalErrorMessage(data.message || "Failed to create account. Please try again.");
          setModalStatus('error');
          return;
        }

        // Auto sign-in
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
      }

      fireSideCanons();
      setModalStatus('success');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace("/dashboard");
          router.refresh();
        }
      }, 1200);
    } catch (err: any) {
      console.error("Auth error:", err);
      setModalErrorMessage(err?.message || "Something went wrong. Please try again later.");
      setModalStatus('error');
    }
  };

  const closeModal = () => {
    setModalStatus('closed');
    setModalErrorMessage('');
  };

  useEffect(() => {
    if (modalStatus === 'success') {
      fireSideCanons();
    }
  }, [modalStatus]);
  
  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== 'closed' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-xs pointer-events-auto"
        >
          {modalStatus === 'loading' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center justify-center bg-transparent"
            >
              <KineticDotsLoader
                text={currentMode === "signup" ? "Creating your account..." : "Signing you in..."}
              />
            </motion.div>
          )}

          {modalStatus === 'success' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 bg-transparent p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <PartyPopper className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Welcome Aboard!
              </p>
            </motion.div>
          )}

          {modalStatus === 'error' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-3xl border border-red-500/30 bg-black/60 backdrop-blur-xl p-7 w-full max-w-sm flex flex-col items-center gap-4 mx-4 shadow-2xl"
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-3.5 right-3.5 p-1 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-sm font-medium text-zinc-100 text-center leading-relaxed">
                {modalErrorMessage}
              </p>
              <GlassButton onClick={closeModal} size="sm" className="mt-2 w-full">
                Try Again
              </GlassButton>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const glassStyles = `
    input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none !important; } input[type="password"]::-webkit-credentials-auto-fill-button, input[type="password"]::-webkit-strong-password-auto-fill-button { display: none !important; } input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px transparent inset !important; -webkit-text-fill-color: var(--foreground) !important; background-color: transparent !important; background-clip: content-box !important; transition: background-color 5000s ease-in-out 0s !important; color: var(--foreground) !important; caret-color: var(--foreground) !important; } input:autofill { background-color: transparent !important; background-clip: content-box !important; -webkit-text-fill-color: var(--foreground) !important; color: var(--foreground) !important; } input:-internal-autofill-selected { background-color: transparent !important; background-image: none !important; color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground) !important; } input:-webkit-autofill::first-line { color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground) !important; }
    @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; } @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
    .glass-button-wrap { --anim-time: 400ms; --anim-ease: cubic-bezier(0.25, 1, 0.5, 1); --border-width: clamp(1px, 0.0625em, 4px); position: relative; z-index: 2; transform-style: preserve-3d; transition: transform var(--anim-time) var(--anim-ease); } .glass-button-wrap:has(.glass-button:active) { transform: rotateX(25deg); } .glass-button-shadow { --shadow-cutoff-fix: 2em; position: absolute; width: calc(100% + var(--shadow-cutoff-fix)); height: calc(100% + var(--shadow-cutoff-fix)); top: calc(0% - var(--shadow-cutoff-fix) / 2); left: calc(0% - var(--shadow-cutoff-fix) / 2); filter: blur(clamp(2px, 0.125em, 12px)); transition: filter var(--anim-time) var(--anim-ease); pointer-events: none; z-index: 0; } .glass-button-shadow::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(180deg, oklch(from var(--foreground) l c h / 20%), oklch(from var(--foreground) l c h / 10%)); width: calc(100% - var(--shadow-cutoff-fix) - 0.25em); height: calc(100% - var(--shadow-cutoff-fix) - 0.25em); top: calc(var(--shadow-cutoff-fix) - 0.5em); left: calc(var(--shadow-cutoff-fix) - 0.875em); padding: 0.125em; box-sizing: border-box; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease); opacity: 1; }
    .glass-button { -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim-time) var(--anim-ease); background: linear-gradient(-75deg, oklch(from var(--background) l c h / 5%), oklch(from var(--background) l c h / 20%), oklch(from var(--background) l c h / 5%)); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.25em 0.125em -0.125em oklch(from var(--foreground) l c h / 20%), 0 0 0.1em 0.25em inset oklch(from var(--background) l c h / 20%), 0 0 0 0 oklch(from var(--background) l c h); } .glass-button:hover { transform: scale(0.975); backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.15em 0.05em -0.1em oklch(from var(--foreground) l c h / 25%), 0 0 0.05em 0.1em inset oklch(from var(--background) l c h / 50%), 0 0 0 0 oklch(from var(--background) l c h); } .glass-button-text { color: oklch(from var(--foreground) l c h / 90%); text-shadow: 0em 0.25em 0.05em oklch(from var(--foreground) l c h / 10%); transition: all var(--anim-time) var(--anim-ease); } .glass-button:hover .glass-button-text { text-shadow: 0.025em 0.025em 0.025em oklch(from var(--foreground) l c h / 12%); } .glass-button-text::after { content: ""; display: block; position: absolute; width: calc(100% - var(--border-width)); height: calc(100% - var(--border-width)); top: calc(0% + var(--border-width) / 2); left: calc(0% + var(--border-width) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, oklch(from var(--background) l c h / 50%) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(var(--anim-time) * 1.25) var(--anim-ease), --angle-2 calc(var(--anim-time) * 1.25) var(--anim-ease); } .glass-button:hover .glass-button-text::after { background-position: 25% 50%; } .glass-button:active .glass-button-text::after { background-position: 50% 15%; --angle-2: -15deg; } .glass-button::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + var(--border-width)); height: calc(100% + var(--border-width)); top: calc(0% - var(--border-width) / 2); left: calc(0% - var(--border-width) / 2); padding: var(--border-width); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, oklch(from var(--foreground) l c h / 50%) 0%, transparent 5% 40%, oklch(from var(--foreground) l c h / 50%) 50%, transparent 60% 95%, oklch(from var(--foreground) l c h / 50%) 100%), linear-gradient(180deg, oklch(from var(--background) l c h / 50%), oklch(from var(--background) l c h / 50%)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(var(--border-width) / 2) oklch(from var(--background) l c h / 50%); pointer-events: none; } .glass-button:hover::after { --angle-1: -125deg; } .glass-button:active::after { --angle-1: -75deg; } .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow { filter: blur(clamp(2px, 0.0625em, 6px)); } .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.875em); opacity: 1; } .glass-button-wrap:has(.glass-button:active) .glass-button-shadow { filter: blur(clamp(2px, 0.125em, 12px)); } .glass-button-wrap:has(.glass-button:active) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.5em); opacity: 0.75; } .glass-button-wrap:has(.glass-button:active) .glass-button-text { text-shadow: 0.025em 0.25em 0.05em oklch(from var(--foreground) l c h / 12%); } .glass-button-wrap:has(.glass-button:active) .glass-button { box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.125em 0.125em -0.125em oklch(from var(--foreground) l c h / 20%), 0 0 0.1em 0.25em inset oklch(from var(--background) l c h / 20%), 0 0.225em 0.05em 0 oklch(from var(--foreground) l c h / 5%), 0 0.25em 0 0 oklch(from var(--background) l c h / 75%), inset 0 0.25em 0.05em 0 oklch(from var(--foreground) l c h / 15%); } @media (hover: none) and (pointer: coarse) { .glass-button::after, .glass-button:hover::after, .glass-button:active::after { --angle-1: -75deg; } .glass-button .glass-button-text::after, .glass-button:active .glass-button-text::after { --angle-2: -45deg; } }
    .glass-input-wrap { position: relative; z-index: 2; transform-style: preserve-3d; border-radius: 9999px; } .glass-input { display: flex; position: relative; width: 100%; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.25rem; -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1); background: linear-gradient(-75deg, oklch(from var(--background) l c h / 5%), oklch(from var(--background) l c h / 20%), oklch(from var(--background) l c h / 5%)); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.25em 0.125em -0.125em oklch(from var(--foreground) l c h / 20%), 0 0 0.1em 0.25em inset oklch(from var(--background) l c h / 20%), 0 0 0 0 oklch(from var(--background) l c h); } .glass-input-wrap:focus-within .glass-input { backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.15em 0.05em -0.1em oklch(from var(--foreground) l c h / 25%), 0 0 0.05em 0.1em inset oklch(from var(--background) l c h / 50%), 0 0 0 0 oklch(from var(--background) l c h); } .glass-input::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + clamp(1px, 0.0625em, 4px)); height: calc(100% + clamp(1px, 0.0625em, 4px)); top: calc(0% - clamp(1px, 0.0625em, 4px) / 2); left: calc(0% - clamp(1px, 0.0625em, 4px) / 2); padding: clamp(1px, 0.0625em, 4px); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, oklch(from var(--foreground) l c h / 50%) 0%, transparent 5% 40%, oklch(from var(--foreground) l c h / 50%) 50%, transparent 60% 95%, oklch(from var(--foreground) l c h / 50%) 100%), linear-gradient(180deg, oklch(from var(--background) l c h / 50%), oklch(from var(--background) l c h / 50%)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(clamp(1px, 0.0625em, 4px) / 2) oklch(from var(--background) l c h / 50%); pointer-events: none; } .glass-input-wrap:focus-within .glass-input::after { --angle-1: -125deg; } .glass-input-text-area { position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; } .glass-input-text-area::after { content: ""; display: block; position: absolute; width: calc(100% - clamp(1px, 0.0625em, 4px)); height: calc(100% - clamp(1px, 0.0625em, 4px)); top: calc(0% + clamp(1px, 0.0625em, 4px) / 2); left: calc(0% + clamp(1px, 0.0625em, 4px) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, oklch(from var(--background) l c h / 50%) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1), --angle-2 calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1); } .glass-input-wrap:focus-within .glass-input-text-area::after { background-position: 25% 50%; }
  `;

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 32 : -32,
      opacity: 0,
      filter: "blur(6px)",
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 340, damping: 28 },
        opacity: { duration: 0.24, ease: "easeOut" },
        filter: { duration: 0.24, ease: "easeOut" },
        scale: { duration: 0.24, ease: "easeOut" },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -32 : 32,
      opacity: 0,
      filter: "blur(6px)",
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 340, damping: 28 },
        opacity: { duration: 0.16, ease: "easeIn" },
        filter: { duration: 0.16, ease: "easeIn" },
        scale: { duration: 0.16, ease: "easeIn" },
      },
    }),
  };

  const authContent = (
    <fieldset disabled={modalStatus !== 'closed'} className="relative z-10 flex flex-col items-center gap-5 w-full mx-auto">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {currentMode === "signin" ? (
          <motion.div
            key="signin-view"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full flex flex-col items-center gap-5"
          >
            <div className="w-full text-center space-y-1">
              <h2 className="font-serif font-light text-2xl sm:text-3xl tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm font-medium text-zinc-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                Enter your credentials to access your account.
              </p>
            </div>

            <form onSubmit={handleFinalSubmit} className="w-full space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] pl-2">Email Address</label>
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <span className="glass-input-text-area"></span>
                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                      <Mail className="h-4 w-4 text-zinc-300" />
                    </div>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="relative z-10 h-9 w-0 flex-grow bg-transparent text-white placeholder:text-zinc-300/80 focus:outline-none text-sm pr-3"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] pl-2">Password</label>
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <span className="glass-input-text-area"></span>
                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                      <Lock className="h-4 w-4 text-zinc-300" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="relative z-10 h-9 w-0 flex-grow bg-transparent text-white placeholder:text-zinc-300/80 focus:outline-none text-sm pr-2"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="relative z-10 pr-3 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end pt-0.5 pr-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-200 hover:text-white font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] transition-colors underline-offset-4 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <GlassButton
                  type="submit"
                  size="default"
                  className="w-full"
                  contentClassName="w-full flex items-center justify-center gap-2 font-semibold"
                >
                  <span className="inline-flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </GlassButton>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="signup-view"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full flex flex-col items-center gap-5"
          >
            <div className="w-full text-center space-y-1">
              <h2 className="font-serif font-light text-2xl sm:text-3xl tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Create Account
              </h2>
              <p className="text-xs sm:text-sm font-medium text-zinc-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                Take control of your money and build smarter spending habits.
              </p>
            </div>

            <form onSubmit={handleFinalSubmit} className="w-full space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] pl-2">Full Name</label>
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <span className="glass-input-text-area"></span>
                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                      <User className="h-4 w-4 text-zinc-300" />
                    </div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="relative z-10 h-9 w-0 flex-grow bg-transparent text-white placeholder:text-zinc-300/80 focus:outline-none text-sm pr-3"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] pl-2">Email Address</label>
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <span className="glass-input-text-area"></span>
                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                      <Mail className="h-4 w-4 text-zinc-300" />
                    </div>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="relative z-10 h-9 w-0 flex-grow bg-transparent text-white placeholder:text-zinc-300/80 focus:outline-none text-sm pr-3"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] pl-2">Password</label>
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <span className="glass-input-text-area"></span>
                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                      <Lock className="h-4 w-4 text-zinc-300" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="relative z-10 h-9 w-0 flex-grow bg-transparent text-white placeholder:text-zinc-300/80 focus:outline-none text-sm pr-2"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="relative z-10 pr-3 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] pl-2">Confirm Password</label>
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <span className="glass-input-text-area"></span>
                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                      <Lock className="h-4 w-4 text-zinc-300" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="relative z-10 h-9 w-0 flex-grow bg-transparent text-white placeholder:text-zinc-300/80 focus:outline-none text-sm pr-2"
                    />
                    <button
                      type="button"
                      aria-label="Toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="relative z-10 pr-3 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <GlassButton
                  type="submit"
                  size="default"
                  className="w-full"
                  contentClassName="w-full flex items-center justify-center gap-2 font-semibold"
                >
                  <span className="inline-flex items-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </GlassButton>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full text-center">
        <div className="text-xs text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] flex flex-col items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={currentMode}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {currentMode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="text-sky-300 hover:text-sky-200 active:scale-90 hover:scale-105 transition-all inline-block font-bold ml-1 cursor-pointer underline-offset-4 hover:underline drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="text-sky-300 hover:text-sky-200 active:scale-90 hover:scale-105 transition-all inline-block font-bold ml-1 cursor-pointer underline-offset-4 hover:underline drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </fieldset>
  );

  if (isModal) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <style>{glassStyles}</style>
            <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
            <Modal />

            {/* Transparent backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-transparent cursor-pointer"
              aria-hidden="true"
            />

            {/* Modal Card in middle of screen - totally transparent glass */}
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
                layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
              }}
              onClick={(e) => e.stopPropagation()}
              className="dark relative z-10 w-full max-w-[390px] rounded-3xl border border-white/20 bg-black/25 backdrop-blur-xl p-6 sm:p-7 shadow-2xl overflow-hidden"
            >
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {authContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="dark bg-[#030712] text-white min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4">
      <style>{glassStyles}</style>
      <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
      <Modal />

      <Link
        href="/"
        className="fixed top-4 left-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <motion.div
        layout
        transition={{ layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        className="relative z-10 w-full max-w-[390px] rounded-3xl border border-white/20 bg-black/25 backdrop-blur-xl p-6 sm:p-7 shadow-2xl overflow-hidden my-auto"
      >
        {authContent}
      </motion.div>
    </div>
  );
};

export const AuthModal = (props: AuthComponentProps) => <AuthComponent {...props} isModal={true} />;

export default AuthComponent;
