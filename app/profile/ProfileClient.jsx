"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import {
    Camera,
    User,
    Lock,
    AlertTriangle,
    ShieldCheck,
    Mail,
    Phone,
    Palette,
    Trash2,
    Check,
    X,
    Loader2,
    Eye,
    EyeOff,
    LogOut,
    Download,
    Laptop,
    Copy,
    Monitor,
    Sun,
    Moon,
    Globe,
    Bell,
    Calendar,
    Coins,
    Layers,
    ChevronRight,
    UserCheck,
    Cookie,
    MessageSquare,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT_PRESETS = [
    {
        id: "indigo",
        label: "Indigo Violet",
        rgb: "99, 102, 241",
        swatch: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        cta: "from-[#5B54F7] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] shadow-indigo-500/25",
        iconBg: "from-[#5B54F7] to-[#7C3AED]",
        highlightText: "text-[#5B4BFF] dark:text-violet-400",
        ring: "ring-[#6366F1]/40 border-[#6366F1] dark:border-violet-400",
        activePill:
            "bg-gradient-to-r from-[#5B54F7]/14 via-[#7C3AED]/10 to-white/40 dark:from-indigo-500/22 dark:via-violet-500/14 dark:to-white/[0.03] border-[#6366F1]/30 dark:border-violet-400/30 shadow-[0_8px_24px_-12px_rgba(91,84,247,0.35)]",
    },
    {
        id: "ocean",
        label: "Ocean Blue",
        rgb: "14, 165, 233",
        swatch: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
        cta: "from-[#0284C7] to-[#2563EB] hover:from-[#0369A1] hover:to-[#1D4ED8] shadow-blue-500/25",
        iconBg: "from-[#0EA5E9] to-[#2563EB]",
        highlightText: "text-[#0066CC] dark:text-sky-400",
        ring: "ring-[#0EA5E9]/40 border-[#0284C7] dark:border-sky-400",
        activePill:
            "bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-white/40 dark:from-sky-500/22 dark:via-blue-500/14 dark:to-white/[0.03] border-sky-500/30 dark:border-sky-400/30 shadow-[0_8px_24px_-12px_rgba(14,165,233,0.35)]",
    },
    {
        id: "emerald",
        label: "Mint Emerald",
        rgb: "16, 185, 129",
        swatch: "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",
        cta: "from-[#059669] to-[#0D9488] hover:from-[#047857] hover:to-[#0F766E] shadow-emerald-500/25",
        iconBg: "from-[#10B981] to-[#14B8A6]",
        highlightText: "text-emerald-600 dark:text-emerald-400",
        ring: "ring-emerald-500/40 border-emerald-600 dark:border-emerald-400",
        activePill:
            "bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-white/40 dark:from-emerald-500/22 dark:via-teal-500/14 dark:to-white/[0.03] border-emerald-500/30 dark:border-emerald-400/30 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.35)]",
    },
    {
        id: "amber",
        label: "Solar Amber",
        rgb: "245, 158, 11",
        swatch: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
        cta: "from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] shadow-amber-500/25",
        iconBg: "from-[#F59E0B] to-[#F97316]",
        highlightText: "text-amber-600 dark:text-amber-400",
        ring: "ring-amber-500/40 border-amber-600 dark:border-amber-400",
        activePill:
            "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-white/40 dark:from-amber-500/22 dark:via-orange-500/14 dark:to-white/[0.03] border-amber-500/30 dark:border-amber-400/30 shadow-[0_8px_24px_-12px_rgba(245,158,11,0.35)]",
    },
    {
        id: "rose",
        label: "Sunset Rose",
        rgb: "244, 63, 94",
        swatch: "linear-gradient(135deg, #FB7185 0%, #EC4899 100%)",
        cta: "from-[#E11D48] to-[#DB2777] hover:from-[#BE123C] hover:to-[#BE185D] shadow-rose-500/25",
        iconBg: "from-[#FB7185] to-[#EC4899]",
        highlightText: "text-rose-600 dark:text-rose-400",
        ring: "ring-rose-500/40 border-rose-500 dark:border-rose-400",
        activePill:
            "bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-white/40 dark:from-rose-500/22 dark:via-pink-500/14 dark:to-white/[0.03] border-rose-500/30 dark:border-rose-400/30 shadow-[0_8px_24px_-12px_rgba(244,63,94,0.35)]",
    },
];

