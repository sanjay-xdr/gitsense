"use client"

import { useEffect, useRef, useState } from "react"
import Globe from "react-globe.gl"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

// Types for our data
interface Contributor {
  country: string
  countryCode: string
  coordinates: [number, number]
  contributions: number
  color: string
}

interface Arc {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
  contributions: number
}

export function GlobeVisualization() {
  const globeRef = useRef<any>({})
  const [countries, setCountries] = useState<any[]>([])
  const [arcs, setArcs] = useState<Arc[]>([])
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [stats, setStats] = useState({
    totalContributions: 0,
    totalCountries: 0,
    topCountry: "",
    topContributions: 0,
  })
  const USA_COORDINATES: [number, number] = [37.0902, -95.7129]
  const SAMPLE_CONTRIBUTORS: Contributor[] = [
    {
      country: "United Kingdom",
      countryCode: "GB",
      coordinates: [55.3781, -3.436],
      contributions: 1245,
      color: "#FF5733",
    },
    { country: "Germany", countryCode: "DE", coordinates: [51.1657, 10.4515], contributions: 982, color: "#33FF57" },
    { country: "India", countryCode: "IN", coordinates: [20.5937, 78.9629], contributions: 1567, color: "#3357FF" },
    { country: "Japan", countryCode: "JP", coordinates: [36.2048, 138.2529], contributions: 723, color: "#F033FF" },
    { country: "Brazil", countryCode: "BR", coordinates: [-14.235, -51.9253], contributions: 645, color: "#FF33A8" },
    {
      country: "Australia",
      countryCode: "AU",
      coordinates: [-25.2744, 133.7751],
      contributions: 512,
      color: "#33FFF6",
    },
    { country: "Canada", countryCode: "CA", coordinates: [56.1304, -106.3468], contributions: 890, color: "#FFD133" },
    { country: "France", countryCode: "FR", coordinates: [46.2276, 2.2137], contributions: 678, color: "#8C33FF" },
    { country: "China", countryCode: "CN", coordinates: [35.8617, 104.1954], contributions: 1432, color: "#FF3333" },
    {
      country: "South Africa",
      countryCode: "ZA",
      coordinates: [-30.5595, 22.9375],
      contributions: 321,
      color: "#33FFBD",
    },
  ]

  useEffect(() => {
    // Load country data
    fetch("/countries.geojson")
      .catch(() => {
        // If fetch fails (e.g., in development), use a sample dataset
        console.log("Using sample country data")
        return { json: () => Promise.resolve({ features: [] }) }
      })
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.features)
      })

    // Set contributors
    setContributors(SAMPLE_CONTRIBUTORS)

    // Calculate statistics
    const totalContributions = SAMPLE_CONTRIBUTORS.reduce((sum, c) => sum + c.contributions, 0)
    const topContributor = SAMPLE_CONTRIBUTORS.reduce(
      (max, c) => (c.contributions > max.contributions ? c : max),
      SAMPLE_CONTRIBUTORS[0],
    )

    setStats({
      totalContributions: totalContributions,
      totalCountries: SAMPLE_CONTRIBUTORS.length,
      topCountry: topContributor.country,
      topContributions: topContributor.contributions,
    })

    // Create arcs data (connections from each country to USA)
    const arcsData = SAMPLE_CONTRIBUTORS.map((contributor) => ({
      startLat: contributor.coordinates[0],
      startLng: contributor.coordinates[1],
      endLat: USA_COORDINATES[0],
      endLng: USA_COORDINATES[1],
      color: contributor.color,
      contributions: contributor.contributions,
    }))

    // Stagger the animation of arcs appearing
    setTimeout(() => {
      setArcs(arcsData)
    }, 1000)
  }, [])

  // Handle globe ready state
  useEffect(() => {
    if (globeRef.current) {
      // Set initial camera position
      globeRef.current.pointOfView({
        lat: 39.6,
        lng: -98.5,
        altitude: 2.5,
      })

    }
  }, [globeRef.current])

  return (
    <div className="relative w-full">
      <div className="h-[500px] md:h-[600px] w-full">
        {typeof window !== "undefined" && (
          <Globe
            ref={globeRef}
                globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
            hexPolygonsData={countries}
            hexPolygonResolution={3}
            hexPolygonMargin={0.3}
            hexPolygonColor={() => "rgba(255, 255, 255, 0.1)"}
            arcsData={arcs}
            arcColor={"color"}
            arcDashLength={() => Math.random() * 0.8 + 0.1}
            arcDashGap={() => Math.random() * 1 + 0.5}
            arcDashAnimateTime={(d) => 3000 + ((d as Arc).contributions / 100) * 2000}
            arcStroke={0.5}
            arcCircularResolution={64}
            arcLabel={(d) => `${(d as Arc).contributions} contributions`}
            labelsData={contributors}
            labelLat={(d) => (d as Contributor).coordinates[0]}
            labelLng={(d) => (d as Contributor).coordinates[1]}
            labelText={(d) => (d as Contributor).country}
            labelSize={1.5}
            labelDotRadius={0.5}
            labelColor={(d) => (d as Contributor).color}
            labelResolution={2}
            labelAltitude={0.01}
            pointsData={[{ lat: USA_COORDINATES[0], lng: USA_COORDINATES[1], size: 0.1 }]}
            pointColor={() => "#ffff00"}
            pointAltitude={0.02}
            pointRadius={0.5}
            pointsMerge={true}
            width={800}
            height={600}
            backgroundColor="rgba(0,0,0,0)"
            animateIn={true}
          />
        )}
      </div>

      {/* Stats cards below the globe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">Total Contributions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalContributions.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">Contributing Countries</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalCountries}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">Top Contributing Country</p>
                <p className="text-3xl font-bold text-blue-600">{stats.topCountry}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">Repository Origin</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Badge className="bg-blue-600">USA</Badge>
                  <p className="text-xl font-bold">United States</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
