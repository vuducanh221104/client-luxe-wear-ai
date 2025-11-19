"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Users, 
  Zap, 
  BarChart3, 
  Lock, 
  MapPin, 
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  Settings,
  Database,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function EnterprisePage() {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Implement form submission
    setTimeout(() => {
      setSubmitting(false);
      alert("Thank you! Our team will reach out to you soon.");
      setFormData({ email: "", message: "" });
    }, 1000);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Enterprise-ready AI
              <br />
              for customer service
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Scale customer support with enterprise-grade AI agents. Handle massive volumes with advanced infrastructure, intelligent automation, and team support. Deliver exceptional experiences with unmatched reliability.
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                className="rounded-2xl px-8 py-6 text-base font-semibold"
                style={{
                  background: "linear-gradient(90deg, #FF7A7A 0%, #FF8C5A 25%, #FFB056 50%, #A77BFF 75%, #6C7BFF 100%)",
                }}
                asChild
              >
                <Link href="#contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by 10,000+ businesses worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            <div className="text-2xl font-bold text-muted-foreground">SIEMENS</div>
            <div className="text-2xl font-bold text-muted-foreground">POSTMAN</div>
            <div className="text-2xl font-bold text-muted-foreground">pwc</div>
            <div className="text-2xl font-bold text-muted-foreground">+alpian</div>
            <div className="text-2xl font-bold text-muted-foreground">Opal</div>
            <div className="text-2xl font-bold text-muted-foreground">al Baraka</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mx-auto justify-center">
            <span className="h-2 w-2 rounded-full bg-pink-500" /> Features
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-center mb-12 md:mb-16">
            What&apos;s included in Enterprise
          </h2>

          {/* Primary Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Dedicated Account Manager */}
            <div className="rounded-3xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:border-foreground/20">
              <div className="h-48 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border mb-6 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-sm font-semibold">24/7 Support</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Dedicated account manager</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Enjoy 24/7 support, monitoring, and guidance from your expert.
              </p>
            </div>

            {/* Custom Integrations */}
            <div className="rounded-3xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:border-foreground/20">
              <div className="h-48 rounded-2xl bg-gradient-to-br from-blue-500/20 to-orange-500/20 border mb-6 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3">
                  {[Zap, Settings, Database, Globe, MessageSquare, BarChart3].map((Icon, i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-background border flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Custom integrations</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                We build tailored integrations to seamlessly fit your internal tools and workflows.
              </p>
            </div>

            {/* SLA Guarantees */}
            <div className="rounded-3xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:border-foreground/20">
              <div className="h-48 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border mb-6 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * 0.2}`}
                      className="text-green-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">1.04s</div>
                      <div className="text-xs text-muted-foreground">Response</div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">SLA guarantees</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Enjoy enterprise-grade uptime, reliability, and support with SLAs.
              </p>
            </div>
          </div>

          {/* Secondary Feature List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-background p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3 shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Advanced security features</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Includes SSO, detailed audit logs, and robust custom security controls for compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3 shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Prioritized features on roadmap</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Influence our roadmap by shaping what we build next based on your enterprise needs.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3 shrink-0">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Higher limits</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Access increased usage limits across agents, sources, and message volume to scale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl border bg-background p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
              <div className="relative z-10 text-center">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                  &quot;LuxeWear is a strong signal of how customer support will evolve. It is an early adopter of the agentic approach, which will become increasingly effective, trusted, and prominent.&quot;
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Marc Manara</div>
                    <div className="text-sm text-muted-foreground">OpenAI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left: Heading + copy + badges */}
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-pink-500 mr-2" /> Security
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Enterprise-grade
                <br />
                security & privacy
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                We take security and compliance seriously. LuxeWear is SOC 2 Type II and
                GDPR compliant, trusted by thousands of businesses to build secure and
                compliant AI Agents.
              </p>
              <div className="flex items-center gap-8 pt-4">
                <div className="h-20 w-auto bg-muted rounded-lg flex items-center justify-center px-4">
                  <span className="text-xs font-semibold">AICPA SOC 2</span>
                </div>
                <div className="h-20 w-auto bg-muted rounded-lg flex items-center justify-center px-4">
                  <span className="text-xs font-semibold">GDPR</span>
                </div>
              </div>
            </div>

            {/* Right: Detail cards */}
            <div className="rounded-3xl border overflow-hidden divide-y hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between p-6 md:p-8 hover:bg-muted/30 transition-colors">
                <div className="max-w-xl">
                  <h3 className="text-xl font-semibold mb-2">Your data stays yours</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Your data is only accessible to your AI agent and is never used to train models.
                  </p>
                </div>
                <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                  <Database className="h-12 w-12 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-6 md:p-8 hover:bg-muted/30 transition-colors">
                <div className="max-w-xl">
                  <h3 className="text-xl font-semibold mb-2">Data encryption</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    All data is encrypted at rest and in transit using industry-standard encryption algorithms.
                  </p>
                </div>
                <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-green-500/20 to-yellow-500/20 flex items-center justify-center shrink-0">
                  <Lock className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-6 md:p-8 hover:bg-muted/30 transition-colors">
                <div className="max-w-xl">
                  <h3 className="text-xl font-semibold mb-2">Secure integrations</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    We use verified variables to ensure users can access only their own data in your systems.
                  </p>
                </div>
                <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                  <Globe className="h-12 w-12 text-pink-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Commitment bar */}
          <div className="container mx-auto px-6 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border py-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              <span>LuxeWear is committed to safeguarding your data.</span>
            </div>
            <Link href="/docs/user-guides" className="inline-flex items-center gap-1 text-sm font-medium hover:text-foreground transition-colors">
              Learn more <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left: Heading + description */}
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-pink-500 mr-2" /> Get in touch
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Get started with our enterprise plan
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Enter your details, and our team will reach out to design a custom plan tailored to your needs.
              </p>
            </div>

            {/* Right: Contact Form */}
            <div className="rounded-3xl border bg-background p-6 md:p-8 hover:shadow-lg transition-shadow duration-300">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Work email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    How can we help you?
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Write your message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl py-6 text-base font-medium"
                  style={{
                    background: "linear-gradient(90deg, #000 0%, #000 100%)",
                    borderBottom: "3px solid",
                    borderImage: "linear-gradient(90deg, #FF7A7A 0%, #FF8C5A 25%, #FFB056 50%, #A77BFF 75%, #6C7BFF 100%) 1",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