// Optical liquid-glass button, nav pill & card styles modeled after the Auth (Login/Sign-Up/Forgot-Password) glass shader
const profileGlassStyles = `
  @property --profile-angle-1 {
    syntax: "<angle>";
    inherits: false;
    initial-value: -75deg;
  }
  @property --profile-angle-2 {
    syntax: "<angle>";
    inherits: false;
    initial-value: -45deg;
  }

  .profile-glass-shell {
    isolation: isolate;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.56) 0%, rgba(255, 255, 255, 0.36) 100%);
    backdrop-filter: blur(28px) saturate(195%);
    -webkit-backdrop-filter: blur(28px) saturate(195%);
    border: 1px solid rgba(255, 255, 255, 0.85);
    box-shadow:
      inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
      inset 0 -1px 1px 0 rgba(15, 23, 42, 0.04),
      0 24px 52px -20px rgba(37, 99, 235, 0.16),
      0 8px 24px -10px rgba(15, 23, 42, 0.07);
  }
  .dark .profile-glass-shell {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.055) 0%, rgba(5, 8, 18, 0.38) 100%);
    backdrop-filter: blur(28px) saturate(200%);
    -webkit-backdrop-filter: blur(28px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow:
      inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.22),
      inset 0 -1px 1.5px 0 rgba(0, 0, 0, 0.55),
      0 26px 60px -18px rgba(0, 0, 0, 0.85);
  }

  .profile-glass-subcard {
    background: linear-gradient(150deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.4) 100%);
    backdrop-filter: blur(18px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.82);
    box-shadow:
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.9),
      0 8px 24px -12px rgba(15, 23, 42, 0.08);
  }
  .dark .profile-glass-subcard {
    background: linear-gradient(150deg, rgba(255, 255, 255, 0.045) 0%, rgba(8, 12, 24, 0.32) 100%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.14),
      0 10px 28px -12px rgba(0, 0, 0, 0.55);
  }

  /* Optical Glass Pill / Button (matches Auth GlassButton specular rim + light sweep) */
  .profile-glass-btn {
    --anim-time: 380ms;
    --anim-ease: cubic-bezier(0.25, 1, 0.5, 1);
    --rim-width: 1.25px;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    transition: all var(--anim-time) var(--anim-ease);
    transform-style: preserve-3d;
  }

  .profile-glass-btn::after {
    content: "";
    position: absolute;
    z-index: 1;
    inset: 0;
    border-radius: inherit;
    padding: var(--rim-width);
    box-sizing: border-box;
    pointer-events: none;
    background:
      conic-gradient(
        from var(--profile-angle-1) at 50% 50%,
        rgba(15, 23, 42, 0.28) 0%,
        transparent 6% 40%,
        rgba(15, 23, 42, 0.28) 50%,
        transparent 60% 94%,
        rgba(15, 23, 42, 0.28) 100%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.45));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    transition: all var(--anim-time) var(--anim-ease), --profile-angle-1 500ms ease;
  }

  .dark .profile-glass-btn::after {
    background:
      conic-gradient(
        from var(--profile-angle-1) at 50% 50%,
        rgba(255, 255, 255, 0.58) 0%,
        transparent 6% 40%,
        rgba(255, 255, 255, 0.58) 50%,
        transparent 60% 94%,
        rgba(255, 255, 255, 0.58) 100%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08));
  }

  .profile-glass-btn:hover::after {
    --profile-angle-1: -125deg;
  }

  .profile-glass-btn:active {
    transform: scale(0.975);
  }

  .profile-glass-sheen {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }

  .profile-glass-sheen::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      var(--profile-angle-2),
      transparent 0%,
      rgba(255, 255, 255, 0.55) 42% 50%,
      transparent 58%
    );
    background-size: 220% 220%;
    background-position: 0% 50%;
    mix-blend-mode: screen;
    opacity: 0.65;
    transition:
      background-position 480ms cubic-bezier(0.25, 1, 0.5, 1),
      --profile-angle-2 480ms cubic-bezier(0.25, 1, 0.5, 1),
      opacity 300ms ease;
  }

  .profile-glass-btn:hover .profile-glass-sheen::after {
    background-position: 32% 50%;
    opacity: 0.95;
  }

  .profile-glass-btn:active .profile-glass-sheen::after {
    background-position: 55% 20%;
    --profile-angle-2: -15deg;
  }

  /* Neutral Glass Button (exact smoky dark / icy light crystal look of Login & Forgot Password) */
  .profile-glass-btn-neutral {
    background: linear-gradient(-75deg, rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.46));
    color: #0f172a;
    box-shadow:
      inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95),
      inset 0 -1.5px 1.5px rgba(15, 23, 42, 0.08),
      0 6px 16px -6px rgba(15, 23, 42, 0.14);
  }
  .profile-glass-btn-neutral:hover {
    transform: translateY(-1px) scale(0.99);
    background: linear-gradient(-75deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.62));
    box-shadow:
      inset 0 1.5px 2px rgba(255, 255, 255, 1),
      inset 0 -1.5px 1.5px rgba(15, 23, 42, 0.1),
      0 10px 24px -8px rgba(37, 99, 235, 0.18);
  }
  .dark .profile-glass-btn-neutral {
    background: linear-gradient(-75deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03));
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    box-shadow:
      inset 0 1.5px 1.5px rgba(255, 255, 255, 0.24),
      inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.45),
      0 8px 20px -6px rgba(0, 0, 0, 0.65),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  }
  .dark .profile-glass-btn-neutral:hover {
    transform: translateY(-1px) scale(0.99);
    background: linear-gradient(-75deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.06));
    color: #ffffff;
    box-shadow:
      inset 0 1.5px 2px rgba(255, 255, 255, 0.36),
      inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.5),
      0 12px 26px -6px rgba(0, 0, 0, 0.78);
  }

  /* Accent Translucent Glass CTA (Save Changes, Save Cmd+S, Submit) */
  .profile-glass-btn-accent {
    background: linear-gradient(
      -75deg,
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.86),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.98),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.86)
    );
    color: #ffffff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    box-shadow:
      inset 0 1.5px 2px rgba(255, 255, 255, 0.55),
      inset 0 -2px 2px rgba(0, 0, 0, 0.18),
      0 10px 26px -6px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.48);
  }
  .profile-glass-btn-accent::after {
    background:
      conic-gradient(
        from var(--profile-angle-1) at 50% 50%,
        rgba(255, 255, 255, 0.8) 0%,
        transparent 6% 40%,
        rgba(255, 255, 255, 0.8) 50%,
        transparent 60% 94%,
        rgba(255, 255, 255, 0.8) 100%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.45), rgba(var(--profile-accent-rgb, 99, 102, 241), 0.35));
  }
  .profile-glass-btn-accent:hover {
    transform: translateY(-1px) scale(0.99);
    box-shadow:
      inset 0 1.5px 2.5px rgba(255, 255, 255, 0.7),
      inset 0 -2px 2px rgba(0, 0, 0, 0.22),
      0 14px 32px -6px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.62);
  }
  .dark .profile-glass-btn-accent {
    background: linear-gradient(
      -75deg,
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.28),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.52),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.28)
    );
    color: #ffffff;
    box-shadow:
      inset 0 1.5px 2px rgba(255, 255, 255, 0.48),
      inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.45),
      0 10px 28px -6px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.5),
      0 0 18px 0 rgba(var(--profile-accent-rgb, 99, 102, 241), 0.24);
  }
  .dark .profile-glass-btn-accent:hover {
    background: linear-gradient(
      -75deg,
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.38),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.64),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.38)
    );
    box-shadow:
      inset 0 1.5px 2.5px rgba(255, 255, 255, 0.62),
      inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.5),
      0 14px 34px -6px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.64),
      0 0 24px 0 rgba(var(--profile-accent-rgb, 99, 102, 241), 0.34);
  }

  /* Soft Danger Glass Button (Sign Out, Remove) */
  .profile-glass-btn-danger {
    background: linear-gradient(-75deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.16), rgba(239, 68, 68, 0.08));
    color: #dc2626;
    box-shadow:
      inset 0 1.5px 1.5px rgba(255, 255, 255, 0.85),
      inset 0 -1px 1px rgba(220, 38, 38, 0.12),
      0 6px 16px -6px rgba(239, 68, 68, 0.18);
  }
  .profile-glass-btn-danger::after {
    background:
      conic-gradient(
        from var(--profile-angle-1) at 50% 50%,
        rgba(239, 68, 68, 0.5) 0%,
        transparent 6% 40%,
        rgba(239, 68, 68, 0.5) 50%,
        transparent 60% 94%,
        rgba(239, 68, 68, 0.5) 100%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(239, 68, 68, 0.25));
  }
  .dark .profile-glass-btn-danger {
    background: linear-gradient(-75deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.22), rgba(239, 68, 68, 0.1));
    color: #fca5a5;
    box-shadow:
      inset 0 1.5px 1.5px rgba(255, 255, 255, 0.22),
      inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.45),
      0 8px 20px -6px rgba(239, 68, 68, 0.28);
  }
  .dark .profile-glass-btn-danger:hover {
    background: linear-gradient(-75deg, rgba(239, 68, 68, 0.18), rgba(239, 68, 68, 0.34), rgba(239, 68, 68, 0.18));
    color: #fecaca;
    box-shadow:
      inset 0 1.5px 2px rgba(255, 255, 255, 0.34),
      0 10px 26px -6px rgba(239, 68, 68, 0.4);
  }

  /* Solid Danger Glass Button (Delete Account) */
  .profile-glass-btn-danger-solid {
    background: linear-gradient(-75deg, rgba(220, 38, 38, 0.84), rgba(225, 29, 72, 0.94), rgba(220, 38, 38, 0.84));
    color: #ffffff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
    box-shadow:
      inset 0 1.5px 2px rgba(255, 255, 255, 0.5),
      inset 0 -2px 2px rgba(0, 0, 0, 0.22),
      0 10px 26px -6px rgba(225, 29, 72, 0.45);
  }
  .profile-glass-btn-danger-solid::after {
    background:
      conic-gradient(
        from var(--profile-angle-1) at 50% 50%,
        rgba(255, 255, 255, 0.75) 0%,
        transparent 6% 40%,
        rgba(255, 255, 255, 0.75) 50%,
        transparent 60% 94%,
        rgba(255, 255, 255, 0.75) 100%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(225, 29, 72, 0.35));
  }
  .dark .profile-glass-btn-danger-solid {
    background: linear-gradient(-75deg, rgba(239, 68, 68, 0.3), rgba(225, 29, 72, 0.54), rgba(239, 68, 68, 0.3));
    color: #ffffff;
    box-shadow:
      inset 0 1.5px 2px rgba(255, 255, 255, 0.42),
      inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.48),
      0 10px 28px -6px rgba(225, 29, 72, 0.5),
      0 0 18px 0 rgba(239, 68, 68, 0.22);
  }

  /* Active Nav Pill Optical Glass Variants */
  .profile-glass-nav-active {
    background: linear-gradient(
      -75deg,
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.14),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.26),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.12)
    );
    box-shadow:
      inset 0 1.5px 1.5px rgba(255, 255, 255, 0.9),
      inset 0 -1px 1px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.12),
      0 10px 26px -8px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.32);
  }
  .profile-glass-nav-active::after {
    background:
      conic-gradient(
        from var(--profile-angle-1) at 50% 50%,
        rgba(var(--profile-accent-rgb, 99, 102, 241), 0.65) 0%,
        transparent 6% 40%,
        rgba(var(--profile-accent-rgb, 99, 102, 241), 0.65) 50%,
        transparent 60% 94%,
        rgba(var(--profile-accent-rgb, 99, 102, 241), 0.65) 100%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(var(--profile-accent-rgb, 99, 102, 241), 0.25));
  }
  .dark .profile-glass-nav-active {
    background: linear-gradient(
      -75deg,
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.18),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.34),
      rgba(var(--profile-accent-rgb, 99, 102, 241), 0.16)
    );
    box-shadow:
      inset 0 1.5px 2px rgba(255, 255, 255, 0.38),
      inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.45),
      0 10px 28px -6px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.42),
      0 0 18px 0 rgba(var(--profile-accent-rgb, 99, 102, 241), 0.18);
  }
  .dark .profile-glass-nav-active::after {
    background:
      conic-gradient(
        from var(--profile-angle-1) at 50% 50%,
        rgba(255, 255, 255, 0.68) 0%,
        transparent 6% 40%,
        rgba(255, 255, 255, 0.68) 50%,
        transparent 60% 94%,
        rgba(255, 255, 255, 0.68) 100%
      ),
      linear-gradient(180deg, rgba(var(--profile-accent-rgb, 99, 102, 241), 0.55), rgba(255, 255, 255, 0.15));
  }

  .profile-glass-nav-danger-active {
    background: linear-gradient(-75deg, rgba(239, 68, 68, 0.12), rgba(244, 63, 94, 0.22), rgba(239, 68, 68, 0.1));
    box-shadow:
      inset 0 1.5px 1.5px rgba(255, 255, 255, 0.85),
      0 10px 26px -8px rgba(239, 68, 68, 0.28);
  }
  .dark .profile-glass-nav-danger-active {
    background: linear-gradient(-75deg, rgba(239, 68, 68, 0.16), rgba(244, 63, 94, 0.3), rgba(239, 68, 68, 0.14));
    box-shadow:
      inset 0 1.5px 2px rgba(255, 255, 255, 0.3),
      inset 0 -1.5px 1.5px rgba(0, 0, 0, 0.45),
      0 10px 28px -6px rgba(239, 68, 68, 0.38);
  }

  /* Optical Glass Input (matches Auth .glass-input) */
  .profile-glass-input {
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    background: linear-gradient(-75deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.58));
    border: 1px solid rgba(15, 23, 42, 0.14);
    box-shadow:
      inset 0 1px 1.5px rgba(255, 255, 255, 0.95),
      inset 0 -1px 1px rgba(15, 23, 42, 0.05),
      0 4px 12px -4px rgba(15, 23, 42, 0.08);
    transition: all 280ms cubic-bezier(0.25, 1, 0.5, 1);
  }
  .profile-glass-input:hover {
    border-color: rgba(var(--profile-accent-rgb, 99, 102, 241), 0.45);
  }
  .profile-glass-input:focus,
  .profile-glass-input:focus-within {
    background: linear-gradient(-75deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.78));
    border-color: rgba(var(--profile-accent-rgb, 99, 102, 241), 0.65);
    box-shadow:
      inset 0 1px 1.5px rgba(255, 255, 255, 1),
      0 0 0 3px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.16),
      0 8px 20px -6px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.22);
  }
  .dark .profile-glass-input {
    background: linear-gradient(-75deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025));
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow:
      inset 0 1px 1.5px rgba(255, 255, 255, 0.18),
      inset 0 -1px 1px rgba(0, 0, 0, 0.45),
      0 6px 16px -6px rgba(0, 0, 0, 0.55);
  }
  .dark .profile-glass-input:hover {
    border-color: rgba(255, 255, 255, 0.28);
  }
  .dark .profile-glass-input:focus,
  .dark .profile-glass-input:focus-within {
    background: linear-gradient(-75deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.045));
    border-color: rgba(var(--profile-accent-rgb, 99, 102, 241), 0.75);
    box-shadow:
      inset 0 1px 1.5px rgba(255, 255, 255, 0.28),
      0 0 0 3px rgba(var(--profile-accent-rgb, 99, 102, 241), 0.2),
      0 10px 24px -6px rgba(0, 0, 0, 0.7);
  }
`;

