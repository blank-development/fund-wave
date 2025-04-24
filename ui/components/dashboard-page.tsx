"use client";

import { Textarea } from "@/components/ui/textarea";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Rocket,
  Heart,
  Settings,
  Bell,
  LogOut,
  Plus,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
  const [backedCampaigns, setBackedCampaigns] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    location: "",
    bio: "",
    avatarUrl: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setUserCampaigns(data.userCampaigns);
        setBackedCampaigns(data.backedCampaigns);
        setAnalyticsData(data.analytics);
        setUserData(data.user);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      setUserData((prev) => ({
        ...prev,
        avatarUrl: data.url,
      }));

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SidebarProvider>
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold tracking-tighter">
                FUNDWAVE
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                >
                  <button>
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Overview</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeTab === "my-campaigns"}
                  onClick={() => setActiveTab("my-campaigns")}
                >
                  <button>
                    <Rocket className="h-5 w-5" />
                    <span>My Campaigns</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                >
                  <button>
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 mt-auto">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={
                    userData.avatarUrl ||
                    "/placeholder.svg?height=40&width=40&text=JD"
                  }
                />
                <AvatarFallback>
                  {userData.firstName?.[0]}
                  {userData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {userData.firstName} {userData.lastName}
                </span>
                <span className="text-xs text-gray-400">{userData.email}</span>
              </div>
            </div>
            <Separator className="my-4 bg-gray-800" />
            <Button
              variant="ghost"
              className="w-full justify-start text-black hover:text-black"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 ml-0">
          <header className="h-16 border-b border-gray-800 flex items-center px-6">
            <SidebarTrigger className="md:hidden mr-4" />
            <h1 className="text-xl font-bold">Dashboard</h1>
          </header>

          <main className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Overview</h2>
                  <Button
                    asChild
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Link href="/start-campaign">
                      <Plus className="mr-2 h-4 w-4" />
                      Start New Campaign
                    </Link>
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Total Raised",
                      value: `$${analyticsData.totalRaised.toLocaleString()}`,
                      icon: <TrendingUp className="h-5 w-5" />,
                      description: "Across all campaigns",
                    },
                    {
                      title: "Total Backers",
                      value: analyticsData.totalBackers,
                      icon: <Users className="h-5 w-5" />,
                      description: "Supporting your campaigns",
                    },
                    {
                      title: "Avg. Contribution",
                      value: `$${analyticsData.averageContribution}`,
                      icon: <BarChart3 className="h-5 w-5" />,
                      description: "Per backer",
                    },
                    {
                      title: "Active Campaigns",
                      value: userCampaigns.filter((c) => c.status === "active")
                        .length,
                      icon: <Rocket className="h-5 w-5" />,
                      description: "Currently running",
                    },
                  ].map((stat, i) => (
                    <Card key={i} className="bg-white">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-black">
                          {stat.title}
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                          {stat.icon}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-black mt-1">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  {/* My Campaigns */}
                  <Card className="bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>My Campaigns</CardTitle>
                        <CardDescription className="text-black">
                          Your most recent campaigns
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-black hover:bg-white bg-white"
                      >
                        <Link
                          href="#"
                          onClick={() => setActiveTab("my-campaigns")}
                        >
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {userCampaigns.slice(0, 2).map((campaign) => (
                        <div key={campaign.id} className="flex gap-4">
                          <div className="w-20 h-20 bg-white rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={campaign.image || "/placeholder.svg"}
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{campaign.title}</h4>
                            </div>
                            <Progress
                              value={(campaign.raised / campaign.goal) * 100}
                              className="h-1 mb-2"
                            />
                            <div className="flex justify-between text-xs text-black">
                              <span>
                                ${campaign.raised.toLocaleString()} raised
                              </span>
                              <span>{campaign.backers} backers</span>
                              <span>
                                {campaign.daysLeft > 0
                                  ? `${campaign.daysLeft} days left`
                                  : "Ended"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "my-campaigns" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Campaigns</h2>
                  <Button
                    asChild
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Link href="/start-campaign">
                      <Plus className="mr-2 h-4 w-4" />
                      Start New Campaign
                    </Link>
                  </Button>
                </div>

                <Tabs defaultValue="all">
                  <TabsList className="bg-black">
                    <TabsTrigger value="all">All Campaigns</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="successful">Successful</TabsTrigger>
                    <TabsTrigger value="failed">Failed</TabsTrigger>
                    <TabsTrigger value="drafts">Drafts</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userCampaigns.map((campaign) => (
                        <Card key={campaign.id} className="bg-white">
                          <div className="aspect-video bg-black">
                            <img
                              src={campaign.image || "/placeholder.svg"}
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>{campaign.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <Progress
                              value={(campaign.raised / campaign.goal) * 100}
                              className="h-2"
                            />
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-sm text-black">Raised</p>
                                <p className="font-bold">
                                  ${campaign.raised.toLocaleString()}
                                </p>
                                <p className="text-xs text-black">
                                  of ${campaign.goal.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-black">Backers</p>
                                <p className="font-bold">{campaign.backers}</p>
                              </div>
                              <div>
                                <p className="text-sm text-black">
                                  {campaign.daysLeft > 0
                                    ? "Days Left"
                                    : "Ended"}
                                </p>
                                <p className="font-bold">
                                  {campaign.daysLeft > 0
                                    ? campaign.daysLeft
                                    : "0"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Button
                              variant="outline"
                              className="bg-white text-black hover:bg-white"
                            >
                              Edit Campaign
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="bg-black text-white hover:bg-black hover:text-white"
                            >
                              <Link href={`/campaign/${campaign.id}`}>
                                View Campaign
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="active" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userCampaigns
                        .filter((campaign) => campaign.status === "active")
                        .map((campaign) => (
                          <Card
                            key={campaign.id}
                            className="bg-gray-900 border-gray-800"
                          >
                            <div className="aspect-video bg-gray-800">
                              <img
                                src={campaign.image || "/placeholder.svg"}
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle>{campaign.title}</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Progress
                                value={(campaign.raised / campaign.goal) * 100}
                                className="h-2"
                              />
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Raised
                                  </p>
                                  <p className="font-bold">
                                    ${campaign.raised.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    of ${campaign.goal.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Backers
                                  </p>
                                  <p className="font-bold">
                                    {campaign.backers}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Days Left
                                  </p>
                                  <p className="font-bold">
                                    {campaign.daysLeft}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button
                                variant="outline"
                                className="border-gray-700 hover:bg-gray-800"
                              >
                                Edit Campaign
                              </Button>
                              <Button
                                asChild
                                className="bg-white text-black hover:bg-gray-200"
                              >
                                <Link href={`/campaign/${campaign.id}`}>
                                  View Campaign
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Account Settings</h2>

                <form onSubmit={handleUpdateProfile}>
                  <Card className="bg-black text-white">
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription className="text-white">
                        Update your account information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage
                            src={
                              userData.avatarUrl ||
                              "/placeholder.svg?height=80&width=80&text=JD"
                            }
                            alt={`${userData.firstName} ${userData.lastName}`}
                          />
                          <AvatarFallback>
                            {userData.firstName?.[0]}
                            {userData.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="bg-white text-black hover:bg-white"
                            type="button"
                            disabled={isUploading}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e) =>
                                handleAvatarUpload(
                                  e as React.ChangeEvent<HTMLInputElement>
                                );
                              input.click();
                            }}
                          >
                            {isUploading ? "Uploading..." : "Change Avatar"}
                          </Button>
                          <p className="text-xs text-gray-400">
                            Recommended: Square image, max 2MB
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={userData.firstName}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                firstName: e.target.value,
                              })
                            }
                            className="bg-black border-gray-800 focus:border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={userData.lastName}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                lastName: e.target.value,
                              })
                            }
                            className="bg-black border-gray-800 focus:border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userData.email}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                email: e.target.value,
                              })
                            }
                            className="bg-black border-gray-800 focus:border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={userData.username}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                username: e.target.value,
                              })
                            }
                            className="bg-black border-gray-800 focus:border-gray-700"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-white text-black hover:bg-gray-200"
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </form>

                <Card className="bg-black text-white">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription className="text-black">
                      Manage how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        title: "Email Notifications",
                        description:
                          "Receive email updates about your account activity",
                      },
                      {
                        title: "Campaign Updates",
                        description:
                          "Get notified when campaigns you back post updates",
                      },
                      {
                        title: "New Backers",
                        description:
                          "Receive notifications when someone backs your campaign",
                      },
                      {
                        title: "Marketing Communications",
                        description: "Receive promotional emails and offers",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-gray-400 text-sm">
                            {item.description}
                          </p>
                        </div>
                        <div className="h-6 w-11 bg-gray-800 rounded-full p-1 cursor-pointer">
                          <div
                            className={`h-4 w-4 rounded-full bg-white transform transition-transform ${
                              i < 2 ? "translate-x-5" : ""
                            }`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
