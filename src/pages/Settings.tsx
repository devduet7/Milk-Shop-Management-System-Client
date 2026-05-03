// <== IMPORTS ==>
import { memo } from "react";
import { Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfile } from "@/hooks/useSettings";
import PricingTab from "@/components/settings/PricingTab";
import AccountTab from "@/components/settings/AccountTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import { PageTransition } from "@/components/layout/PageTransition";
import SettingsStatsCards from "@/components/settings/SettingsStatsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// <== SETTINGS PAGE SKELETON ==>
const SettingsPageSkeleton = () => (
  <div className="page-container">
    {/* HEADER SKELETON */}
    <div className="mb-8 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3 w-56" />
      </div>
    </div>
    {/* STATS SKELETON */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-4 md:p-5">
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-7 w-28" />
        </div>
      ))}
    </div>
    {/* TABS SKELETON */}
    <div className="flex gap-2 mb-6">
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
  // SHOW SKELETON ON INITIAL LOAD
  if (isLoading && !profile) {
    // RETURNING SKELETON
    return <SettingsPageSkeleton />;
  }
  // RETURNING SETTINGS PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER */}
      <div className="mb-8 flex items-center gap-3">
        {/* ICON */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        {/* TITLE AND DESCRIPTION */}
        <div>
          <h1 className="font-display text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account, pricing, and preferences
          </p>
        </div>
      </div>
      {/* STATS CARDS */}
      <SettingsStatsCards profile={profile} isLoading={isLoading} />
      {/* TABS */}
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        {/* ACCOUNT TAB */}
        <TabsContent value="account" className="mt-0">
          <AccountTab />
        </TabsContent>
        {/* PRICING TAB */}
        <TabsContent value="pricing" className="mt-0">
          <PricingTab />
        </TabsContent>
        {/* PREFERENCES TAB */}
        <TabsContent value="preferences" className="mt-0">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
SettingsPage.displayName = "SettingsPage";

// <== MEMOIZED EXPORT ==>
export default SettingsPage;