const BUTTON_VARIANT_CLASS = {
    neutral: "profile-glass-btn-neutral",
    accent: "profile-glass-btn-accent",
    danger: "profile-glass-btn-danger",
    "danger-solid": "profile-glass-btn-danger-solid",
};

function ProfileGlassButton({
    as: Component = "button",
    variant = "neutral",
    className,
    children,
    ...props
}) {
    const componentProps =
        Component === "button" && !props.type ? { type: "button", ...props } : props;

    return (
        <Component
            {...componentProps}
            className={cn(
                "profile-glass-btn inline-flex items-center justify-center rounded-full font-medium cursor-pointer disabled:opacity-65 disabled:saturate-75 disabled:pointer-events-none",
                BUTTON_VARIANT_CLASS[variant] || BUTTON_VARIANT_CLASS.neutral,
                className
            )}
        >
            <span aria-hidden="true" className="profile-glass-sheen" />
            <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {children}
            </span>
        </Component>
    );
}

export default function ProfileClient({ initialUser }) {
    const { data: session, update } = useSession();
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    // Profile state
    const [name, setName] = useState(initialUser?.name || "");
    const [email] = useState(initialUser?.email || "");
    const [phone, setPhone] = useState(initialUser?.phone || "");
    const [currency, setCurrency] = useState(initialUser?.currency || "INR");
    const [language, setLanguage] = useState(initialUser?.language || "en");
    const [profileImage, setProfileImage] = useState(initialUser?.profileImage || "");
    const [isVerified, setIsVerified] = useState(Boolean(initialUser?.isVerified));
    const [savedName, setSavedName] = useState(initialUser?.name || "");
    const [savedPhone, setSavedPhone] = useState(initialUser?.phone || "");

    // Local UI preferences (hydrated cleanly on mount; only persisted on Save)
    const [accentColor, setAccentColor] = useState("indigo");
    const [savedAccent, setSavedAccent] = useState("indigo");
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [savedNotifications, setSavedNotifications] = useState(true);
    const [startWeekOn, setStartWeekOn] = useState("monday");
    const [savedStartWeekOn, setSavedStartWeekOn] = useState("monday");

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // UX state
    const [activeTab, setActiveTab] = useState("general");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [copiedEmail, setCopiedEmail] = useState(false);

    // Dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // Feedback state
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState("feedback");
    const [isSendingFeedback, setIsSendingFeedback] = useState(false);

    // Sync local UI preferences on mount
    useEffect(() => {
        try {
            const storedAccent = localStorage.getItem("expensemate_accent");
            if (storedAccent && ACCENT_PRESETS.some((p) => p.id === storedAccent)) {
                setAccentColor(storedAccent);
                setSavedAccent(storedAccent);
            }
            const storedNotifs = localStorage.getItem("expensemate_notifications");
            if (storedNotifs !== null) {
                const parsedNotifs = storedNotifs === "true";
                setNotificationsEnabled(parsedNotifs);
                setSavedNotifications(parsedNotifs);
            }
            const storedWeekStart = localStorage.getItem("expensemate_week_start");
            if (storedWeekStart) {
                setStartWeekOn(storedWeekStart);
                setSavedStartWeekOn(storedWeekStart);
            }
        } catch {
            // Ignore localStorage unavailability
        }
    }, []);

    const activeAccent =
        ACCENT_PRESETS.find((preset) => preset.id === accentColor) || ACCENT_PRESETS[0];

    // Unsaved changes tracking (profile + appearance/preference drafts)
    const isDirty =
        name !== savedName ||
        phone !== savedPhone ||
        accentColor !== savedAccent ||
        notificationsEnabled !== savedNotifications ||
        startWeekOn !== savedStartWeekOn;

    const userName = name || session?.user?.name || "Member";
    const userInitials = (userName || "M")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const memberSince = initialUser?.createdAt
        ? (() => {
              try {
                  return format(new Date(initialUser.createdAt), "MMMM yyyy");
              } catch {
                  return "2026";
              }
          })()
        : "2026";

    // Auto-dismiss message after 4s
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(""), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    // Save Profile
    const handleSaveProfile = async (e) => {
        e?.preventDefault();
        setIsSaving(true);
        setMessage("");

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    phone,
                    currency,
                    language,
                    profileImage,
                }),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setMessage("Changes saved successfully");
                setMessageType("success");
                setName(updatedUser.name);
                setSavedName(updatedUser.name);
                setSavedPhone(updatedUser.phone || "");

                if (typeof window !== "undefined") {
                    try {
                        if (updatedUser.profileImage) {
                            localStorage.setItem("user_profile_avatar", updatedUser.profileImage);
                        }
                        if (updatedUser.name) {
                            localStorage.setItem("user_profile_name", updatedUser.name);
                        }
                        localStorage.setItem("expensemate_accent", accentColor);
                        localStorage.setItem("expensemate_notifications", String(notificationsEnabled));
                        localStorage.setItem("expensemate_week_start", startWeekOn);
                    } catch {
                        // Ignore storage errors
                    }

                    setSavedAccent(accentColor);
                    setSavedNotifications(notificationsEnabled);
                    setSavedStartWeekOn(startWeekOn);

                    window.dispatchEvent(
                        new CustomEvent("profile-updated", {
                            detail: {
                                name: updatedUser.name,
                                image: updatedUser.profileImage,
                            },
                        })
                    );
                }

                try {
                    await update({
                        name: updatedUser.name,
                        user: { name: updatedUser.name },
                    });
                } catch {
                    // Ignore session refresh error
                }

                router.refresh();
            } else {
                const error = await res.json();
                setMessage(error.message || "Failed to update profile");
                setMessageType("error");
            }
        } catch {
            setMessage("Error saving profile details");
            setMessageType("error");
        } finally {
            setIsSaving(false);
        }
    };

    const shortcutStateRef = useRef({ isDirty, isSaving, handleSaveProfile });

    useEffect(() => {
        shortcutStateRef.current = { isDirty, isSaving, handleSaveProfile };
    });

    // Keyboard shortcut for Cmd+S / Ctrl+S
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                const { isDirty: dirty, isSaving: saving, handleSaveProfile: saveProfile } = shortcutStateRef.current;
                if (dirty && !saving) {
                    saveProfile();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Password strength computation (0 to 4)
    const getPasswordStrength = (pwd) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };
    const passwordStrength = getPasswordStrength(newPassword);

    // Handle Direct Profile Image Upload
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            setMessage("Image size must be less than 4MB");
            setMessageType("error");
            return;
        }

        setIsUploadingImage(true);
        setMessage("");

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;
            setProfileImage(base64Image);

            try {
                const res = await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name,
                        phone,
                        currency,
                        language,
                        profileImage: base64Image,
                    }),
                });

                if (res.ok) {
                    const updatedUser = await res.json();
                    setProfileImage(updatedUser.profileImage || base64Image);
                    setMessage("Profile picture updated");
                    setMessageType("success");

                    if (typeof window !== "undefined") {
                        try {
                            if (updatedUser.profileImage) {
                                localStorage.setItem("user_profile_avatar", updatedUser.profileImage);
                            }
                            if (updatedUser.name) {
                                localStorage.setItem("user_profile_name", updatedUser.name);
                            }
                        } catch {
                            // Ignore storage errors
                        }

                        window.dispatchEvent(
                            new CustomEvent("profile-updated", {
                                detail: {
                                    name: updatedUser.name || name,
                                    image: updatedUser.profileImage || base64Image,
                                },
                            })
                        );
                    }

                    try {
                        await update({
                            name: updatedUser.name || name,
                            user: { name: updatedUser.name || name },
                        });
                    } catch {
                        // Ignore session error
                    }

                    router.refresh();
                } else {
                    const error = await res.json();
                    setMessage(error.message || "Failed to save profile picture");
                    setMessageType("error");
                }
            } catch {
                setMessage("Error updating profile picture");
                setMessageType("error");
            } finally {
                setIsUploadingImage(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // Remove Profile Image
    const handleRemoveAvatar = async () => {
        setIsUploadingImage(true);
        setProfileImage("");
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, currency, language, profileImage: "" }),
            });
            if (res.ok) {
                setMessage("Profile picture removed");
                setMessageType("success");
                if (typeof window !== "undefined") {
                    try {
                        localStorage.removeItem("user_profile_avatar");
                    } catch {
                        // Ignore storage errors
                    }
                    window.dispatchEvent(
                        new CustomEvent("profile-updated", { detail: { name, image: "" } })
                    );
                }
                router.refresh();
            }
        } catch {
            setMessage("Failed to remove profile picture");
            setMessageType("error");
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Change Password
    const handleChangePassword = async (e) => {
        e?.preventDefault();
        if (newPassword.length < 6) {
            setMessage("Password must be at least 6 characters");
            setMessageType("error");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match");
            setMessageType("error");
            return;
        }

        setIsSaving(true);
        setMessage("");

        try {
            const res = await fetch("/api/profile/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Password updated successfully");
                setMessageType("success");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage(data.message || "Failed to update password");
                setMessageType("error");
            }
        } catch {
            setMessage("Error changing password");
            setMessageType("error");
        } finally {
            setIsSaving(false);
        }
    };

    // Request Account Verification
    const handleRequestVerification = async () => {
        setIsVerifying(true);
        setMessage("");

        try {
            const res = await fetch("/api/profile/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || "Verification email sent. Please check your inbox.");
                setMessageType("success");
                if (data.isVerified) {
                    setIsVerified(true);
                }
            } else {
                setMessage(data.message || "Verification request failed");
                setMessageType("error");
            }
        } catch {
            setMessage("Error sending verification request");
            setMessageType("error");
        } finally {
            setIsVerifying(false);
        }
    };

    // Delete Account
    const handleDeleteAccount = async () => {
        if (deleteConfirmationText.trim().toUpperCase() !== "DELETE MY ACCOUNT") {
            setMessage("Please type DELETE MY ACCOUNT to confirm.");
            setMessageType("error");
            return;
        }

        setIsDeletingAccount(true);
        setMessage("");

        try {
            const res = await fetch("/api/profile/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                if (typeof window !== "undefined") {
                    try {
                        localStorage.clear();
                    } catch {
                        // Ignore storage error
                    }
                }
                await signOut({ callbackUrl: "/login" });
            } else {
                const error = await res.json();
                setMessage(error.message || "Failed to delete account");
                setMessageType("error");
                setIsDeletingAccount(false);
                setIsDeleteDialogOpen(false);
            }
        } catch {
            setMessage("Error processing account deletion");
            setMessageType("error");
            setIsDeletingAccount(false);
            setIsDeleteDialogOpen(false);
        }
    };

    // Send Feedback
    const handleSendFeedback = async (e) => {
        e?.preventDefault();
        if (!feedbackMessage.trim()) return;

        setIsSendingFeedback(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: feedbackMessage,
                    type: feedbackType,
                }),
            });

            if (res.ok) {
                setMessage("Thank you for your feedback!");
                setMessageType("success");
                setIsFeedbackOpen(false);
                setFeedbackMessage("");
            } else {
                const error = await res.json();
                setMessage(error.message || "Failed to send feedback");
                setMessageType("error");
            }
        } catch {
            setMessage("Error submitting feedback");
            setMessageType("error");
        } finally {
            setIsSendingFeedback(false);
        }
    };

    const copyEmailToClipboard = () => {
        const mail = email || session?.user?.email;
        if (mail && typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(mail);
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        }
    };

    const handleAccentSelect = (presetId) => {
        // Preview accent live without persisting until the user clicks Save
        setAccentColor(presetId);
    };

    const handleToggleNotifications = () => {
        setNotificationsEnabled((prev) => !prev);
    };

    const handleStartWeekChange = (val) => {
        setStartWeekOn(val);
    };

    const handleSavePreferences = async () => {
        await handleSaveProfile();
    };

    const navSections = [
        {
            id: "general",
            label: "General",
            subtitle: "Personal details & basic info",
            icon: User,
        },
        {
            id: "preferences",
            label: "Preferences",
            subtitle: "App appearance, currency & language",
            icon: Palette,
        },
        {
            id: "security",
            label: "Security",
            subtitle: "Password, sessions & login control",
            icon: ShieldCheck,
        },
        {
            id: "danger",
            label: "Danger Zone",
            subtitle: "Delete your account permanently",
            icon: AlertTriangle,
            danger: true,
        },
    ];

    const glassShell = "profile-glass-shell rounded-[28px]";

    const glassSubCard = "profile-glass-subcard rounded-2xl";

    const glassInput =
        "profile-glass-input w-full h-10 px-3.5 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400/80 focus:outline-none";

    return (
        <div
            style={{ "--profile-accent-rgb": activeAccent.rgb }}
            className="relative w-full text-zinc-900 dark:text-zinc-100"
        >
            <style>{profileGlassStyles}</style>

            {/* Seamless Liquid-Glass Ambient Accent Aura */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div
                    className="absolute -top-36 left-1/4 h-[520px] w-[520px] rounded-full blur-[130px] opacity-55 dark:opacity-35 transition-colors duration-500"
                    style={{ background: `rgba(${activeAccent.rgb}, 0.38)` }}
                />
            </div>

            {/* Notification Toast Pill (Liquid Glass Dynamic Pill matching floating bottom bar) */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-20 sm:top-22 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
                    >
                        <div
                            role="status"
                            aria-live="polite"
                            className={cn(
                                "pointer-events-auto profile-glass-shell relative overflow-hidden w-fit max-w-full rounded-full pl-2.5 pr-2 py-2 flex items-center gap-3 text-xs sm:text-[13px] font-medium shadow-2xl",
                                messageType === "success"
                                    ? "text-zinc-900 dark:text-white ring-1 ring-emerald-500/25 dark:ring-emerald-400/25"
                                    : "text-red-800 dark:text-red-100 ring-1 ring-red-500/35 dark:ring-red-400/35"
                            )}
                        >
                            {/* Subtle ambient semantic glow inside glass pill */}
                            <div
                                aria-hidden="true"
                                className={cn(
                                    "pointer-events-none absolute -left-4 -top-4 w-28 h-20 rounded-full blur-xl opacity-60 dark:opacity-45",
                                    messageType === "success"
                                        ? "bg-emerald-400/35 dark:bg-emerald-500/30"
                                        : "bg-red-400/40 dark:bg-red-500/35"
                                )}
                            />

                            {/* Frosted glass icon badge */}
                            <div
                                className={cn(
                                    "relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border backdrop-blur-md",
                                    messageType === "success"
                                        ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-400/40 dark:text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.28)]"
                                        : "bg-red-500/15 border-red-500/35 text-red-600 dark:bg-red-500/20 dark:border-red-400/40 dark:text-red-300 shadow-[0_0_14px_rgba(239,68,68,0.28)]"
                                )}
                            >
                                {messageType === "success" ? (
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.25]" />
                                )}
                            </div>

                            <span className="relative z-10 pr-1 leading-snug">{message}</span>

                            <ProfileGlassButton
                                variant="neutral"
                                onClick={() => setMessage("")}
                                aria-label="Dismiss alert"
                                className="relative z-10 w-7 h-7 p-0 shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </ProfileGlassButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Two-Column Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT FROSTED SIDEBAR RAIL */}
                <aside className={cn("lg:col-span-4 xl:col-span-3 p-5 flex flex-col gap-5 relative overflow-hidden", glassShell)}>
                    {/* Subtle optical specular highlight arc across top of sidebar */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-12 inset-x-6 h-24 rounded-full bg-gradient-to-b from-white/55 to-transparent blur-xl dark:from-white/15"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-56 rounded-full blur-2xl opacity-60 dark:opacity-35 transition-colors duration-500"
                        style={{ background: `radial-gradient(circle, rgba(${activeAccent.rgb}, 0.28), transparent 70%)` }}
                    />

                    {/* Centered Identity Block */}
                    <div className="flex flex-col items-center text-center pt-2 pb-1 relative z-10">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-white via-indigo-200/80 to-violet-300/70 dark:from-white/35 dark:via-white/15 dark:to-white/5 shadow-lg">
                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-900/90 flex items-center justify-center text-zinc-800 dark:text-white font-semibold text-xl relative">
                                    {profileImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={profileImage}
                                            alt={userName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{userInitials}</span>
                                    )}

                                    {isUploadingImage && (
                                        <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isVerified && (
                                <span
                                    title="Verified Account"
                                    className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white border-2 border-white dark:border-zinc-950 flex items-center justify-center shadow-sm"
                                >
                                    <Check className="w-3 h-3 stroke-[2.75]" />
                                </span>
                            )}
                        </div>

                        <h2 className="mt-3.5 text-base font-semibold tracking-tight text-zinc-950 dark:text-white truncate max-w-full">
                            {userName}
                        </h2>

                        <button
                            type="button"
                            onClick={copyEmailToClipboard}
                            title="Click to copy email"
                            className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-950 dark:text-zinc-300/80 dark:hover:text-white transition-colors cursor-pointer group max-w-full"
                        >
                            <span className="truncate">{email || session?.user?.email}</span>
                            {copiedEmail ? (
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            )}
                        </button>

                        <div className="mt-2.5">
                            {isVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-400/35 dark:text-emerald-300 backdrop-blur-md">
                                    <Check className="w-3 h-3" />
                                    Verified Account
                                </span>
                            ) : (
                                <ProfileGlassButton
                                    variant="neutral"
                                    onClick={handleRequestVerification}
                                    disabled={isVerifying}
                                    className="px-3 py-1 text-[11px]"
                                >
                                    <span>{isVerifying ? "Sending link..." : "Verify Account"}</span>
                                </ProfileGlassButton>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-300/80 to-transparent dark:via-white/15" />

                    {/* 4-Section Navigation Menu (Liquid Glass Pills) */}
                    <nav aria-label="Profile sections" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 relative z-10">
                        {navSections.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "profile-glass-btn w-full flex items-center gap-3 p-2.5 rounded-2xl text-left cursor-pointer group",
                                        isActive
                                            ? item.danger
                                                ? "profile-glass-nav-danger-active"
                                                : "profile-glass-nav-active"
                                            : "profile-glass-btn-neutral"
                                    )}
                                >
                                    <span aria-hidden="true" className="profile-glass-sheen" />
                                    <div
                                        className={cn(
                                            "relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all border",
                                            isActive
                                                ? item.danger
                                                    ? "bg-gradient-to-br from-red-500 to-rose-600 border-white/40 text-white shadow-sm"
                                                    : cn("bg-gradient-to-br border-white/40 text-white shadow-sm", activeAccent.iconBg)
                                                : item.danger
                                                ? "bg-red-500/10 border-red-500/20 text-red-600 dark:bg-red-500/15 dark:border-red-400/25 dark:text-red-400"
                                                : "bg-white/75 border-white/90 text-indigo-600 dark:bg-white/[0.08] dark:border-white/15 dark:text-zinc-200"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    <div className="relative z-10 min-w-0 flex-1">
                                        <p
                                            className={cn(
                                                "text-[13px] font-semibold leading-tight truncate",
                                                isActive
                                                    ? item.danger
                                                        ? "text-red-700 dark:text-red-200"
                                                        : "text-zinc-950 dark:text-white"
                                                    : item.danger
                                                    ? "text-red-700 dark:text-red-400"
                                                    : "text-zinc-800 dark:text-zinc-100"
                                            )}
                                        >
                                            {item.label}
                                        </p>
                                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    {isActive && (
                                        <ChevronRight
                                            className={cn(
                                                "relative z-10 w-4 h-4 shrink-0",
                                                item.danger
                                                    ? "text-red-500 dark:text-red-300"
                                                    : activeAccent.highlightText
                                            )}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Quick Workspace Actions (Feedback & Sign Out) */}
                    <div className="pt-3 border-t border-zinc-200/80 dark:border-white/12 flex items-center gap-2.5 relative z-10">
                        <ProfileGlassButton
                            variant="neutral"
                            onClick={() => setIsFeedbackOpen(true)}
                            className="flex-1 px-3.5 py-2.5 text-xs font-semibold"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Feedback</span>
                        </ProfileGlassButton>
                        <ProfileGlassButton
                            variant="danger"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="px-3.5 py-2.5 text-xs font-semibold"
                            title="Sign Out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </ProfileGlassButton>
                    </div>
                </aside>

                {/* RIGHT MAIN CONTENT AREA */}
                <section className="lg:col-span-8 xl:col-span-9 space-y-5">
                    {/* Top Breadcrumb + Section Hero Title */}
                    <div className="px-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                            <span>Settings</span>
                            <span>/</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-200">Account</span>
                        </div>

                        {activeTab === "security" ? (
                            <>
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                                    Security
                                </h1>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    Keep your account safe with a strong password and active session control.
                                </p>
                            </>
                        ) : activeTab === "danger" ? (
                            <>
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                                    Danger <span className={activeAccent.highlightText}>Zone</span>
                                </h1>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    Irreversible and permanent actions for your account.
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                                    Profile &amp; <span className={activeAccent.highlightText}>Preferences</span>
                                </h1>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    Manage your account identity, regional preferences, and security settings.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Tab Panel Transitions */}
                    <AnimatePresence mode="wait">
                        {/* SECTION 1: GENERAL */}
                        {activeTab === "general" && (
                            <motion.div
                                key="general"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.16 }}
                                className={cn("p-5 sm:p-6 space-y-5", glassShell)}
                            >
                                {/* Panel Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100/80 dark:border-white/10">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-11 h-11 rounded-2xl bg-indigo-50/90 dark:bg-indigo-500/15 border border-indigo-200/70 dark:border-indigo-400/25 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0 shadow-xs">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                                                General
                                            </h2>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                Manage your basic account information and contact details.
                                            </p>
                                        </div>
                                    </div>

                                    <ProfileGlassButton
                                        variant="accent"
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="px-4.5 py-2 text-xs font-semibold shrink-0"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Check className="w-3.5 h-3.5" />
                                        )}
                                        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                                    </ProfileGlassButton>
                                </div>

                                {/* Profile Information Sub-Card */}
                                <div className={cn("p-5 space-y-5", glassSubCard)}>
                                    <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                        Profile Information
                                    </h3>

                                    {/* Avatar + Upload Controls Row */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-white/80 dark:border-white/[0.09]">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="relative shrink-0">
                                                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-900 border-2 border-white dark:border-zinc-800 shadow-md flex items-center justify-center text-zinc-800 dark:text-white font-semibold text-lg">
                                                    {profileImage ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={profileImage}
                                                            alt={userName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{userInitials}</span>
                                                    )}
                                                </div>
                                                <label
                                                    htmlFor="profile-avatar-upload"
                                                    className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer shadow-sm transition-colors"
                                                    title="Change photo"
                                                >
                                                    <Camera className="w-3 h-3" />
                                                </label>
                                                <input
                                                    id="profile-avatar-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={isUploadingImage}
                                                    onChange={handleImageUpload}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-base font-semibold text-zinc-950 dark:text-white truncate">
                                                        {userName}
                                                    </span>
                                                    {isVerified ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-400/30 dark:text-emerald-300">
                                                            <Check className="w-3 h-3" />
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <ProfileGlassButton
                                                            variant="neutral"
                                                            onClick={handleRequestVerification}
                                                            disabled={isVerifying}
                                                            className="px-2.5 py-0.5 text-[11px]"
                                                        >
                                                            <span>{isVerifying ? "Sending..." : "Verify email"}</span>
                                                        </ProfileGlassButton>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                                                    Member since {memberSince}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                                            <div className="flex items-center gap-2">
                                                <ProfileGlassButton
                                                    as="label"
                                                    variant="neutral"
                                                    htmlFor="profile-avatar-upload"
                                                    className="px-3.5 py-1.5 text-xs font-medium"
                                                >
                                                    <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-sky-300" />
                                                    <span>{isUploadingImage ? "Uploading..." : "Change Photo"}</span>
                                                </ProfileGlassButton>
                                                {profileImage && (
                                                    <ProfileGlassButton
                                                        variant="danger"
                                                        onClick={handleRemoveAvatar}
                                                        className="px-3 py-1.5 text-xs font-medium"
                                                    >
                                                        Remove
                                                    </ProfileGlassButton>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                                JPG, PNG up to 4 MB
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3-Column Identity Inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="profile-name"
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                                            >
                                                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400" />
                                                Full Name
                                            </Label>
                                            <input
                                                id="profile-name"
                                                type="text"
                                                maxLength={60}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your full name"
                                                className={glassInput}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="profile-email"
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                                            >
                                                <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400" />
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <input
                                                    id="profile-email"
                                                    type="email"
                                                    value={email || session?.user?.email || ""}
                                                    disabled
                                                    className="profile-glass-input w-full h-10 px-3.5 pr-9 rounded-2xl text-sm text-zinc-600 dark:text-zinc-300/85 cursor-not-allowed select-all opacity-80"
                                                />
                                                <Lock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="profile-phone"
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                                            >
                                                <Phone className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400" />
                                                Phone Number
                                            </Label>
                                            <input
                                                id="profile-phone"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className={glassInput}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Account Details Sub-Card */}
                                <div className={cn("p-5 space-y-4", glassSubCard)}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                            Account Details
                                        </h3>
                                        <ProfileGlassButton
                                            as="a"
                                            variant="neutral"
                                            href="/api/export"
                                            download
                                            className="px-3.5 py-1.5 text-xs font-medium self-start sm:self-auto"
                                        >
                                            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-sky-300" />
                                            <span>Export Financial Data (CSV)</span>
                                        </ProfileGlassButton>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-white/80 dark:border-white/[0.09] flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-white/75 dark:bg-white/[0.08] border border-white/90 dark:border-white/15 flex items-center justify-center text-indigo-600 dark:text-sky-300 shrink-0">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                                                    Member Since
                                                </p>
                                                <p className="text-sm font-semibold text-zinc-950 dark:text-white mt-0.5">
                                                    {memberSince}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-white/80 dark:border-white/[0.09] flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-white/75 dark:bg-white/[0.08] border border-white/90 dark:border-white/15 flex items-center justify-center text-indigo-600 dark:text-sky-300 shrink-0">
                                                <UserCheck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                                                    Account Type
                                                </p>
                                                <p className="text-sm font-semibold text-zinc-950 dark:text-white mt-0.5">
                                                    Standard (Free)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SECTION 2: PREFERENCES */}
                        {activeTab === "preferences" && (
                            <motion.div
                                key="preferences"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.16 }}
                                className={cn("p-5 sm:p-6 space-y-5", glassShell)}
                            >
                                {/* Panel Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/75 dark:border-white/10">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-11 h-11 rounded-2xl bg-white/75 dark:bg-white/[0.08] border border-white/90 dark:border-white/15 flex items-center justify-center text-indigo-600 dark:text-sky-300 shrink-0 shadow-xs">
                                            <Monitor className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                                                Preferences
                                            </h2>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                Customize how ExpenseMate looks and works for you.
                                            </p>
                                        </div>
                                    </div>

                                    <ProfileGlassButton
                                        variant="accent"
                                        onClick={handleSavePreferences}
                                        disabled={isSaving}
                                        className="px-4.5 py-2 text-xs font-semibold shrink-0"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Check className="w-3.5 h-3.5" />
                                        )}
                                        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                                    </ProfileGlassButton>
                                </div>

                                {/* Row 1: Appearance & Accent Color */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                    {/* Appearance */}
                                    <div className={cn("lg:col-span-7 p-5 space-y-4", glassSubCard)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50/90 dark:bg-indigo-500/15 border border-indigo-200/60 dark:border-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0">
                                                <Monitor className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                                    Appearance
                                                </h3>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                    Choose your preferred theme.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                {
                                                    id: "dark",
                                                    label: "Dark",
                                                    icon: Moon,
                                                    previewClass:
                                                        "bg-zinc-950 text-white border-zinc-800",
                                                    iconWrap:
                                                        "bg-zinc-900 border-zinc-700 text-sky-300",
                                                },
                                                {
                                                    id: "light",
                                                    label: "Light",
                                                    icon: Sun,
                                                    previewClass:
                                                        "bg-gradient-to-b from-sky-50 to-white text-zinc-900 border-indigo-100",
                                                    iconWrap:
                                                        "bg-white border-indigo-100 text-amber-500 shadow-xs",
                                                },
                                                {
                                                    id: "system",
                                                    label: "System",
                                                    icon: Monitor,
                                                    previewClass:
                                                        "bg-gradient-to-r from-zinc-900 via-slate-600 to-slate-100 text-white border-zinc-300 dark:border-zinc-700",
                                                    iconWrap:
                                                        "bg-white/90 border-white/80 text-indigo-600 shadow-xs",
                                                },
                                            ].map((t) => {
                                                const ThemeIcon = t.icon;
                                                const isSelected = theme === t.id;
                                                return (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => setTheme(t.id)}
                                                        className={cn(
                                                            "profile-glass-btn relative rounded-2xl p-2.5 text-center transition-all cursor-pointer group",
                                                            isSelected
                                                                ? cn("profile-glass-nav-active ring-2", activeAccent.ring)
                                                                : "profile-glass-btn-neutral"
                                                        )}
                                                    >
                                                        <span aria-hidden="true" className="profile-glass-sheen" />
                                                        {isSelected && (
                                                            <span
                                                                className={cn(
                                                                    "absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gradient-to-br text-white flex items-center justify-center shadow-sm z-20",
                                                                    activeAccent.iconBg
                                                                )}
                                                            >
                                                                <Check className="w-3 h-3 stroke-[2.75]" />
                                                            </span>
                                                        )}
                                                        <div
                                                            className={cn(
                                                                "relative z-10 h-14 rounded-xl border flex items-center justify-center mb-2",
                                                                t.previewClass
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    "w-8 h-8 rounded-full border flex items-center justify-center",
                                                                    t.iconWrap
                                                                )}
                                                            >
                                                                <ThemeIcon className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                        <span className="relative z-10 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                                            {t.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Accent Color */}
                                    <div className={cn("lg:col-span-5 p-5 flex flex-col justify-between gap-4", glassSubCard)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50/90 dark:bg-indigo-500/15 border border-indigo-200/60 dark:border-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0">
                                                <Palette className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                                    Accent Color
                                                </h3>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                    Pick a theme color for this view.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center flex-wrap gap-3 py-2">
                                            {ACCENT_PRESETS.map((preset) => {
                                                const isPicked = accentColor === preset.id;
                                                return (
                                                    <button
                                                        key={preset.id}
                                                        type="button"
                                                        onClick={() => handleAccentSelect(preset.id)}
                                                        aria-label={preset.label}
                                                        aria-pressed={isPicked}
                                                        title={preset.label}
                                                        className={cn(
                                                            "w-9 h-9 rounded-full p-0.5 transition-all cursor-pointer flex items-center justify-center",
                                                            isPicked
                                                                ? "ring-2 ring-offset-2 ring-indigo-500 dark:ring-violet-400 ring-offset-white dark:ring-offset-zinc-950 scale-110 shadow-md"
                                                                : "hover:scale-105 opacity-90 hover:opacity-100"
                                                        )}
                                                        style={{ background: preset.swatch }}
                                                    >
                                                        {isPicked && (
                                                            <Check className="w-4 h-4 text-white stroke-[2.75]" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                            Active accent:{" "}
                                            <span className={cn("font-medium", activeAccent.highlightText)}>
                                                {activeAccent.label}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Row 2: Currency & Language */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Currency */}
                                    <div className={cn("p-5 space-y-3.5", glassSubCard)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50/90 dark:bg-indigo-500/15 border border-indigo-200/60 dark:border-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0">
                                                <Coins className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                                    Currency
                                                </h3>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                    Used for expenses, budgets and reports.
                                                </p>
                                            </div>
                                        </div>

                                        <Select
                                            value={currency}
                                            onValueChange={(val) => {
                                                setCurrency(val);
                                                fetch("/api/profile", {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        name,
                                                        phone,
                                                        currency: val,
                                                        language,
                                                        profileImage,
                                                    }),
                                                }).then((res) => {
                                                    if (res.ok) {
                                                        setMessage(`Default currency changed to ${val}`);
                                                        setMessageType("success");
                                                        router.refresh();
                                                    }
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="profile-glass-input w-full h-10 rounded-2xl text-zinc-900 dark:text-white text-sm">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 text-zinc-900 dark:text-white">
                                                <SelectItem value="INR">INR (₹) — Indian Rupee</SelectItem>
                                                <SelectItem value="USD">USD ($) — US Dollar</SelectItem>
                                                <SelectItem value="EUR">EUR (€) — Euro</SelectItem>
                                                <SelectItem value="GBP">GBP (£) — British Pound</SelectItem>
                                                <SelectItem value="JPY">JPY (¥) — Japanese Yen</SelectItem>
                                                <SelectItem value="CAD">CAD ($) — Canadian Dollar</SelectItem>
                                                <SelectItem value="AUD">AUD ($) — Australian Dollar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Language */}
                                    <div className={cn("p-5 space-y-3.5", glassSubCard)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50/90 dark:bg-indigo-500/15 border border-indigo-200/60 dark:border-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                                    Language
                                                </h3>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                    Choose your preferred language.
                                                </p>
                                            </div>
                                        </div>

                                        <Select
                                            value={language}
                                            onValueChange={(val) => {
                                                setLanguage(val);
                                                fetch("/api/profile", {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        name,
                                                        phone,
                                                        currency,
                                                        language: val,
                                                        profileImage,
                                                    }),
                                                }).then((res) => {
                                                    if (res.ok) {
                                                        setMessage(`Language updated to ${val.toUpperCase()}`);
                                                        setMessageType("success");
                                                        router.refresh();
                                                    }
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="profile-glass-input w-full h-10 rounded-2xl text-zinc-900 dark:text-white text-sm">
                                                <SelectValue placeholder="Select Language" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 text-zinc-900 dark:text-white">
                                                <SelectItem value="en">English (US)</SelectItem>
                                                <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                                                <SelectItem value="es">Spanish (Español)</SelectItem>
                                                <SelectItem value="fr">French (Français)</SelectItem>
                                                <SelectItem value="de">German (Deutsch)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Row 3: Notifications & Start Week On */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Notifications */}
                                    <div className={cn("p-5 flex items-center justify-between gap-4", glassSubCard)}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50/90 dark:bg-indigo-500/15 border border-indigo-200/60 dark:border-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0">
                                                <Bell className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                                    Notifications
                                                </h3>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                                                    Get important updates, reminders and insights.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={notificationsEnabled}
                                            aria-label="Toggle notifications"
                                            onClick={handleToggleNotifications}
                                            className={cn(
                                                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer",
                                                notificationsEnabled
                                                    ? cn("bg-gradient-to-r", activeAccent.iconBg)
                                                    : "bg-slate-300 dark:bg-zinc-700"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                                                    notificationsEnabled ? "translate-x-6" : "translate-x-1"
                                                )}
                                            />
                                        </button>
                                    </div>

                                    {/* Start Week On */}
                                    <div className={cn("p-5 flex items-center justify-between gap-4", glassSubCard)}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50/90 dark:bg-indigo-500/15 border border-indigo-200/60 dark:border-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                                    Start Week On
                                                </h3>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                                                    Choose the first day of your week.
                                                </p>
                                            </div>
                                        </div>

                                        <Select value={startWeekOn} onValueChange={handleStartWeekChange}>
                                            <SelectTrigger className="profile-glass-input w-32 h-9 rounded-2xl text-zinc-900 dark:text-white text-xs font-medium shrink-0">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 text-zinc-900 dark:text-white">
                                                <SelectItem value="monday">Monday</SelectItem>
                                                <SelectItem value="sunday">Sunday</SelectItem>
                                                <SelectItem value="saturday">Saturday</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SECTION 3: SECURITY */}
                        {activeTab === "security" && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.16 }}
                                className={cn("p-5 sm:p-6 space-y-5", glassShell)}
                            >
                                {/* Change Password Card */}
                                <form onSubmit={handleChangePassword} className={cn("p-5 space-y-5", glassSubCard)}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100/80 dark:border-white/10">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 rounded-2xl bg-indigo-50/90 dark:bg-indigo-500/15 border border-indigo-200/70 dark:border-indigo-400/25 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                                                    Change Password
                                                </h2>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                    Update your password to keep your account secure.
                                                </p>
                                            </div>
                                        </div>

                                        <ProfileGlassButton
                                            type="submit"
                                            variant="accent"
                                            disabled={isSaving || !currentPassword || !newPassword || newPassword.length < 6}
                                            className="px-4.5 py-2 text-xs font-semibold shrink-0"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                            <span>{isSaving ? "Updating..." : "Save Changes"}</span>
                                        </ProfileGlassButton>
                                    </div>

                                    {/* 3-Column Password Inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Current Password
                                            </Label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="Enter current password"
                                                    className={cn(glassInput, "pr-10")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    aria-label="Toggle current password visibility"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                New Password
                                            </Label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="At least 6 characters"
                                                    className={cn(glassInput, "pr-10")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    aria-label="Toggle new password visibility"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Confirm New Password
                                            </Label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Repeat new password"
                                                    className={cn(glassInput, "pr-10")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    aria-label="Toggle confirm password visibility"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dynamic Password Strength Meter */}
                                    {newPassword && (
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex gap-1.5 h-1.5 max-w-sm">
                                                {[1, 2, 3, 4].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={cn(
                                                            "flex-1 rounded-full transition-all duration-300",
                                                            passwordStrength >= level
                                                                ? passwordStrength <= 2
                                                                    ? "bg-amber-500 dark:bg-amber-400"
                                                                    : "bg-emerald-500 dark:bg-emerald-400"
                                                                : "bg-slate-200 dark:bg-zinc-800"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                                {passwordStrength <= 1
                                                    ? "Weak — add symbols or uppercase letters"
                                                    : passwordStrength <= 3
                                                    ? "Good password"
                                                    : "Strong password"}
                                            </span>
                                        </div>
                                    )}
                                </form>

                                {/* Active Sessions Card */}
                                <div className={cn("p-5 space-y-4", glassSubCard)}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50/90 dark:bg-indigo-500/15 border border-indigo-200/60 dark:border-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0">
                                            <Monitor className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                                Active Sessions
                                            </h3>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                Devices currently logged into your account.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-white/80 dark:border-white/[0.09]">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-white/75 dark:bg-white/[0.08] border border-white/90 dark:border-white/15 flex items-center justify-center text-zinc-700 dark:text-zinc-200 shrink-0">
                                                <Laptop className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                                                    Current Device
                                                </p>
                                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                                                    Active workspace session • NextAuth JWT cookie
                                                </p>
                                            </div>
                                        </div>

                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-400/30 dark:text-emerald-300 shrink-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                            Active now
                                        </span>
                                    </div>
                                </div>

                                {/* Security Infrastructure Card */}
                                <div className={cn("p-5 space-y-4", glassSubCard)}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-white/75 dark:bg-white/[0.08] border border-white/90 dark:border-white/15 flex items-center justify-center text-indigo-600 dark:text-sky-300 shrink-0">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                                                Security Infrastructure
                                            </h3>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                Your account is protected with industry-standard security.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-white/80 dark:border-white/[0.09] flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white/75 dark:bg-white/[0.08] border border-white/90 dark:border-white/15 flex items-center justify-center text-indigo-600 dark:text-sky-300 shrink-0">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                                                    Password Hashing
                                                </p>
                                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                                    Bcrypt (12 rounds)
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-white/80 dark:border-white/[0.09] flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white/75 dark:bg-white/[0.08] border border-white/90 dark:border-white/15 flex items-center justify-center text-indigo-600 dark:text-sky-300 shrink-0">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                                                    Transport Security
                                                </p>
                                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                                    TLS 1.3 (Encrypted)
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-white/80 dark:border-white/[0.09] flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white/75 dark:bg-white/[0.08] border border-white/90 dark:border-white/15 flex items-center justify-center text-indigo-600 dark:text-sky-300 shrink-0">
                                                <Cookie className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                                                    Session Guard
                                                </p>
                                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                                    Encrypted HttpOnly cookies
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SECTION 4: DANGER ZONE */}
                        {activeTab === "danger" && (
                            <motion.div
                                key="danger"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.16 }}
                                className="rounded-[28px] p-6 sm:p-8 backdrop-blur-2xl bg-gradient-to-br from-white/70 via-rose-50/55 to-red-50/65 dark:from-black/35 dark:via-red-950/25 dark:to-rose-950/25 border border-red-200/85 dark:border-red-500/25 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.85),0_20px_50px_-22px_rgba(239,68,68,0.22)] dark:shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.16),0_24px_60px_-24px_rgba(0,0,0,0.85)] space-y-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-red-100/80 dark:bg-red-500/15 border border-red-200 dark:border-red-400/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 backdrop-blur-md">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                                            Delete Account
                                        </h2>
                                        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed max-w-2xl">
                                            Permanently delete your ExpenseMate profile and wipe all logged
                                            transactions, budgets, and savings targets from our servers.
                                        </p>
                                    </div>
                                </div>

                                {/* Permanent Impact Overview — 3 Frosted Glass Tiles (matches Security Infrastructure rhythm) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        {
                                            title: "Expenses & History",
                                            subtitle: "All logged transactions wiped",
                                            icon: Trash2,
                                        },
                                        {
                                            title: "Budgets & Savings",
                                            subtitle: "Monthly caps & goals removed",
                                            icon: Layers,
                                        },
                                        {
                                            title: "Identity & Access",
                                            subtitle: "Profile erased, instant sign-out",
                                            icon: LogOut,
                                        },
                                    ].map(({ title, subtitle, icon: TileIcon }) => (
                                        <div
                                            key={title}
                                            className="p-4 rounded-2xl bg-white/55 dark:bg-white/[0.03] backdrop-blur-xl border border-red-200/70 dark:border-red-500/20 flex items-center gap-3.5"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/15 border border-red-300/60 dark:border-red-400/25 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                                <TileIcon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                                                    {title}
                                                </p>
                                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                                    {subtitle}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Consequence Checklist & Action Strip */}
                                <div className="rounded-2xl bg-white/55 dark:bg-white/[0.03] backdrop-blur-xl border border-red-200/70 dark:border-red-500/20 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <ul className="space-y-3">
                                        {[
                                            "All your data (expenses, budgets, savings) will be permanently removed.",
                                            "This action cannot be undone.",
                                            "You will lose access to your account immediately.",
                                        ].map((point) => (
                                            <li
                                                key={point}
                                                className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200"
                                            >
                                                <span className="mt-0.5 w-5 h-5 rounded-full bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-400/35 flex items-center justify-center text-red-600 dark:text-red-300 shrink-0">
                                                    <Check className="w-3 h-3" />
                                                </span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex justify-end shrink-0">
                                        <ProfileGlassButton
                                            variant="danger-solid"
                                            onClick={() => {
                                                setDeleteConfirmationText("");
                                                setIsDeleteDialogOpen(true);
                                            }}
                                            className="px-5 py-2.5 text-xs sm:text-sm font-semibold"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete Account</span>
                                        </ProfileGlassButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </div>

            {/* FLOATING UNSAVED CHANGES BAR */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 lg:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
                    >
                        <div className="pointer-events-auto profile-glass-shell w-fit max-w-full rounded-full px-4 py-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs shadow-2xl">
                            <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100 pl-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse shrink-0" />
                                <span>Careful — you have unsaved changes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ProfileGlassButton
                                    variant="neutral"
                                    onClick={() => {
                                        setName(savedName);
                                        setPhone(savedPhone);
                                        setAccentColor(savedAccent);
                                        setNotificationsEnabled(savedNotifications);
                                        setStartWeekOn(savedStartWeekOn);
                                    }}
                                    className="px-3 py-1.5 text-xs"
                                >
                                    Reset
                                </ProfileGlassButton>
                                <ProfileGlassButton
                                    variant="accent"
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    title="Save changes (Ctrl+S / Cmd+S)"
                                    className="px-4 py-1.5 text-xs font-semibold"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Check className="w-3.5 h-3.5" />
                                    )}
                                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                                </ProfileGlassButton>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DELETE ACCOUNT CONFIRMATION DIALOG */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent
                    style={{ "--profile-accent-rgb": activeAccent.rgb }}
                    className="rounded-3xl bg-white/85 dark:bg-black/55 backdrop-blur-2xl border border-white/85 dark:border-white/20 shadow-2xl text-zinc-900 dark:text-zinc-100 max-w-md p-6"
                >
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-white">
                            Are you absolutely sure?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                            This action cannot be undone. To confirm, please type{" "}
                            <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                                DELETE MY ACCOUNT
                            </span>{" "}
                            below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3">
                        <input
                            type="text"
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            placeholder="Type DELETE MY ACCOUNT"
                            className={cn(glassInput, "h-9 font-mono")}
                        />
                    </div>

                    <DialogFooter className="flex items-center gap-2 pt-2">
                        <ProfileGlassButton
                            variant="neutral"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="px-3.5 py-1.5 text-xs"
                        >
                            Cancel
                        </ProfileGlassButton>
                        <ProfileGlassButton
                            variant="danger-solid"
                            disabled={
                                deleteConfirmationText.trim().toUpperCase() !== "DELETE MY ACCOUNT" ||
                                isDeletingAccount
                            }
                            onClick={handleDeleteAccount}
                            className="px-4 py-1.5 text-xs font-semibold"
                        >
                            {isDeletingAccount && <Loader2 className="w-3 h-3 animate-spin" />}
                            <span>{isDeletingAccount ? "Deleting..." : "Permanently Delete"}</span>
                        </ProfileGlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* FEEDBACK DIALOG */}
            <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
                <DialogContent
                    style={{ "--profile-accent-rgb": activeAccent.rgb }}
                    className="rounded-3xl bg-white/85 dark:bg-black/55 backdrop-blur-2xl border border-white/85 dark:border-white/20 shadow-2xl text-zinc-900 dark:text-zinc-100 max-w-lg p-6"
                >
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-white">
                            Share Feedback
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                            Let us know what you think about ExpenseMate or report any issue.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSendFeedback} className="space-y-4 py-2">
                        <RadioGroup
                            defaultValue="feedback"
                            value={feedbackType}
                            onValueChange={setFeedbackType}
                            className="flex gap-2"
                        >
                            <label
                                htmlFor="feedback"
                                className={cn(
                                    "flex-1 flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-medium cursor-pointer transition-all backdrop-blur-md",
                                    feedbackType === "feedback"
                                        ? "bg-indigo-50/90 border-indigo-300 text-zinc-950 dark:bg-white/12 dark:border-white/30 dark:text-white"
                                        : "bg-white/50 border-white/80 text-zinc-600 dark:bg-white/[0.03] dark:border-white/10 dark:text-zinc-300"
                                )}
                            >
                                <RadioGroupItem
                                    value="feedback"
                                    id="feedback"
                                    className="border-zinc-400 dark:border-zinc-500 text-zinc-950 dark:text-white"
                                />
                                <span>General</span>
                            </label>

                            <label
                                htmlFor="issue"
                                className={cn(
                                    "flex-1 flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-medium cursor-pointer transition-all backdrop-blur-md",
                                    feedbackType === "issue"
                                        ? "bg-indigo-50/90 border-indigo-300 text-zinc-950 dark:bg-white/12 dark:border-white/30 dark:text-white"
                                        : "bg-white/50 border-white/80 text-zinc-600 dark:bg-white/[0.03] dark:border-white/10 dark:text-zinc-300"
                                )}
                            >
                                <RadioGroupItem
                                    value="issue"
                                    id="issue"
                                    className="border-zinc-400 dark:border-zinc-500 text-zinc-950 dark:text-white"
                                />
                                <span>Report Issue</span>
                            </label>
                        </RadioGroup>

                        <Textarea
                            value={feedbackMessage}
                            onChange={(e) => setFeedbackMessage(e.target.value)}
                            placeholder="Write your note here..."
                            rows={4}
                            className="profile-glass-input w-full rounded-2xl text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400/80 focus:outline-none focus-visible:ring-0 focus-visible:border-transparent text-xs sm:text-sm"
                        />

                        <DialogFooter className="flex items-center gap-2 pt-2">
                            <ProfileGlassButton
                                variant="neutral"
                                onClick={() => setIsFeedbackOpen(false)}
                                className="px-3.5 py-1.5 text-xs"
                            >
                                Cancel
                            </ProfileGlassButton>
                            <ProfileGlassButton
                                type="submit"
                                variant="accent"
                                disabled={isSendingFeedback || !feedbackMessage.trim()}
                                className="px-4.5 py-1.5 text-xs font-semibold"
                            >
                                {isSendingFeedback && <Loader2 className="w-3 h-3 animate-spin" />}
                                <span>{isSendingFeedback ? "Sending..." : "Submit"}</span>
                            </ProfileGlassButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
