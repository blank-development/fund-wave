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

// Sample data for the dashboard
const userCampaigns = [
  {
    id: "sustainable-water-filter",
    title: "Sustainable Water Filter",
    image: "/placeholder.svg?height=150&width=300&text=Water+Filter",
    goal: 25000,
    raised: 18750,
    backers: 320,
    daysLeft: 15,
    status: "active",
  },
  {
    id: "eco-friendly-backpack",
    title: "Eco-Friendly Backpack",
    image: "/placeholder.svg?height=150&width=300&text=Backpack",
    goal: 12000,
    raised: 12000,
    backers: 245,
    daysLeft: 0,
    status: "successful",
  },
  {
    id: "solar-powered-charger",
    title: "Solar-Powered Charger",
    image: "/placeholder.svg?height=150&width=300&text=Charger",
    goal: 30000,
    raised: 5000,
    backers: 78,
    daysLeft: 0,
    status: "failed",
  },
];

const backedCampaigns = [
  {
    id: "eco-friendly-water-bottle",
    title: "Eco-Friendly Water Bottle",
    creator: "EcoDesign Collective",
    image: "/placeholder.svg?height=100&width=200&text=Eco+Bottle",
    contribution: 50,
    date: "2023-11-15",
    status: "active",
  },
  {
    id: "ai-powered-smart-garden",
    title: "AI-Powered Smart Garden",
    creator: "GreenTech Innovations",
    image: "/placeholder.svg?height=100&width=200&text=Smart+Garden",
    contribution: 100,
    date: "2023-10-22",
    status: "active",
  },
  {
    id: "indie-documentary-film",
    title: "Indie Documentary Film",
    creator: "FilmVision Studios",
    image: "/placeholder.svg?height=100&width=200&text=Documentary",
    contribution: 75,
    date: "2023-09-05",
    status: "successful",
  },
];

const notifications = [
  {
    id: 1,
    title: "New backer!",
    message:
      "John D. just backed your Sustainable Water Filter campaign with $50.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Campaign milestone reached",
    message:
      "Your Sustainable Water Filter campaign has reached 75% of its funding goal!",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    title: "New comment",
    message: "Sarah L. commented on your Sustainable Water Filter campaign.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    title: "Campaign update",
    message: "Eco-Friendly Water Bottle posted a new update.",
    time: "3 days ago",
    read: true,
  },
];

