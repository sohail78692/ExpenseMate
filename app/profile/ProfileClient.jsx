"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Camera, User, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ProfileClient({ initialUser }) {
    const { data: session, update } = useSession();
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    // Profile state
    const [name, setName] = useState(initialUser?.name || "");
    const [email, setEmail] = useState(initialUser?.email || "");
    const [phone, setPhone] = useState(initialUser?.phone || "");
    const [profileImage, setProfileImage] = useState(initialUser?.profileImage || "");

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    phone,
                    profileImage,
                }),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setMessage("Profile updated successfully!");
                setIsEditing(false);
                // Update session with new data
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: updatedUser.name,
                        image: updatedUser.profileImage,
                    },
                });
                // Refresh the page to show updated data
                router.refresh();
            } else {
                const error = await res.json();
                setMessage(error.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            setMessage("Error saving profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage("Passwords don't match!");
            return;
        }

        if (newPassword.length < 6) {
            setMessage("Password must be at least 6 characters");
            return;
        }

        setIsSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/profile/password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage(data.message || "Failed to update password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            setMessage("Error changing password");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        // First confirmation
        const firstConfirm = window.confirm(
            "⚠️ WARNING: This action is IRREVERSIBLE!\n\n" +
            "Deleting your account will permanently remove:\n" +
            "• All your expenses\n" +
            "• All your budgets\n" +
            "• All your savings goals\n" +
            "• Your profile and personal information\n\n" +
            "Are you absolutely sure you want to continue?"
        );

        if (!firstConfirm) return;

        // Second confirmation with typed confirmation
        const secondConfirm = window.prompt(
            "To confirm deletion, please type 'DELETE MY ACCOUNT' (all caps):"
        );

        if (secondConfirm !== "DELETE MY ACCOUNT") {
            alert("Account deletion cancelled. The text did not match.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/profile/delete", {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Your account has been permanently deleted. You will now be logged out.");
                await signOut({ callbackUrl: "/login" });
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to delete account");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            setMessage("Error deleting account");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.includes("success") ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>
                    {message}
                </div>
            )}

            {/* Profile Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={profileImage} />
                                <AvatarFallback className="text-3xl">
                                    {name?.charAt(0) || session?.user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors" title="Upload profile picture">
                                <Camera className="h-4 w-4" />
                                <input
                                    id="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    aria-label="Upload profile picture"
                                />
                            </label>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                                <h2 className="text-2xl font-bold">{name || session?.user?.name}</h2>
                                {session?.user?.isVerified && (
                                    <Badge variant="default" className="bg-blue-500">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground mb-4">{email || session?.user?.email}</p>
                            <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                                <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                                    <User className="h-4 w-4 mr-2" />
                                    {isEditing ? "Cancel" : "Edit Profile"}
                                </Button>
                                {!session?.user?.isVerified && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-blue-500 text-blue-500 hover:bg-blue-50"
                                        onClick={async () => {
                                            setIsSaving(true);
                                            try {
                                                const res = await fetch("/api/profile/verify", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" }
                                                });
                                                const data = await res.json();
                                                if (res.ok) {
                                                    setMessage(data.message);
                                                } else {
                                                    setMessage(data.message || "Error sending verification request");
                                                }
                                            } catch (error) {
                                                setMessage("Error sending verification request");
                                            } finally {
                                                setIsSaving(false);
                                            }
                                        }}
                                        disabled={isSaving}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        {isSaving ? "Sending..." : "Request Verification"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details here</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            {isEditing && (
                                <div className="flex gap-2">
                                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Status</CardTitle>
                            <CardDescription>Your account verification and status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <span>Account Active</span>
                                </div>
                                <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <Button onClick={handleChangePassword} disabled={isSaving}>
                                <Lock className="h-4 w-4 mr-2" />
                                {isSaving ? "Updating..." : "Update Password"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Security Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>• Use a strong password with at least 8 characters</p>
                            <p>• Include uppercase, lowercase, numbers, and symbols</p>
                            <p>• Don&apos;t reuse passwords from other accounts</p>
                            <p>• Change your password regularly</p>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Permanently delete your account and all associated data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                                    ⚠️ Warning: This action cannot be undone!
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    Deleting your account will permanently remove:
                                </p>
                                <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside mt-2 space-y-1">
                                    <li>All your expenses and transaction history</li>
                                    <li>All your budgets and financial plans</li>
                                    <li>All your savings goals and progress</li>
                                    <li>Your profile and personal information</li>
                                </ul>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={isSaving}
                                className="w-full"
                            >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                {isSaving ? "Deleting Account..." : "Delete My Account"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize how ExpenseMate looks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Choose your preferred color theme
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs >
        </div >
    );
}
