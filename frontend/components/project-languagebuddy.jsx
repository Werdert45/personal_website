"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bot,
  MessageSquare,
  Brain,
  Globe,
  Zap,
  Shield,
  BarChart3,
  BookOpen,
} from "lucide-react";

export function LanguageBuddyContent() {
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center mb-6">
            <Bot className="w-8 h-8 text-yellow-500" />
          </div>
          <Badge variant="secondary" className="mb-4">
            Personal Project
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            LanguageBuddy
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            An AI-powered language learning application that provides
            conversational practice with real-time grammar and vocabulary
            corrections. Built to make language learning more accessible and
            engaging through natural conversation with an intelligent chatbot.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["AI", "NLP", "React", "Python", "FastAPI", "OpenAI"].map(
              (tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              )
            )}
          </div>
        </div>

        {/* Problem & Solution */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                The Problem
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Traditional language learning apps focus on vocabulary drills and
                grammar exercises. They lack realistic conversational practice,
                which is the most critical skill for fluency. Finding a practice
                partner is often difficult and scheduling-dependent.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                The Solution
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                LanguageBuddy provides an always-available AI conversation
                partner that adapts to your level. It corrects grammar in
                real-time, suggests vocabulary, and gradually increases
                difficulty as you improve — all through natural conversation
                rather than drills.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Brain,
                title: "Adaptive Difficulty",
                description:
                  "The AI automatically adjusts conversation complexity based on your demonstrated skill level, ensuring optimal learning progression.",
              },
              {
                icon: Globe,
                title: "Multi-Language Support",
                description:
                  "Practice in multiple European languages including Dutch, Italian, German, French, and Spanish with native-quality conversation.",
              },
              {
                icon: Shield,
                title: "Real-Time Corrections",
                description:
                  "Grammar and vocabulary errors are gently corrected inline during conversation, with explanations of the rules behind each correction.",
              },
              {
                icon: BarChart3,
                title: "Progress Tracking",
                description:
                  "Track your improvement over time with vocabulary growth metrics, grammar accuracy trends, and conversation fluency scores.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-border">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Technical Architecture</h2>
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Frontend
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    React-based chat interface with real-time message streaming,
                    inline correction highlighting, and a responsive design that
                    works across desktop and mobile. Uses WebSocket connections
                    for low-latency conversation flow.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Backend
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Python FastAPI server handling conversation state management,
                    user progress tracking, and AI model orchestration. Integrates
                    with OpenAI&apos;s GPT models with custom system prompts
                    tailored for language instruction.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    AI Layer
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Custom prompt engineering for language teaching, including
                    structured correction output, difficulty assessment, and
                    conversation topic management. Uses few-shot learning for
                    consistent grammar explanation formatting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Outcomes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Outcomes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "5+", label: "Languages Supported" },
              { value: "Real-time", label: "Corrections" },
              { value: "Adaptive", label: "Difficulty System" },
              { value: "WebSocket", label: "Streaming Chat" },
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
        </div>
      </div>
    </section>
  );
}
