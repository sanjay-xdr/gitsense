"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlobeVisualization } from "@/components/globe-visualization"
import { motion } from "framer-motion"

export function PreviewSection() {
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering the globe (which uses browser APIs)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="container mx-auto px-4 py-20 relative z-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See Your Global Impact</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Visualize contributions to your repositories from around the world. Track global collaboration and see where
            your community is most active.
          </p>
        </div>

        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm shadow-xl p-4 md:p-8 overflow-hidden">
          <Tabs defaultValue="globe" className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="globe">Global Contributions</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="globe" className="mt-0">
              {mounted && <GlobeVisualization />}
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <div className="h-[500px] md:h-[600px] flex items-center justify-center">
                <div className="text-center max-w-lg">
                  <h3 className="text-2xl font-bold mb-4">Contribution Insights</h3>
                  <p className="text-slate-600 mb-6">
                    Dive deeper into contribution patterns, identify key contributors, and understand the global reach
                    of your projects.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-500">Time Zone Coverage</p>
                      <p className="text-2xl font-bold text-blue-600">24/7</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-500">Continent Reach</p>
                      <p className="text-2xl font-bold text-blue-600">6/7</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-500">Languages</p>
                      <p className="text-2xl font-bold text-blue-600">12+</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-500">Collaboration Score</p>
                      <p className="text-2xl font-bold text-blue-600">94%</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </section>
  )
}
