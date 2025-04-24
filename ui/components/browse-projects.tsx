"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const categories = [
  "Technology",
  "Art",
  "Music",
  "Film",
  "Games",
  "Publishing",
  "Food",
  "Fashion",
  "Sports",
  "Other",
];

export default function BrowseProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const { address } = useAccount();

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (selectedCategory) params.append("category", selectedCategory);
        if (sortBy) params.append("sort", sortBy);

        const response = await fetch(`/api/projects`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch projects"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [search, selectedCategory, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be triggered by the useEffect
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="h-16 border-b border-gray-800 flex items-center px-6">
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          {address && (
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="bg-white text-black hover:bg-white hover:text-black"
              >
                Dashboard
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="container py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Discover Projects
          </h1>
          <p className="text-white max-w-2xl">
            Explore innovative projects from creators around the world and
            support the ideas you believe in.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Mobile Toggle */}
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              className="w-full border-gray-700 flex items-center justify-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              Show Filters
            </Button>
          </div>

          {/* Filters Sidebar */}
          <div className={cn("w-full md:w-64 space-y-6")}>
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium mb-4 text-black">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategory === category}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm text-black cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium mb-4 text-black">Sort By</h3>
              <div className="space-y-2">
                {[
                  { id: "newest", label: "Newest" },
                  { id: "oldest", label: "Oldest" },
                  { id: "mostFunded", label: "Most Funded" },
                  { id: "endingSoon", label: "Ending Soon" },
                ].map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={option.id}
                      name="sort"
                      checked={sortBy === option.id}
                      onChange={() => handleSortChange(option.id)}
                      className="text-white bg-black border-gray-700"
                    />
                    <label
                      htmlFor={option.id}
                      className="text-sm text-black cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white text-black border-gray-800 focus:border-gray-700"
              />
            </div>

            {/* Results Count */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white">{projects.length}</span>{" "}
                projects
              </p>
              <Link href="/start-campaign">
                <Button className="bg-white text-black hover:bg-gray-200">
                  Start a Campaign
                </Button>
              </Link>
            </div>
            {console.log(projects)}
            {/* Projects Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-lg overflow-hidden"
                  >
                    <div className="aspect-video bg-black animate-pulse h-52 w-full" />
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-black animate-pulse" />
                        <div className="h-4 w-24 bg-black animate-pulse rounded" />
                      </div>
                      <div className="h-6 w-3/4 bg-black animate-pulse rounded" />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 w-20 bg-black animate-pulse rounded" />
                          <div className="h-4 w-12 bg-black animate-pulse rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/campaign/${project.id}`}
                    className="block"
                  >
                    <Card className="bg-white border-gray-800 hover:border-gray-700 transition-colors">
                      <CardHeader className="p-0">
                        <div className="aspect-video relative">
                          <img
                            src={project.imageUrl || "/placeholder.svg"}
                            alt={project.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                project.creator.avatarUrl || "/placeholder.svg"
                              }
                              alt={project.creator.walletAddress}
                            />
                          </Avatar>
                          <span className="text-sm text-black">
                            By{" "}
                            {project.creator.firstName +
                              " " +
                              project.creator.lastName}
                          </span>
                        </div>
                        <CardTitle className="text-xl mb-2 text-black">
                          {project.title}
                        </CardTitle>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-black">
                              ${project.raised.toLocaleString()} raised
                            </span>
                            <span className="text-black">
                              {Math.round(
                                (project.raised / project.goal) * 100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={(project.raised / project.goal) * 100}
                            className="h-2"
                          />
                          <div className="flex justify-between text-sm">
                            <span className="text-black">
                              {project.backers} backers
                            </span>
                            <span className="text-black">
                              {Math.round(project.daysLeft / 86400)} days left
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <h3 className="text-xl font-medium mb-2">No projects found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <Button
                  variant="outline"
                  className="border-gray-700"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setSortBy("newest");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
