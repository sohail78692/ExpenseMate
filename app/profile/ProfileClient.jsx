"use client";

import { useState, useEffect } from "react";
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
    KeyRound,
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
    Shield
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

    // Unsaved changes tracking (Linear style)
    const isDirty = (name !== (initialUser?.name || "")) || (phone !== (initialUser?.phone || ""));

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

    // Keyboard shortcut for Cmd+S / Ctrl+S (Linear desktop style)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                if (isDirty && !isSaving) {
                    handleSaveProfile();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isDirty, isSaving, name, phone, currency, language, profileImage]);

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
                            if (updatedUser.profileImage) localStorage.setItem("user_profile_avatar", updatedUser.profileImage);
                            if (updatedUser.name) localStorage.setItem("user_profile_name", updatedUser.name);
                        } catch (_) {}

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
                    } catch (_) {}

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
                    } catch (_) {}
                    window.dispatchEvent(new CustomEvent("profile-updated", { detail: { name, image: "" } }));
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

                if (typeof window !== "undefined") {
                    try {
                        if (updatedUser.profileImage) localStorage.setItem("user_profile_avatar", updatedUser.profileImage);
                        if (updatedUser.name) localStorage.setItem("user_profile_name", updatedUser.name);
                    } catch (_) {}

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
                } catch (_) {}

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
                    } catch (_) {}
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

    const tabs = [
        { id: "general", label: "General", icon: User },
        { id: "preferences", label: "Preferences", icon: Palette },
        { id: "security", label: "Security", icon: ShieldCheck },
        { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
    ];

    return (
        <div className="w-full space-y-8 pb-16 text-zinc-900 dark:text-zinc-100">
            {/* Header: Linear / Vercel Monochromatic Minimalist Style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        <span>Settings</span>
                        <span>/</span>
                        <span className="text-zinc-800 dark:text-zinc-200">Account</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                        Profile & Preferences
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Manage your account identity, regional preferences, and security settings.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsFeedbackOpen(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer shadow-xs dark:shadow-none"
                    >
                        Feedback
                    </button>
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-red-600 bg-white hover:bg-red-50 border border-zinc-200 dark:text-zinc-400 dark:hover:text-red-400 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer shadow-xs dark:shadow-none"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={cn(
                            "p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium border transition-all shadow-sm dark:shadow-none",
                            messageType === "success"
                                ? "bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200"
                                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            {messageType === "success" ? (
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                            <span>{message}</span>
                        </div>
                        <button
                            onClick={() => setMessage("")}
                            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1 cursor-pointer"
                            aria-label="Dismiss alert"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Overview Card (Minimalist Identity Strip) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors">
                <div className="flex items-center gap-4">
                    {/* Clean Avatar with Camera Hover Overlay */}
                    <div className="relative group shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-800 dark:text-white font-medium text-xl relative">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={userName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{userInitials}</span>
                            )}

                            {isUploadingImage && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                </div>
                            )}
                        </div>

                        <label
                            htmlFor="profile-avatar-upload"
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                            title="Change avatar"
                        >
                            <Camera className="w-3 h-3" />
                            <input
                                id="profile-avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploadingImage}
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>

                    {/* Identity Text */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-lg font-medium text-zinc-950 dark:text-white truncate">
                                {userName}
                            </h2>
                            {isVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-400 border">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                                    Verified
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleRequestVerification}
                                    disabled={isVerifying}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                                >
                                    <span>{isVerifying ? "Sending link..." : "Verify email"}</span>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            <button
                                type="button"
                                onClick={copyEmailToClipboard}
                                className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer group"
                                title="Click to copy email"
                            >
                                <Mail className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                                <span>{email || session?.user?.email}</span>
                                {copiedEmail ? (
                                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <Copy className="w-3 h-3 text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </button>

                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                            <span>Member since {memberSince}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800/80">
                    {profileImage && (
                        <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-red-50 border border-zinc-200 text-xs text-zinc-600 hover:text-red-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove profile image"
                        >
                            Remove photo
                        </button>
                    )}
                    <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                        {currency}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                        {language.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Horizontal Sub-Navigation Tabs (Linear / Vercel style) */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative pb-3 text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer",
                                isActive
                                    ? tab.danger
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-zinc-950 dark:text-white"
                                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="tabUnderline"
                                    className={cn(
                                        "absolute bottom-0 left-0 right-0 h-0.5",
                                        tab.danger ? "bg-red-500" : "bg-zinc-900 dark:bg-white"
                                    )}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {/* TAB 1: GENERAL */}
                {activeTab === "general" && (
                    <motion.div
                        key="general"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        {/* Display Name Card */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Your Name</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        Please enter your full name or a display name for this workspace.
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full max-w-md h-9 px-3 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                                />
                            </div>
                            <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                <span>Please use 32 characters at maximum.</span>
                                <button
                                    type="button"
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>

                        {/* Email Address Card */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Email Address</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        The email address used to log into ExpenseMate and receive financial reports.
                                    </p>
                                </div>
                                <div className="relative max-w-md">
                                    <input
                                        type="email"
                                        value={email || session?.user?.email || ""}
                                        disabled
                                        className="w-full h-9 px-3 pr-9 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-all"
                                    />
                                    <Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                                Contact workspace support if you need to migrate your primary email address.
                            </div>
                        </div>

                        {/* Phone Number Card */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Phone Number</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        Used for account recovery and optional SMS notifications.
                                    </p>
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full max-w-md h-9 px-3 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                                />
                            </div>
                            <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                <span>Standard international format recommended.</span>
                                <button
                                    type="button"
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>

                        {/* Data Export Card (Real CSV Export) */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Export Financial Data</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        Download a complete CSV archive of all your logged expenses, tags, and category notes.
                                    </p>
                                </div>
                                <a
                                    href="/api/export"
                                    download
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 dark:text-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download CSV</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 2: PREFERENCES */}
                {activeTab === "preferences" && (
                    <motion.div
                        key="preferences"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        {/* Theme Card with Vercel-style UI Wireframe Previews */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none p-6 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Appearance</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Customize how ExpenseMate looks on your screen.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                {[
                                    {
                                        id: "dark",
                                        label: "Dark",
                                        desc: "Monochrome dark theme",
                                        renderPreview: () => (
                                            <div className="w-full h-16 rounded-lg bg-zinc-950 border border-zinc-800 p-2 flex flex-col gap-1.5 mb-3">
                                                <div className="h-1.5 w-1/3 bg-zinc-700 rounded-full" />
                                                <div className="flex gap-1.5 flex-1">
                                                    <div className="w-1/4 h-full bg-zinc-900 rounded" />
                                                    <div className="flex-1 h-full bg-zinc-900 rounded border border-zinc-800/80" />
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        id: "light",
                                        label: "Light",
                                        desc: "Clean daytime contrast",
                                        renderPreview: () => (
                                            <div className="w-full h-16 rounded-lg bg-zinc-100 border border-zinc-300 p-2 flex flex-col gap-1.5 mb-3">
                                                <div className="h-1.5 w-1/3 bg-zinc-400 rounded-full" />
                                                <div className="flex gap-1.5 flex-1">
                                                    <div className="w-1/4 h-full bg-zinc-200 rounded" />
                                                    <div className="flex-1 h-full bg-white rounded border border-zinc-200" />
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        id: "system",
                                        label: "System",
                                        desc: "Match device setting",
                                        renderPreview: () => (
                                            <div className="w-full h-16 rounded-lg border border-zinc-300 dark:border-zinc-800 overflow-hidden flex mb-3">
                                                <div className="w-1/2 h-full bg-zinc-950 p-2 flex flex-col gap-1.5 border-r border-zinc-800">
                                                    <div className="h-1.5 w-2/3 bg-zinc-700 rounded-full" />
                                                    <div className="flex-1 bg-zinc-900 rounded" />
                                                </div>
                                                <div className="w-1/2 h-full bg-zinc-100 p-2 flex flex-col gap-1.5">
                                                    <div className="h-1.5 w-2/3 bg-zinc-400 rounded-full" />
                                                    <div className="flex-1 bg-white rounded" />
                                                </div>
                                            </div>
                                        )
                                    },
                                ].map((t) => {
                                    const isSelected = theme === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setTheme(t.id)}
                                            className={cn(
                                                "p-4 rounded-xl border text-left transition-all cursor-pointer",
                                                isSelected
                                                    ? "bg-zinc-100 border-zinc-900 text-zinc-950 dark:bg-zinc-900 dark:border-zinc-400 dark:text-white shadow-sm"
                                                    : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-950 dark:hover:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            )}
                                        >
                                            {t.renderPreview()}
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium">{t.label}</span>
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    isSelected ? "bg-zinc-950 dark:bg-white" : "bg-transparent border border-zinc-400 dark:border-zinc-700"
                                                )} />
                                            </div>
                                            <p className="text-[11px] text-zinc-500">{t.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Currency Card */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Default Currency</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        Sets the primary currency used for displaying charts, expenses, and budget balances.
                                    </p>
                                </div>

                                <div className="max-w-md">
                                    <Select value={currency} onValueChange={(val) => {
                                        setCurrency(val);
                                        fetch("/api/profile", {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ name, phone, currency: val, language, profileImage }),
                                        }).then(() => {
                                            setMessage(`Default currency changed to ${val}`);
                                            setMessageType("success");
                                            router.refresh();
                                        });
                                    }}>
                                        <SelectTrigger className="w-full h-9 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
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
                            </div>
                            <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                                Existing transactions preserve their historical exchange values.
                            </div>
                        </div>

                        {/* Language Card */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Language</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        Select your preferred language for dates, numbers, and navigation.
                                    </p>
                                </div>

                                <div className="max-w-md">
                                    <Select value={language} onValueChange={(val) => {
                                        setLanguage(val);
                                        fetch("/api/profile", {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ name, phone, currency, language: val, profileImage }),
                                        }).then(() => {
                                            setMessage(`Language updated to ${val.toUpperCase()}`);
                                            setMessageType("success");
                                            router.refresh();
                                        });
                                    }}>
                                        <SelectTrigger className="w-full h-9 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm">
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                                            <SelectItem value="en">English (US)</SelectItem>
                                            <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                                            <SelectItem value="es">Spanish (Español)</SelectItem>
                                            <SelectItem value="fr">French (Français)</SelectItem>
                                            <SelectItem value="de">German (Deutsch)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 3: SECURITY */}
                {activeTab === "security" && (
                    <motion.div
                        key="security"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        {/* Change Password Card with Password Strength Meter */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none overflow-hidden">
                            <form onSubmit={handleChangePassword}>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Change Password</h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            Ensure your account is protected with a secure, unique password.
                                        </p>
                                    </div>

                                    <div className="space-y-3.5 max-w-md pt-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-600 dark:text-zinc-400">Current Password</Label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="Enter current password"
                                                    className="w-full h-9 px-3 pr-9 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-600 dark:text-zinc-400">New Password</Label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="At least 6 characters"
                                                    className="w-full h-9 px-3 pr-9 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>

                                            {/* Dynamic Password Strength Meter */}
                                            {newPassword && (
                                                <div className="pt-1.5 space-y-1">
                                                    <div className="flex gap-1 h-1">
                                                        {[1, 2, 3, 4].map((level) => (
                                                            <div
                                                                key={level}
                                                                className={cn(
                                                                    "flex-1 rounded-full transition-all duration-300",
                                                                    passwordStrength >= level
                                                                        ? passwordStrength <= 2
                                                                            ? "bg-amber-500 dark:bg-amber-400"
                                                                            : "bg-emerald-500 dark:bg-emerald-400"
                                                                        : "bg-zinc-200 dark:bg-zinc-800"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-zinc-500">
                                                        {passwordStrength <= 1
                                                            ? "Weak — add symbols or uppercase letters"
                                                            : passwordStrength <= 3
                                                            ? "Good password"
                                                            : "Strong password"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-600 dark:text-zinc-400">Confirm New Password</Label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Repeat new password"
                                                    className="w-full h-9 px-3 pr-9 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                    <span>Must contain at least 6 characters.</span>
                                    <button
                                        type="submit"
                                        disabled={isSaving || !currentPassword || !newPassword || newPassword.length < 6}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors cursor-pointer"
                                    >
                                        {isSaving ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Connected Devices & Active Session */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none p-6 space-y-4">
                            <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Active Sessions</h3>
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                                        <Laptop className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-zinc-950 dark:text-white flex items-center gap-2">
                                            Current Device
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                        </p>
                                        <p className="text-[11px] text-zinc-500">
                                            Active workspace session • NextAuth JWT cookie
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Active now</span>
                            </div>
                        </div>

                        {/* Security Standards Overview */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-xs dark:shadow-none p-6 space-y-4">
                            <h3 className="text-sm font-medium text-zinc-950 dark:text-white">Security Infrastructure</h3>
                            <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 text-xs">
                                <div className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-zinc-800 dark:text-zinc-200">Password Hashing</p>
                                        <p className="text-zinc-500 text-[11px]">Bcrypt cryptographic algorithm with 12 salt rounds</p>
                                    </div>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">Active</span>
                                </div>
                                <div className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-zinc-800 dark:text-zinc-200">Transport Layer Security</p>
                                        <p className="text-zinc-500 text-[11px]">TLS 1.3 encryption across all API requests</p>
                                    </div>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">Enforced</span>
                                </div>
                                <div className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-zinc-800 dark:text-zinc-200">Session Guard</p>
                                        <p className="text-zinc-500 text-[11px]">Encrypted HttpOnly cookies via NextAuth</p>
                                    </div>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">Protected</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 4: DANGER ZONE */}
                {activeTab === "danger" && (
                    <motion.div
                        key="danger"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900/60 shadow-xs dark:shadow-none overflow-hidden">
                            <div className="p-6 space-y-3">
                                <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                                    Permanently delete your ExpenseMate profile and wipe all logged transactions,
                                    budgets, and savings targets from our servers. This action is irreversible.
                                </p>
                            </div>
                            <div className="px-6 py-4 bg-red-50 dark:bg-red-950/20 border-t border-red-200 dark:border-red-900/40 flex items-center justify-between">
                                <span className="text-xs text-red-600/80 dark:text-red-400/80">
                                    Once deleted, your account cannot be recovered.
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteConfirmationText("");
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FLOATING UNSAVED CHANGES BAR (Linear Signature UX) */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-4 text-xs"
                    >
                        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                            <span>Careful — you have unsaved changes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setName(initialUser?.name || "");
                                    setPhone(initialUser?.phone || "");
                                }}
                                className="px-2.5 py-1 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-3 py-1 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 font-medium dark:hover:bg-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                <span>Save (⌘S)</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DELETE ACCOUNT CONFIRMATION DIALOG */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-white">
                            Are you absolutely sure?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                            This action cannot be undone. To confirm, please type{" "}
                            <span className="font-mono font-semibold text-red-600 dark:text-red-400">DELETE MY ACCOUNT</span> below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3">
                        <input
                            type="text"
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            placeholder="Type DELETE MY ACCOUNT"
                            className="w-full h-9 px-3 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                    </div>

                    <DialogFooter className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={deleteConfirmationText.trim().toUpperCase() !== "DELETE MY ACCOUNT" || isDeletingAccount}
                            onClick={handleDeleteAccount}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                            {isDeletingAccount && <Loader2 className="w-3 h-3 animate-spin" />}
                            <span>{isDeletingAccount ? "Deleting..." : "Permanently Delete"}</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* FEEDBACK DIALOG */}
            <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
                <DialogContent className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-lg p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-white">
                            Share Feedback
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
                                    "flex-1 flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors",
                                    feedbackType === "feedback"
                                        ? "bg-zinc-100 border-zinc-400 text-zinc-950 dark:bg-zinc-900 dark:border-zinc-500 dark:text-white"
                                        : "bg-white border-zinc-200 text-zinc-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                                )}
                            >
                                <RadioGroupItem value="feedback" id="feedback" className="border-zinc-400 dark:border-zinc-600 text-zinc-950 dark:text-white" />
                                <span>General</span>
                            </label>

                            <label
                                htmlFor="issue"
                                className={cn(
                                    "flex-1 flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors",
                                    feedbackType === "issue"
                                        ? "bg-zinc-100 border-zinc-400 text-zinc-950 dark:bg-zinc-900 dark:border-zinc-500 dark:text-white"
                                        : "bg-white border-zinc-200 text-zinc-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                                )}
                            >
                                <RadioGroupItem value="issue" id="issue" className="border-zinc-400 dark:border-zinc-600 text-zinc-950 dark:text-white" />
                                <span>Report Issue</span>
                            </label>
                        </RadioGroup>

                        <Textarea
                            value={feedbackMessage}
                            onChange={(e) => setFeedbackMessage(e.target.value)}
                            placeholder="Write your note here..."
                            rows={4}
                            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 text-xs sm:text-sm"
                        />

                        <DialogFooter className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFeedbackOpen(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSendingFeedback || !feedbackMessage.trim()}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                {isSendingFeedback && <Loader2 className="w-3 h-3 animate-spin" />}
                                <span>{isSendingFeedback ? "Sending..." : "Submit"}</span>
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
