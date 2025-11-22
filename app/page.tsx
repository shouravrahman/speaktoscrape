"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Shield,
  Database,
  Search,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  Play,
  Sparkles,
  Award,
  Rocket,
  MessageSquare,
  BrainCircuit,
  Terminal,
  TrendingUp,
  BarChart3,
  Users,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { PRICING_TIERS } from "@/lib/constants/pricing";

// Reusable utility styles
const utilityStyles = {
  glassCard:
    "backdrop-blur-xl bg-background/60 border border-border/50 shadow-2xl shadow-black/5",
  gradientBorder:
    "relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-r before:from-border/30 before:via-primary/20 before:to-border/30 before:rounded-lg before:content-[''] before:-z-10",
  floatingAnimation:
    "animate-pulse hover:animate-none hover:-translate-y-1 transition-all duration-3000",
  textGradient:
    "bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent",
  premiumButton:
    "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/0 before:via-primary/10 before:to-primary/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000",
  sectionSpacing: "py-24 px-4 sm:px-6 lg:px-8",
  containerWidth: "max-w-7xl mx-auto",
  cardHover:
    "hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 transition-all duration-500 group",
};

const howItWorksSteps = [
  {
    icon: MessageSquare,
    title: "Just Ask",
    description:
      "Forget CSS selectors and complex code. Simply tell our agent what you need in plain English.",
    example: `"Extract all product names and prices from this page"`,
    result: "From prompt to data in seconds",
  },
  {
    icon: BrainCircuit,
    title: "AI Gets to Work",
    description:
      "Our agent navigates websites, handles complex structures, and extracts the precise data you requested.",
    example: "Handles pagination and JavaScript rendering.",
    result: "Works on most websites",
  },
  {
    icon: Database,
    title: "Data, Delivered",
    description:
      "Receive clean, structured JSON data ready for your applications, and search your scraped content.",
    example: "Instantly searchable data.",
    result: "Focus on insights, not cleaning",
  },
];

const premiumFeatures = [
  {
    icon: TrendingUp,
    title: "Natural Language Interface",
    description:
      "Empower your entire team to gather data. Our natural language interface makes web scraping accessible to everyone.",
    metrics: "No code required",
    benefit: "Democratize data collection",
  },
  {
    icon: Shield,
    title: "Reliable Scraping",
    description:
      "Websites change, but our AI adapts. Stop wasting time on maintenance and enjoy a continuous flow of data.",
    metrics: "Handles complex sites",
    benefit: "Focus on data, not scrapers",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Data Extraction",
    description:
      "Our agent understands website structures and extracts the precise data you need, even from complex pages.",
    metrics: "Structured JSON output",
    benefit: "Clean data, ready to use",
  },
  {
    icon: Search,
    title: "Search Your Scraped Data",
    description:
      "Go beyond simple data extraction. Ask questions and get insights from your scraped data with our integrated semantic search.",
    metrics: "Sub-second search",
    benefit: "Turn data into decisions",
  },
  {
    icon: Rocket,
    title: "Built for Scale",
    description:
      "Leveraging powerful scraping infrastructure to handle your data needs, big or small.",
    metrics: "Handles large websites",
    benefit: "Handle large websites",
  },
  {
    icon: Layers,
    title: "Zero Learning Curve",
    description:
      "If you can describe what you want, you can use our platform. No Python, no selectors, no debugging.",
    metrics: "5-minute onboarding",
    benefit: "Empower your entire team",
  },
];

