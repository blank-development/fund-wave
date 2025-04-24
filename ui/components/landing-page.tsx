"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Text3D } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import * as THREE from "three";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

// Piggy Bank component representing savings and funding
function PiggyBank(props: any) {
  return (
    <group {...props}>
      {/* Main body - using sphereGeometry instead of ellipsoidGeometry */}
      <mesh castShadow scale={[1, 0.8, 1.2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Snout */}
      <mesh position={[0, -0.2, 1]} castShadow>
        <cylinderGeometry
          args={[0.3, 0.4, 0.6, 32]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Nostrils */}
      <mesh position={[0.15, -0.3, 1.3]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000000" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[-0.15, -0.3, 1.3]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000000" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Ears */}
      <mesh
        position={[0.6, 0.5, 0.2]}
        rotation={[0, 0, Math.PI / 4]}
        castShadow
      >
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh
        position={[-0.6, 0.5, 0.2]}
        rotation={[0, 0, -Math.PI / 4]}
        castShadow
      >
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Legs */}
      {[
        [0.5, -0.7, 0.5],
        [-0.5, -0.7, 0.5],
        [0.5, -0.7, -0.5],
        [-0.5, -0.7, -0.5],
      ].map((position, i) => (
        <mesh
          key={i}
          position={position as [number, number, number]}
          castShadow
        >
          <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Coin slot */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#000000" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Tail (curved) */}
      <group position={[0, 0, -1.2]} rotation={[0, Math.PI / 4, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[0, Math.sin(i * 0.8) * 0.2, i * 0.1]}
            castShadow
          >
            <sphereGeometry args={[0.1 - i * 0.015, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Lightbulb component representing ideas and innovation
function Lightbulb(props: any) {
  return (
    <group {...props}>
      {/* Bulb */}
      <mesh castShadow>
        <sphereGeometry
          args={[0.8, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65]}
        />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Filament */}
      <mesh position={[0, -0.2, 0]}>
        <torusGeometry args={[0.2, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Base */}
      <mesh position={[0, -0.8, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.5, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Screw base */}
      <mesh position={[0, -1.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.8} />
      </mesh>
    </group>
  );
}

// Rocket component representing project launches and growth
function Rocket(props: any) {
  return (
    <group {...props}>
      {/* Rocket body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 2, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Rocket nose */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[0.3, 0.8, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Fins */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[0, -0.8, 0]}
          rotation={[0, (i * Math.PI) / 2, 0]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.6, 0.8]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}

      {/* Rocket window */}
      <mesh position={[0, 0.5, 0.31]} castShadow>
        <cylinderGeometry
          args={[0.15, 0.15, 0.05, 32]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Rocket exhaust glow */}
      <mesh position={[0, -1.2, 0]}>
        <coneGeometry args={[0.3, 0.5, 32]} rotation={[Math.PI, 0, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// Globe component representing global reach
function Globe(props: any) {
  return (
    <group {...props}>
      {/* Earth sphere */}
      <mesh castShadow>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Longitude lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`long-${i}`} rotation={[0, (i * Math.PI) / 6, 0]}>
          <torusGeometry args={[1.21, 0.01, 16, 64]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}

      {/* Latitude lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`lat-${i}`} rotation={[(i * Math.PI) / 5, 0, 0]}>
          <torusGeometry args={[1.21, 0.01, 16, 64]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}
    </group>
  );
}

// Custom 3D component representing funding/growth concept
function FundingModel(props: any) {
  return (
    <group {...props}>
      {/* Central coin/token */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2, 0.2, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Growth bars */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * 0.7 - 1.05, -1.5 + i * 0.4, 0]} castShadow>
          <boxGeometry args={[0.4, 0.8 + i * 0.3, 0.4]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Orbiting spheres representing community/backers */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * Math.PI * 0.4) * 3.5,
            Math.cos(i * Math.PI * 0.4) * 3.5,
            0,
          ]}
          castShadow
        >
          <sphereGeometry args={[0.3 + Math.random() * 0.2, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      ))}

      {/* Connection lines */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = Math.sin(i * Math.PI * 0.4) * 3.5;
        const y = Math.cos(i * Math.PI * 0.4) * 3.5;

        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(x * 0.8, y * 0.8, 0));
        points.push(new THREE.Vector3(x, y, 0));

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <primitive
            key={`line-${i}`}
            object={
              new THREE.Line(
                lineGeometry,
                new THREE.LineBasicMaterial({ color: "#ffffff" })
              )
            }
          />
        );
      })}
    </group>
  );
}

// Scene component that combines all 3D elements
function CrowdfundingScene() {
  return (
    <>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <FundingModel rotation={[0.1, 0, 0]} />
      </Float>

      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
        <Lightbulb position={[-4, 3, 1]} scale={1.2} rotation={[0, 0, -0.3]} />
      </Float>

      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.7}>
        <Rocket position={[4, 2, 2]} scale={0.8} rotation={[0.2, 0.5, 0.3]} />
      </Float>

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <Globe position={[0, -4, -2]} scale={0.6} />
      </Float>

      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.4}>
        <PiggyBank position={[-3, -2, 3]} scale={0.9} rotation={[0, 0.8, 0]} />
      </Float>
    </>
  );
}

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const position = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Navigation */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          hasScrolled ? "bg-black/80 backdrop-blur-md py-3" : "py-5"
        )}
      >
        <div className="container flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter">
            FUND<span className="text-gray-400">WAVE</span>
          </Link>

          {!isMobile ? (
            <nav className="flex items-center space-x-8">
              <Link
                href="#"
                className="text-sm font-medium hover:text-gray-300 transition-colors"
              >
                Discover
              </Link>
              <Link
                href="#"
                className="text-sm font-medium hover:text-gray-300 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#"
                className="text-sm font-medium hover:text-gray-300 transition-colors"
              >
                About
              </Link>
              <div className="flex items-center space-x-4">
                <Button
                  asChild
                  variant="outline"
                  className="border-white bg-black hover:bg-black hover:text-white"
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-white text-black hover:bg-white hover:text-black"
                >
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            </nav>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              className="text-white"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black p-6 transition-transform duration-300 ease-in-out",
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(false)}
              className="text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col items-center justify-center h-full space-y-8">
            <Link
              href="#"
              className="text-2xl font-medium hover:text-gray-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Discover
            </Link>
            <Link
              href="#"
              className="text-2xl font-medium hover:text-gray-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#"
              className="text-2xl font-medium hover:text-gray-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex flex-col space-y-4 w-full max-w-xs">
              <Button
                asChild
                variant="outline"
                className="w-full border-white bg-black hover:bg-black hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="w-full bg-white text-black hover:bg-white hover:text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Hero Section with 3D */}
      <section ref={ref} className="relative h-screen">
        <motion.div
          className="absolute inset-0 z-10"
          style={{ opacity, scale }}
        >
          <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
            <color attach="background" args={["#000000"]} />
            <fog attach="fog" args={["#000000", 5, 25]} />
            <ambientLight intensity={0.5} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              color="#ffffff"
              intensity={1}
            />
            <directionalLight
              position={[-5, 5, 5]}
              intensity={0.5}
              color="#ffffff"
            />

            <CrowdfundingScene />

            <Environment preset="studio" />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        </motion.div>

        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            className="container text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
              Fund Your Vision.
              <br />
              Change The World.
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Join the next generation of creators, innovators, and changemakers
              on the most elegant crowdfunding platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-black hover:bg-white px-8"
              >
                <Link href="/register">Start a Campaign</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-black hover:bg-black hover:text-white px-8"
              >
                <Link href="/browse-projects">Browse Projects</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            className="flex flex-col items-center"
          >
            <p className="text-sm text-gray-400 mb-2">Scroll to explore</p>
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <motion.div
                className="w-1 h-2 bg-white rounded-full mt-2"
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <motion.section
        className="py-24 bg-white text-black"
        style={{ y: position }}
      >
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
              How It Works
            </h2>
            <p className="text-gray-600 mb-12">
              Our platform makes it easy to bring your ideas to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center pl-8">
            {[
              {
                number: "01",
                title: "Create Your Campaign",
                description:
                  "Set up your project with our intuitive campaign builder. Add details, funding goals, and rewards.",
              },
              {
                number: "02",
                title: "Share With The World",
                description:
                  "Leverage our platform's reach and your network to get your campaign in front of potential backers.",
              },
              {
                number: "03",
                title: "Get Funded",
                description:
                  "Watch your campaign grow as backers support your vision. Receive funds and bring your idea to life.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="relative p-8 border border-gray-200 rounded-lg"
              >
                <span className="absolute -top-5 -left-5 bg-black text-white text-xl font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  {step.number}
                </span>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button
              asChild
              size="lg"
              className="bg-black text-white hover:bg-gray-800 px-8"
            >
              <Link href="/register">Start Your Project</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="py-24 bg-black text-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
                  Join Our Community of Innovators
                </h2>
                <p className="text-gray-400 mb-8">
                  Connect with like-minded creators, get feedback on your ideas,
                  and find collaborators for your next big project.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="border-white bg-black"
                >
                  <Link href="/register">Join Now</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-900 rounded-lg overflow-hidden"
                  >
                    <img
                      src={`/placeholder-${i}.png?height=300&width=300&text=Project ${i}`}
                      alt={`Project ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-black border-t border-gray-800">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="text-xl font-bold tracking-tighter">
                FUND<span className="text-gray-400">WAVE</span>
              </Link>
              <p className="mt-4 text-gray-400 text-sm">
                The modern platform for creators and innovators to bring their
                ideas to life.
              </p>
            </div>

            {[
              {
                title: "Platform",
                links: [
                  "How it Works",
                  "Pricing",
                  "Success Stories",
                  "For Creators",
                ],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Contact"],
              },
              {
                title: "Resources",
                links: [
                  "Blog",
                  "Help Center",
                  "Guidelines",
                  "Terms of Service",
                ],
              },
            ].map((column, index) => (
              <div key={index}>
                <h3 className="font-medium mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href="#"
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} FundWave. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {["Twitter", "Instagram", "LinkedIn", "YouTube"].map(
                (social, i) => (
                  <Link
                    key={i}
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {social}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
