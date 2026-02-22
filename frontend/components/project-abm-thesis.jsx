"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users,
  Map,
  TrendingUp,
  Building2,
  BarChart3,
  BookOpen,
  GraduationCap,
  Target,
  Layers,
  Network,
} from "lucide-react";

export function ABMThesisContent() {
  const locale = useLocale();
  const pt = useTranslations("AboutPage");

  return (
    <section className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <Button variant="ghost" asChild className="mb-8">
          <Link
            href={`/${locale}/about`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {pt("backToAbout")}
          </Link>
        </Button>

        {/* Hero */}
        <div className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-purple-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary">Master&apos;s Thesis</Badge>
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-600">
              <GraduationCap className="w-3 h-3 mr-1" />
              Grade: 8/8
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Building an Agent-Based Model to Explain Gentrification in European
            Cities
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            This thesis develops a computational Agent-Based Model (ABM) to
            simulate and explain the socio-spatial dynamics of gentrification
            across European cities. By modeling individual household decisions,
            landlord strategies, and neighborhood evolution, the model reveals
            emergent patterns that match observed gentrification trajectories.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Institution:</strong> Bocconi University, M.Sc. Data Science
            & Business Analytics (2023-2025)
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              "Agent-Based Modeling",
              "Python",
              "Mesa",
              "Geospatial",
              "Econometrics",
              "Urban Economics",
            ].map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Research Question & Approach */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Research Question
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Can an Agent-Based Model, grounded in heterogeneous agent
                behaviors and spatial interactions, replicate and explain
                observed gentrification patterns in European cities? And what are
                the key mechanisms driving neighborhood-level socioeconomic
                change?
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Methodology
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built using the Mesa framework in Python, the model simulates
                thousands of heterogeneous agents (households, landlords,
                businesses) interacting on a spatial grid derived from real urban
                data. Calibrated against empirical datasets from multiple
                European cities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Model Architecture */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Model Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Users,
                title: "Household Agents",
                description:
                  "Heterogeneous agents with income levels, housing preferences, and mobility decisions. They evaluate neighborhoods based on amenities, affordability, and social composition.",
              },
              {
                icon: Building2,
                title: "Landlord Agents",
                description:
                  "Property owners adjusting rents based on local demand, neighborhood desirability, and investment strategies. Their decisions directly drive displacement dynamics.",
              },
              {
                icon: Map,
                title: "Spatial Environment",
                description:
                  "Grid-based city representation calibrated from real GIS data with neighborhood characteristics, transit accessibility, and proximity to amenities.",
              },
            ].map((agent) => (
              <Card key={agent.title} className="border-border">
                <CardContent className="p-6 md:p-8">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                    <agent.icon className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm">{agent.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Mechanisms */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Mechanisms</h2>
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-5">
                {[
                  {
                    icon: TrendingUp,
                    title: "Rent Gap Theory",
                    description:
                      "The model operationalizes Neil Smith's rent gap theory, tracking the difference between current land value and potential value under 'higher use', triggering investment when the gap widens.",
                  },
                  {
                    icon: Layers,
                    title: "Neighborhood Tipping Points",
                    description:
                      "Emergent tipping behavior where a critical mass of higher-income residents triggers accelerating change in neighborhood composition, amenity attraction, and rent increases.",
                  },
                  {
                    icon: BarChart3,
                    title: "Displacement Cascades",
                    description:
                      "Lower-income households displaced from gentrifying areas relocate to adjacent neighborhoods, potentially initiating new waves of change — a spatial cascade effect observed in real cities.",
                  },
                ].map((mechanism) => (
                  <div key={mechanism.title} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <mechanism.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{mechanism.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {mechanism.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Findings</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { value: "8/8", label: "Thesis Grade" },
              { value: "5+", label: "Cities Modeled" },
              { value: "1000s", label: "Agents Simulated" },
              { value: "Mesa", label: "ABM Framework" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-5 md:p-6 text-center">
                  <p className="text-xl md:text-2xl font-bold text-primary mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-3">
                {[
                  "The ABM successfully reproduces spatial clustering patterns observed in empirical gentrification data across European cities.",
                  "Neighborhood tipping points emerge naturally from individual agent interactions, without being explicitly programmed.",
                  "The rent gap mechanism is the strongest predictor of where gentrification initiates, while amenity proximity determines its speed.",
                  "Displacement cascades create predictable spatial patterns that can inform urban planning policy interventions.",
                  "Sensitivity analysis reveals that income inequality and housing supply elasticity are the most impactful macro-level parameters.",
                ].map((finding, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-primary font-bold text-sm mt-0.5">
                      {i + 1}.
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {finding}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Stack */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Technical Stack</h2>
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: BookOpen,
                    title: "Simulation",
                    items: [
                      "Python + Mesa ABM framework",
                      "NumPy/Pandas for data processing",
                      "Spatial grid with real GIS calibration",
                    ],
                  },
                  {
                    icon: BarChart3,
                    title: "Analysis",
                    items: [
                      "Spatial econometrics validation",
                      "Monte Carlo sensitivity analysis",
                      "Matplotlib/Seaborn visualization",
                    ],
                  },
                  {
                    icon: Map,
                    title: "Geospatial",
                    items: [
                      "GeoPandas for spatial data",
                      "OpenStreetMap amenity data",
                      "Real census tract boundaries",
                    ],
                  },
                  {
                    icon: Layers,
                    title: "Data Sources",
                    items: [
                      "Eurostat urban audit data",
                      "National housing price indices",
                      "Census demographic data",
                    ],
                  },
                ].map((stack) => (
                  <div key={stack.title}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <stack.icon className="w-4 h-4 text-primary" />
                      {stack.title}
                    </h3>
                    <ul className="space-y-1">
                      {stack.items.map((item) => (
                        <li
                          key={item}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary mt-1">&#x2022;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