export default function PremiumLandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent)] pointer-events-none" />

      {/* Mouse follower effect */}
      <div
        className="fixed w-96 h-96 pointer-events-none opacity-20 dark:opacity-10 transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 ${utilityStyles.glassCard} border-b`}
      >
        <div className={utilityStyles.containerWidth}>
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-3 rounded-xl shadow-lg">
                <Bot className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                SpeakToScrape
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-all duration-300 font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-all duration-300 font-medium"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-all duration-300 font-medium"
              >
                Pricing
              </a>
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  className={`${utilityStyles.premiumButton} font-medium shadow-lg`}
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className={`pt-32 pb-20 ${utilityStyles.sectionSpacing.replace(
          "py-24",
          ""
        )}`}
      >
        <div className={utilityStyles.containerWidth}>
          <div className="text-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <Badge
                className="mb-8 px-6 py-2 text-base font-medium"
                variant="outline"
              >
                <Sparkles className="w-5 h-5 mr-3 text-primary animate-pulse" />
                Powered by Generative AI
              </Badge>

              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[0.9] tracking-tight">
                The Web, Your Database.
                <br />
                <span className={`${utilityStyles.textGradient} relative`}>
                  Just Ask.
                </span>
              </h1>

              <h2 className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-5xl mx-auto leading-relaxed font-light">
                Describe what data you need in plain English. Get structured
                JSON back. No coding required.
              </h2>

              {/* Impact Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    Natural Language
                  </div>
                  <div className="text-lg font-semibold mb-1">Just Ask</div>
                  <div className="text-sm text-muted-foreground">
                    No code, no selectors.
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    AI-Powered
                  </div>
                  <div className="text-lg font-semibold mb-1">
                    Adapts to Websites
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Handles complex sites.
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    Structured Data
                  </div>
                  <div className="text-lg font-semibold mb-1">Ready to Use</div>
                  <div className="text-sm text-muted-foreground">
                    Clean JSON output.
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    Searchable
                  </div>
                  <div className="text-lg font-semibold mb-1">
                    Find Insights
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ask questions of your data.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link href="/login">
                  <Button
                    size="lg"
                    className={`${utilityStyles.premiumButton} text-xl px-12 py-6 h-auto font-semibold shadow-2xl`}
                  >
                    <Rocket className="w-6 h-6 mr-3" />
                    Start Free Trial
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-12 py-6 h-auto font-semibold"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Watch 2min Demo
                </Button>
              </div>

              <div className="flex items-center justify-center gap-12 text-muted-foreground">
                <div className="flex items-center gap-3 group cursor-default">
                  <CheckCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Start for free</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <CheckCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <CheckCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={utilityStyles.sectionSpacing}>
        <div className={utilityStyles.containerWidth}>
          <div className="text-center mb-20">
            <Badge
              className="mb-6 px-6 py-2 text-base font-medium"
              variant="outline"
            >
              <BrainCircuit className="w-5 h-5 mr-3 text-primary" />
              Your Data, On Demand
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              Go from a simple question to structured data in seconds.
              <br />
              <span className={utilityStyles.textGradient}>
                Our AI handles the entire process, so you can focus on what
                matters.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Our AI handles the technical complexity so you can focus on using
              the data.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Connection lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px">
              <div className="flex items-center justify-between px-32">
                <ArrowRight className="text-primary/40 w-8 h-8 animate-pulse" />
                <ArrowRight
                  className="text-primary/40 w-8 h-8 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
            </div>

            {howItWorksSteps.map((step, index) => (
              <div
                key={index}
                className={`text-center z-10 ${utilityStyles.cardHover}`}
              >
                <Card
                  className={`${utilityStyles.glassCard} p-8 border-2 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <CardContent className="relative z-10 space-y-6">
                    <div className="inline-block bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-2xl shadow-xl">
                      <step.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                    <div className="bg-secondary/50 p-4 rounded-xl border">
                      <code className="text-sm text-primary font-mono">
                        {step.example}
                      </code>
                    </div>
                    <div className="text-primary font-semibold text-lg">
                      ✨ {step.result}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className={`${utilityStyles.sectionSpacing} bg-secondary/30 relative`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
        <div className={`${utilityStyles.containerWidth} relative z-10`}>
          <div className="text-center mb-20">
            <Badge
              className="mb-6 px-6 py-2 text-base font-medium"
              variant="outline"
            >
              <Award className="w-5 h-5 mr-3 text-primary" />
              Never Write a Scraper Again
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              We've solved the hardest parts of web scraping,
              <span className={utilityStyles.textGradient}>
                {" "}
                so you don't have to.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              We handle the complex parts of web scraping so you don't have to.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {premiumFeatures.map((feature, index) => (
              <Card
                key={index}
                className={`${utilityStyles.glassCard} ${utilityStyles.cardHover} p-8 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
                <CardContent className="relative z-10 space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="px-3 py-1">
                          {feature.metrics}
                        </Badge>
                        <div className="text-primary font-semibold flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          {feature.benefit}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Before vs After Section */}
      <section className={utilityStyles.sectionSpacing}>
        <div className={utilityStyles.containerWidth}>
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              The End of Tedious Scraping
              <span className={utilityStyles.textGradient}>
                {" "}
                Leave the old way behind. Embrace the future of data extraction.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Stop wrestling with code. Start commanding intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Card className="bg-muted/30 border-dashed border-2 p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
              <CardContent className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Terminal className="w-6 h-6 text-muted-foreground" />
                  <CardTitle className="text-2xl text-muted-foreground">
                    The Old Way (ChatGPT + Manual Work)
                  </CardTitle>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-lg">
                      Copy and paste data from websites into ChatGPT.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-lg">
                      Write complex prompts to structure the data.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-lg">
                      Manually clean and format the JSON output.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-lg">
                      Repeat the process for every new piece of data.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-lg">
                      No way to search or ask questions of your data.
                    </span>
                  </div>
                </div>
                <div className="text-center pt-6">
                  <span className="text-2xl font-bold text-red-500">
                    Hours of Tedious Work
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`${utilityStyles.glassCard} border-primary border-2 p-10 relative overflow-hidden shadow-2xl shadow-primary/20`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
              <CardContent className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  <CardTitle className="text-2xl text-primary">
                    The SpeakToScrape Way
                  </CardTitle>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg font-medium">
                      Just ask for the data you need.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg font-medium">
                      Our AI agent scrapes and structures the data for you.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg font-medium">
                      Your data is automatically vectorized and stored.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg font-medium">
                      Ask questions and get insights from your data instantly.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg font-medium">
                      One agent handles any website, any task.
                    </span>
                  </div>
                </div>
                <div className="text-center pt-6">
                  <span className="text-2xl font-bold text-primary">
                    Seconds to Insights
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className={utilityStyles.sectionSpacing}>
        <div className={utilityStyles.containerWidth}>
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              Unlock Social Media Data
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Our advanced scraping capabilities can even handle complex sites
              like LinkedIn and Facebook.
              <span className="text-amber-500">
                This is a powerful feature for advanced users, and we recommend
                using it responsibly.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Card className={`${utilityStyles.glassCard} p-8`}>
              <h3 className="text-2xl font-bold mb-4">
                Bring Your Own Cookies
              </h3>
              <p className="text-muted-foreground mb-4">
                Securely use your own session cookies to access data behind a
                login. We never store your credentials.
              </p>
              <Button variant="outline">Learn More</Button>
            </Card>
            <Card className={`${utilityStyles.glassCard} p-8`}>
              <h3 className="text-2xl font-bold mb-4">Residential Proxies</h3>
              <p className="text-muted-foreground mb-4">
                For the most demanding scraping tasks, our Bright Data
                integration can leverage residential proxies to avoid blocks.
              </p>
              <Button variant="outline">Learn More</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={utilityStyles.sectionSpacing}>
        <div className={utilityStyles.containerWidth}>
          <div className="text-center mb-20">
            <Badge
              className="mb-6 px-6 py-2 text-base font-medium"
              variant="outline"
            >
              <BarChart3 className="w-5 h-5 mr-3 text-primary" />
              Transparent Pricing
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              Choose Your
              <span className={utilityStyles.textGradient}> Success Level</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Start free, upgrade when you need more. Simple, transparent
              pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {PRICING_TIERS.map((plan, index) => (
              <Card
                key={index}
                className={`${utilityStyles.cardHover} relative ${
                  plan.popular
                    ? `${utilityStyles.glassCard} border-primary border-2 scale-105 shadow-2xl shadow-primary/20`
                    : utilityStyles.glassCard
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-6 py-2 text-base font-semibold bg-gradient-to-r from-primary to-primary/80">
                      <Award className="w-4 h-4 mr-2" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
                <CardContent className="relative z-10 p-10 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      {plan.interval && (
                        <span className="text-muted-foreground text-xl">
                          /{plan.interval}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-lg">
                      {plan.description}
                    </p>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                    <div className="text-primary font-semibold text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {plan.result}
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/login">
                    <Button
                      className={`w-full py-4 text-lg font-semibold ${
                        plan.popular
                          ? utilityStyles.premiumButton
                          : "bg-primary/80 hover:bg-primary"
                      }`}
                    >
                      {plan.buttonText}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground text-lg mb-6">
              All plans include our core AI engine, enterprise security, and
              24/7 support.
            </p>
            <div className="flex items-center justify-center gap-12 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Secure & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                <span>Expert Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        className={`${utilityStyles.sectionSpacing} bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary),0.1),transparent)]" />
        <div className={`${utilityStyles.containerWidth} relative z-10`}>
          <div className="text-center space-y-12">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                Stop Building
                <br />
                <span className={utilityStyles.textGradient}>
                  Start Commanding
                </span>
              </h2>
              <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
                Join the data revolution. Transform how your organization
                extracts, structures, and leverages web data forever.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">In 5 Minutes</h3>
                  <p className="text-muted-foreground">
                    Complete your first scraping job
                  </p>
                </div>
              </div>
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">In 1 Week</h3>
                  <p className="text-muted-foreground">
                    Save hours on data collection
                  </p>
                </div>
              </div>
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                  <Award className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">In 1 Month</h3>
                  <p className="text-muted-foreground">
                    Become your team's data hero
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/login">
                  <Button
                    size="lg"
                    className={`${utilityStyles.premiumButton} text-2xl px-16 py-8 h-auto font-bold shadow-2xl`}
                  >
                    <Rocket className="w-7 h-7 mr-4" />
                    Start Your Transformation
                    <ArrowRight className="w-7 h-7 ml-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-12 py-8 h-auto font-semibold border-2"
                >
                  <MessageSquare className="w-6 h-6 mr-3" />
                  Talk to Our Team
                </Button>
              </div>

              <div className="flex items-center justify-center gap-12 text-muted-foreground">
                <div className="flex items-center gap-3 group cursor-default">
                  <CheckCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-lg">Free 14-day trial</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <CheckCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-lg">No setup required</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <CheckCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-lg">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20 border-t">
        <div className={utilityStyles.containerWidth}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-3 rounded-xl shadow-lg">
                  <Bot className="w-8 h-8" />
                </div>
                <span className="text-2xl font-bold tracking-tight">
                  SpeakToScrape
                </span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                The world&apos;s most advanced AI-powered web scraping platform.
                Trusted by thousands of professionals worldwide.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">SOC2 Certified</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-lg">Product</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a
                    href="#features"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    API Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Status Page
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-lg">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Press Kit
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-lg">Resources</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Tutorials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Case Studies
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors text-base"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-12">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <p className="text-muted-foreground text-base">
                © 2024 SpeakToScrape. All rights reserved. Built with ❤️ for data
                professionals.
              </p>
              <div className="flex items-center gap-8">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors text-base font-medium"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors text-base font-medium"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors text-base font-medium"
                >
                  Cookie Policy
                </a>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
