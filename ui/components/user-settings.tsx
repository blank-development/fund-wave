"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, User, CreditCard, Bell, Shield, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserSettings() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      <div
        className={`h-16 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"} flex items-center px-6`}
      >
        <Link
          href="/"
          className={`flex items-center ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"} transition-colors`}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 space-y-6">
              <div className="flex flex-col items-center md:items-start space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="User" />
                  <AvatarFallback className="text-xl">JD</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h2 className="text-xl font-bold">John Doe</h2>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>john.doe@example.com</p>
                </div>
              </div>

              <Separator className={theme === "dark" ? "bg-gray-800" : "bg-gray-200"} />

              <nav className="space-y-1">
                {[
                  { icon: User, label: "Profile" },
                  { icon: CreditCard, label: "Billing" },
                  { icon: Bell, label: "Notifications" },
                  { icon: Shield, label: "Security" },
                ].map((item, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className={`w-full justify-start ${
                      theme === "dark" ? "hover:bg-gray-900 text-white" : "hover:bg-gray-100 text-black"
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            <div className="flex-1">
              <Tabs defaultValue="profile">
                <TabsList className={`grid w-full grid-cols-4 ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6 space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-6 rounded-lg ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
                  >
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input
                          id="first-name"
                          defaultValue="John"
                          className={
                            theme === "dark"
                              ? "bg-black border-gray-800 focus:border-gray-700"
                              : "bg-white border-gray-300 focus:border-gray-400"
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input
                          id="last-name"
                          defaultValue="Doe"
                          className={
                            theme === "dark"
                              ? "bg-black border-gray-800 focus:border-gray-700"
                              : "bg-white border-gray-300 focus:border-gray-400"
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue="john.doe@example.com"
                          className={
                            theme === "dark"
                              ? "bg-black border-gray-800 focus:border-gray-700"
                              : "bg-white border-gray-300 focus:border-gray-400"
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          defaultValue="johndoe"
                          className={
                            theme === "dark"
                              ? "bg-black border-gray-800 focus:border-gray-700"
                              : "bg-white border-gray-300 focus:border-gray-400"
                          }
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={`p-6 rounded-lg ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
                  >
                    <h3 className="text-lg font-medium mb-4">Profile</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          rows={4}
                          className={`w-full rounded-md p-2 ${
                            theme === "dark"
                              ? "bg-black border border-gray-800 focus:border-gray-700"
                              : "bg-white border border-gray-300 focus:border-gray-400"
                          }`}
                          defaultValue="Creator and innovator passionate about technology and design."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://example.com"
                          className={
                            theme === "dark"
                              ? "bg-black border-gray-800 focus:border-gray-700"
                              : "bg-white border-gray-300 focus:border-gray-400"
                          }
                        />
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex justify-end">
                    <Button
                      className={
                        theme === "dark"
                          ? "bg-white text-black hover:bg-gray-200"
                          : "bg-black text-white hover:bg-gray-800"
                      }
                    >
                      Save Changes
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6 space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-6 rounded-lg ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
                  >
                    <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Email Notifications",
                          description: "Receive email updates about your account activity",
                        },
                        { title: "Campaign Updates", description: "Get notified when campaigns you back post updates" },
                        { title: "New Followers", description: "Receive notifications when someone follows you" },
                        { title: "Marketing Communications", description: "Receive promotional emails and offers" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className={theme === "dark" ? "text-gray-400 text-sm" : "text-gray-600 text-sm"}>
                              {item.description}
                            </p>
                          </div>
                          <Switch defaultChecked={i < 2} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
