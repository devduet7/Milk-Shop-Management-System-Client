// <== IMPORTS ==>
import {
  Save,
  Bell,
  Store,
  Globe,
  Shield,
  Settings,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// <== SETTINGS PAGE COMPONENT ==>
const SettingsPage = () => {
  // MILK PRICE STATE
  const [milkRate, setMilkRate] = useState("120");
  // AUTO BACKUP STATE
  const [autoBackup, setAutoBackup] = useState(false);
  // YOGHURT PRICE STATE
  const [yoghurtRate, setYoghurtRate] = useState("180");
  // NOTIFICATIONS STATE
  const [shopName, setShopName] = useState("My Milk Shop");
  // NOTIFICATIONS STATE
  const [notifications, setNotifications] = useState(true);
  // STATS
  const stats = [
    // SHOP STATUS
    {
      label: "Shop Status",
      value: "Active",
      icon: Store,
      badge: "ONLINE",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    // MILK RATE
    {
      label: "Milk Rate",
      value: `₨${milkRate}/L`,
      icon: DollarSign,
      badge: "CURRENT",
      badgeColor: "bg-primary/10 text-primary",
    },
    // YOGHURT RATE
    {
      label: "Yoghurt Rate",
      value: `₨${yoghurtRate}/kg`,
      icon: TrendingUp,
      badge: "CURRENT",
      badgeColor: "bg-primary/10 text-primary",
    },
    // DATA BACKUP
    {
      label: "Data Backup",
      value: autoBackup ? "Enabled" : "Disabled",
      icon: Shield,
      badge: autoBackup ? "ON" : "OFF",
      badgeColor: autoBackup
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];
  // RETURNING THE SETTINGS PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <PageTransition className="page-container">
      {/* HEADER */}
      <div className="mb-8 flex items-center gap-3">
        {/* ICON */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        {/* TITLE & DESCRIPTION */}
        <div>
          <h1 className="font-display text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your shop preferences and pricing
          </p>
        </div>
      </div>
      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map((stat, i) => {
          // ICON
          const Icon = stat.icon;
          // RETURNING THE STATS CARDS
          return (
            // STATS CARD CONTAINER
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 md:p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* ICON */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div
                  className={cn(
                    "text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full",
                    stat.badgeColor,
                  )}
                >
                  {stat.badge}
                </div>
              </div>
              {/* LABEL */}
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {/* VALUE */}
              <p className="text-2xl font-bold font-display mt-0.5">
                {stat.value}
              </p>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            </motion.div>
          );
        })}
      </div>
      {/* TABS */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        {/* GENERAL */}
        <TabsContent value="general">
          {/* CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 md:p-6 space-y-6"
          >
            {/* HEADER */}
            <div>
              {/* TITLE */}
              <h2 className="font-display font-semibold text-lg">
                Shop Information
              </h2>
              {/* DESCRIPTION */}
              <p className="text-sm text-muted-foreground">
                Configure your shop details
              </p>
            </div>
            <Separator />
            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SHOP NAME */}
              <div>
                <Label>Shop Name</Label>
                <Input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="mt-1"
                />
              </div>
              {/* OWNER NAME */}
              <div>
                <Label>Owner Name</Label>
                <Input defaultValue="Shop Owner" className="mt-1" />
              </div>
              {/* PHONE */}
              <div>
                <Label>Phone</Label>
                <Input defaultValue="+92 300 1234567" className="mt-1" />
              </div>
              {/* ADDRESS */}
              <div>
                <Label>Address</Label>
                <Input defaultValue="Main Bazaar, Town" className="mt-1" />
              </div>
            </div>
            {/* BUTTON */}
            <Button onClick={() => toast.success("Settings saved!")}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </motion.div>
        </TabsContent>
        {/* PRICING */}
        <TabsContent value="pricing">
          {/* CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 md:p-6 space-y-6"
          >
            {/* HEADER */}
            <div>
              {/* TITLE */}
              <h2 className="font-display font-semibold text-lg">
                Pricing Configuration
              </h2>
              {/* DESCRIPTION */}
              <p className="text-sm text-muted-foreground">
                Set default rates for products
              </p>
            </div>
            <Separator />
            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MILK RATE */}
              <div>
                <Label>Milk Rate (per liter)</Label>
                <Input
                  type="number"
                  value={milkRate}
                  onChange={(e) => setMilkRate(e.target.value)}
                  className="mt-1"
                />
              </div>
              {/* YOGHURT RATE */}
              <div>
                <Label>Yoghurt Rate (per kg)</Label>
                <Input
                  type="number"
                  value={yoghurtRate}
                  onChange={(e) => setYoghurtRate(e.target.value)}
                  className="mt-1"
                />
              </div>
              {/* CURRENCY */}
              <div>
                <Label>Currency</Label>
                <Select defaultValue="pkr">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pkr">PKR (₨)</SelectItem>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="inr">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* BUTTON */}
            <Button onClick={() => toast.success("Pricing updated!")}>
              <Save className="w-4 h-4 mr-2" /> Save Pricing
            </Button>
          </motion.div>
        </TabsContent>
        {/* PREFERENCES */}
        <TabsContent value="preferences">
          {/* CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 md:p-6 space-y-6"
          >
            {/* HEADER */}
            <div>
              {/* TITLE */}
              <h2 className="font-display font-semibold text-lg">
                Preferences
              </h2>
              {/* DESCRIPTION */}
              <p className="text-sm text-muted-foreground">
                Customize your experience
              </p>
            </div>
            <Separator />
            {/* FORM */}
            <div className="space-y-6">
              {/* NOTIFICATIONS SWITCH */}
              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl">
                {/* HEADER */}
                <div className="flex items-center gap-3">
                  {/* ICON */}
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Bell className="w-4 h-4" />
                  </div>
                  {/* TITLE & DESCRIPTION */}
                  <div>
                    <Label>Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for new sales
                    </p>
                  </div>
                </div>
                {/* SWITCH */}
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              {/* AUTO BACKUP SWITCH */}
              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl">
                {/* HEADER */}
                <div className="flex items-center gap-3">
                  {/* ICON */}
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Shield className="w-4 h-4" />
                  </div>
                  {/* TITLE & DESCRIPTION */}
                  <div>
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup data daily
                    </p>
                  </div>
                </div>
                {/* SWITCH */}
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
              {/* LANGUAGE SELECT */}
              <div className="p-4 bg-muted/40 rounded-xl">
                {/* HEADER */}
                <div className="flex items-center gap-3 mb-3">
                  {/* ICON */}
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Globe className="w-4 h-4" />
                  </div>
                  {/* TITLE & DESCRIPTION */}
                  <div>
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred language
                    </p>
                  </div>
                </div>
                {/* SELECT */}
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* BUTTON */}
            <Button onClick={() => toast.success("Preferences saved!")}>
              <Save className="w-4 h-4 mr-2" /> Save Preferences
            </Button>
          </motion.div>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
};

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default memo(SettingsPage);
