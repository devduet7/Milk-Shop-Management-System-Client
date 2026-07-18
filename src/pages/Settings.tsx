// <== IMPORTS ==>
import { memo } from "react";
import { Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfile } from "@/hooks/useSettings";
import { useAuthStore } from "@/stores/useAuthStore";
import PricingTab from "@/components/settings/PricingTab";
import AccountTab from "@/components/settings/AccountTab";
import SessionsTab from "@/components/settings/SessionsTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import { PageTransition } from "@/components/layout/PageTransition";
import TrashSettingsTab from "@/components/settings/TrashSettingsTab";
import SettingsStatsCards from "@/components/settings/SettingsStatsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// <== SETTINGS PAGE SKELETON ==>
const SettingsPageSkeleton = () => (
  <div className="page-container">
    {/* HEADER SKELETON */}
    <div className="mb-6 sm:mb-8 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3 w-56 hidden sm:block" />
      </div>
    </div>
    {/* STATS SKELETON */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5 sm:mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-4 md:p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-muted/60 rounded-t-xl" />
          <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl mb-2 sm:mb-3" />
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-6 sm:h-7 w-28 mt-0.5" />
        </div>
      ))}
    </div>
    {/* TABS SKELETON */}
    <div className="flex gap-2 mb-6">
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-20 rounded-md" />
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
    {/* CONTENT SKELETON */}
    <div className="glass-card p-4 md:p-6 space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-px w-full" />
      {/* AVATAR SKELETON */}
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-px w-full" />
      {/* FIELD SKELETONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// <== SETTINGS PAGE COMPONENT ==>
const SettingsPage = memo(() => {
  // FETCH PROFILE
  const { data: profile, isLoading } = useGetProfile();
  // GETTING CURRENT USER'S ROLE FROM AUTH STORE
  const role = useAuthStore((state) => state.user?.role);
  // WHETHER THE CURRENT USER CAN SEE BUSINESS-CONFIG TABS
  const isAdminTier = role === "superadmin" || role === "admin";
  // SHOW SKELETON ON INITIAL LOAD
  if (isLoading && !profile) {
    // RETURNING SKELETON
    return <SettingsPageSkeleton />;
  }
  // RETURNING SETTINGS PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER */}
      <div className="mb-6 sm:mb-8 flex items-center gap-3">
        {/* PAGE ICON BADGE WITH GRADIENT */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
          <Settings className="w-[18px] h-[18px] text-primary-foreground stroke-[2.5]" />
        </div>
        {/* TITLE AND DESCRIPTION */}
        <div>
          <h1 className="font-display text-2xl font-bold">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
            {isAdminTier
              ? "Manage your account, pricing, and preferences"
              : "Manage your account details"}
          </p>
        </div>
      </div>
      {/* STATS CARDS */}
      <SettingsStatsCards
        profile={profile}
        isLoading={isLoading}
        isAdminTier={isAdminTier}
        role={role}
      />
      {/* TABS — PRICING AND PREFERENCES ONLY RENDERED FOR ADMIN-TIER */}
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-muted">
          {/* ACCOUNT TAB TRIGGER */}
          <TabsTrigger value="account">Account</TabsTrigger>
          {/* SESSIONS TAB — OPEN TO EVERY AUTHENTICATED USER */}
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          {/* PRICING TAB TRIGGER */}
          {isAdminTier && <TabsTrigger value="pricing">Pricing</TabsTrigger>}
          {/* PREFERENCES TAB TRIGGER */}
          {isAdminTier && (
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          )}
          {/* TRASH TAB TRIGGER */}
          {isAdminTier && <TabsTrigger value="trash">Trash</TabsTrigger>}
        </TabsList>
        {/* ACCOUNT TAB */}
        <TabsContent value="account" className="mt-0">
          <AccountTab />
        </TabsContent>
        {/* SESSIONS TAB */}
        <TabsContent value="sessions" className="mt-0">
          <SessionsTab />
        </TabsContent>
        {/* PRICING TAB CONTENT */}
        {isAdminTier && (
          <TabsContent value="pricing" className="mt-0">
            <PricingTab />
          </TabsContent>
        )}
        {/* PREFERENCES TAB CONTENT */}
        {isAdminTier && (
          <TabsContent value="preferences" className="mt-0">
            <PreferencesTab />
          </TabsContent>
        )}
        {/* TRASH TAB CONTENT */}
        {isAdminTier && (
          <TabsContent value="trash" className="mt-0">
            <TrashSettingsTab />
          </TabsContent>
        )}
      </Tabs>
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
SettingsPage.displayName = "SettingsPage";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default SettingsPage;