// Analytics data
const analyticsData = {
  totalRaised: 18750,
  totalBackers: 320,
  averageContribution: 58.59,
  conversionRate: 4.2,
  dailyViews: [120, 145, 132, 160, 180, 170, 190],
  dailyBackers: [5, 8, 6, 10, 12, 9, 15],
  referralSources: [
    { source: "Direct", percentage: 40 },
    { source: "Social Media", percentage: 30 },
    { source: "Search", percentage: 15 },
    { source: "Email", percentage: 10 },
    { source: "Other", percentage: 5 },
  ],
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
  const [backedCampaigns, setBackedCampaigns] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                FUND<span className="text-gray-400">WAVE</span>
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
                  isActive={activeTab === "backed-campaigns"}
                  onClick={() => setActiveTab("backed-campaigns")}
                >
                  <button>
                    <Heart className="h-5 w-5" />
                    <span>Backed Campaigns</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeTab === "analytics"}
                  onClick={() => setActiveTab("analytics")}
                >
                  <button>
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                >
                  <button>
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
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
                  src="/placeholder.svg?height=40&width=40&text=JD"
                  alt="John Doe"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-gray-400">
                  john.doe@example.com
                </span>
              </div>
            </div>
            <Separator className="my-4 bg-gray-800" />
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 ml-0 md:ml-64">
          <header className="h-16 border-b border-gray-800 flex items-center px-6">
            <SidebarTrigger className="md:hidden mr-4" />
            <h1 className="text-xl font-bold">Dashboard</h1>
            <div className="ml-auto flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-900"
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32&text=JD"
                  alt="John Doe"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
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
                    <Card key={i} className="bg-gray-900 border-gray-800">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          {stat.title}
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                          {stat.icon}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-gray-400 mt-1">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* My Campaigns */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>My Campaigns</CardTitle>
                        <CardDescription className="text-gray-400">
                          Your most recent campaigns
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-gray-400 hover:text-white"
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
                          <div className="w-20 h-20 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={campaign.image || "/placeholder.svg"}
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{campaign.title}</h4>
                              <Badge
                                className={
                                  campaign.status === "active"
                                    ? "bg-green-900 text-green-300"
                                    : campaign.status === "successful"
                                    ? "bg-blue-900 text-blue-300"
                                    : "bg-red-900 text-red-300"
                                }
                              >
                                {campaign.status.charAt(0).toUpperCase() +
                                  campaign.status.slice(1)}
                              </Badge>
                            </div>
                            <Progress
                              value={(campaign.raised / campaign.goal) * 100}
                              className="h-1 mb-2"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
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

                  {/* Backed Campaigns */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Backed Campaigns</CardTitle>
                        <CardDescription className="text-gray-400">
                          Campaigns you've supported
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-gray-400 hover:text-white"
                      >
                        <Link
                          href="#"
                          onClick={() => setActiveTab("backed-campaigns")}
                        >
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {backedCampaigns.slice(0, 3).map((campaign) => (
                        <div key={campaign.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={campaign.image || "/placeholder.svg"}
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-1">
                              {campaign.title}
                            </h4>
                            <p className="text-xs text-gray-400 mb-1">
                              by {campaign.creator}
                            </p>
                            <div className="flex justify-between text-xs">
                              <span>
                                You contributed: ${campaign.contribution}
                              </span>
                              <Badge
                                className={
                                  campaign.status === "active"
                                    ? "bg-green-900 text-green-300"
                                    : "bg-blue-900 text-blue-300"
                                }
                              >
                                {campaign.status.charAt(0).toUpperCase() +
                                  campaign.status.slice(1)}
                              </Badge>
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
                  <TabsList className="bg-gray-900">
                    <TabsTrigger value="all">All Campaigns</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="successful">Successful</TabsTrigger>
                    <TabsTrigger value="failed">Failed</TabsTrigger>
                    <TabsTrigger value="drafts">Drafts</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userCampaigns.map((campaign) => (
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
                              <Badge
                                className={
                                  campaign.status === "active"
                                    ? "bg-green-900 text-green-300"
                                    : campaign.status === "successful"
                                    ? "bg-blue-900 text-blue-300"
                                    : "bg-red-900 text-red-300"
                                }
                              >
                                {campaign.status.charAt(0).toUpperCase() +
                                  campaign.status.slice(1)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <Progress
                              value={(campaign.raised / campaign.goal) * 100}
                              className="h-2"
                            />
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-400">Raised</p>
                                <p className="font-bold">
                                  ${campaign.raised.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  of ${campaign.goal.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Backers</p>
                                <p className="font-bold">{campaign.backers}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">
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
                              className="border-gray-700 hover:bg-gray-800"
                            >
                              Edit Campaign
                            </Button>
                            <Button
                              asChild
                              className="bg-white text-black hover:bg-gray-200"
                            >
                              <Link href={`/projects/${campaign.id}`}>
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
                                <Badge className="bg-green-900 text-green-300">
                                  Active
                                </Badge>
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
                                <Link href={`/projects/${campaign.id}`}>
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

            {activeTab === "backed-campaigns" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Backed Campaigns</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {backedCampaigns.map((campaign) => (
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
                          <CardTitle className="line-clamp-1">
                            {campaign.title}
                          </CardTitle>
                          <Badge
                            className={
                              campaign.status === "active"
                                ? "bg-green-900 text-green-300"
                                : "bg-blue-900 text-blue-300"
                            }
                          >
                            {campaign.status.charAt(0).toUpperCase() +
                              campaign.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-400">
                          by {campaign.creator}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Your contribution:
                            </span>
                            <span className="font-medium">
                              ${campaign.contribution}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Date:</span>
                            <span>
                              {new Date(campaign.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          asChild
                          className="w-full bg-white text-black hover:bg-gray-200"
                        >
                          <Link href={`/projects/${campaign.id}`}>
                            View Campaign
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Campaign Analytics</h2>

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
                      title: "Conversion Rate",
                      value: `${analyticsData.conversionRate}%`,
                      icon: <TrendingUp className="h-5 w-5" />,
                      description: "Visitors to backers",
                    },
                  ].map((stat, i) => (
                    <Card key={i} className="bg-gray-900 border-gray-800">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          {stat.title}
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                          {stat.icon}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-gray-400 mt-1">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Views Chart */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Daily Campaign Views</CardTitle>
                      <CardDescription className="text-gray-400">
                        Last 7 days of campaign page views
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-end justify-between gap-2">
                        {analyticsData.dailyViews.map((views, i) => (
                          <div
                            key={i}
                            className="relative flex flex-col items-center"
                          >
                            <div
                              className="w-12 bg-white rounded-t-sm"
                              style={{
                                height: `${
                                  (views /
                                    Math.max(...analyticsData.dailyViews)) *
                                  200
                                }px`,
                              }}
                            ></div>
                            <span className="text-xs text-gray-400 mt-2">
                              Day {i + 1}
                            </span>
                            <span className="text-xs font-medium absolute bottom-8">
                              {views}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Referral Sources */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Traffic Sources</CardTitle>
                      <CardDescription className="text-gray-400">
                        Where your backers are coming from
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.referralSources.map((source, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{source.source}</span>
                              <span className="text-sm font-medium">
                                {source.percentage}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full">
                              <div
                                className="h-full bg-white rounded-full"
                                style={{ width: `${source.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Notifications</h2>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg ${
                            notification.read ? "bg-gray-800/50" : "bg-gray-800"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">
                              {notification.time}
                            </p>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Account Settings</h2>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your account information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src="/placeholder.svg?height=80&width=80&text=JD"
                          alt="John Doe"
                        />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Button
                        variant="outline"
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        Change Avatar
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          defaultValue="John Doe"
                          className="bg-black border-gray-800 focus:border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue="john.doe@example.com"
                          className="bg-black border-gray-800 focus:border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          defaultValue="johndoe"
                          className="bg-black border-gray-800 focus:border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          defaultValue="New York, USA"
                          className="bg-black border-gray-800 focus:border-gray-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        defaultValue="Creator and innovator passionate about technology and design."
                        className="bg-black border-gray-800 focus:border-gray-700"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-white text-black hover:bg-gray-200">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription className="text-gray-400">
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
