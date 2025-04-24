import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="h-16 border-b border-gray-800 flex items-center px-6">
        <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </header>

      <div className="container py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About FundWave</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Empowering creators and innovators to bring their ideas to life through community support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-300 mb-4">
                FundWave exists to democratize funding for creative and innovative projects. We believe that great ideas
                can come from anywhere, and everyone deserves the opportunity to bring their vision to life.
              </p>
              <p className="text-gray-300">
                By connecting creators directly with backers who believe in their projects, we're building a community
                where innovation thrives and creative visions become reality.
              </p>
            </div>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <img
                src="/placeholder.svg?height=300&width=500&text=Our+Mission"
                alt="Our Mission"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          <Separator className="bg-gray-800 my-16" />

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  number: "01",
                  title: "Create",
                  description:
                    "Creators build their campaign page, set funding goals, and share their vision with the world.",
                },
                {
                  number: "02",
                  title: "Fund",
                  description: "Backers discover projects they love and support them with financial contributions.",
                },
                {
                  number: "03",
                  title: "Create",
                  description:
                    "Successful projects receive their funding and creators bring their ideas to life, keeping backers updated on progress.",
                },
              ].map((step, index) => (
                <div key={index} className="bg-gray-900 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-800 my-16" />

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  name: "Alex Johnson",
                  role: "Founder & CEO",
                  image: "/placeholder.svg?height=200&width=200&text=AJ",
                },
                {
                  name: "Sarah Chen",
                  role: "Chief Technology Officer",
                  image: "/placeholder.svg?height=200&width=200&text=SC",
                },
                {
                  name: "Marcus Williams",
                  role: "Head of Community",
                  image: "/placeholder.svg?height=200&width=200&text=MW",
                },
                {
                  name: "Priya Patel",
                  role: "Creative Director",
                  image: "/placeholder.svg?height=200&width=200&text=PP",
                },
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div
                    className="aspect-square bg-gray-900 rounded-full overflow-hidden mb-4 mx-auto"
                    style={{ maxWidth: "150px" }}
                  >
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-gray-400 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to bring your idea to life?</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Join thousands of creators who have successfully funded their projects on FundWave.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild className="bg-white text-black hover:bg-gray-200">
                <Link href="/start-campaign">Start a Campaign</Link>
              </Button>
              <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-900">
                <Link href="/browse-projects">Browse Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
