"use client";

import { useState } from "react";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      key: "free",
      name: "Free",
      icon: "/images/pricing/star-1.svg",
      priceMonthly: 0,
      priceYearly: 0,
      cta: "Get started",
      features: [
        "Access to fast models",
        "100 message credits/month",
        "1 AI agent",
        "1 AI Action per AI agent",
        "400 KB per AI agent",
        "1 seat",
        "API access",
        "Embed on unlimited websites",
      ],
      footnote: "AI agents get deleted after 14 days of inactivity on the free plan.",
    },
    {
      key: "hobby",
      name: "Hobby",
      icon: "/images/pricing/star-2.svg",
      priceMonthly: 40,
      priceYearly: 400,
      cta: "Subscribe",
      features: [
        "Everything in Free +",
        "2,000 message credits/month",
        "1 AI agent",
        "5 AI Actions per AI agent",
        "40 MB per AI agent",
        "Unlimited links to train on",
        "Basic analytics",
      ],
    },
    {
      key: "standard",
      name: "Standard",
      icon: "/images/pricing/star-3.svg",
      priceMonthly: 150,
      priceYearly: 1500,
      cta: "Subscribe",
      popular: true,
      features: [
        "Everything in Hobby +",
        "12,000 message credits/month",
        "2 AI agents",
        "10 AI Actions per AI agent",
        "3 seats",
      ],
    },
    {
      key: "pro",
      name: "Pro",
      icon: "/images/pricing/star-4.svg",
      priceMonthly: 500,
      priceYearly: 5000,
      cta: "Subscribe",
      features: [
        "Everything in Standard +",
        "40,000 message credits/month",
        "3 AI agents",
        "15 AI Actions per AI agent",
        "5+ seats",
        "Advanced analytics",
      ],
    },
    {
      key: "enterprise",
      name: "Enterprise",
      icon: "/images/pricing/star-5.svg",
      priceMonthly: null,
      priceYearly: null,
      cta: "Contact us",
      features: [
        "Everything in Pro +",
        "Higher limits",
        "Priority support",
        "SLAs",
        "Success manager (CSM)",
      ],
    },
  ];

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Predictable pricing
            <br /> scalable plans
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Designed for every stage of your journey.
          </p>

          <div className="mt-6 inline-flex items-center rounded-full border bg-background p-1 text-sm shadow-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                billing === "monthly" ? "bg-foreground text-background shadow-sm" : "hover:bg-muted"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                billing === "yearly" ? "bg-foreground text-background shadow-sm" : "hover:bg-muted"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing grid */}
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div key={plan.key} className={`rounded-3xl border bg-background transition-all duration-300 hover:shadow-lg ${plan.popular ? 'ring-2 ring-foreground/20' : 'hover:border-foreground/20'}`}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="inline-flex items-center gap-2 text-sm font-semibold">
                  <img src={plan.icon} alt="star" className="h-4 w-4" />
                  <span>{plan.name}</span>
                </div>
                {plan.popular ? (
                  <span className="rounded-full bg-black text-white text-xs px-3 py-1 font-medium">Popular</span>
                ) : null}
              </div>

              {/* Price */}
              <div className="px-6 pt-6">
                {plan.priceMonthly === null ? (
                  <div className="text-2xl font-semibold">Let's Talk</div>
                ) : (
                  <>
                    <div className="text-4xl font-extrabold">
                      ${billing === "monthly" ? plan.priceMonthly : plan.priceYearly}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      per {billing === "monthly" ? "month" : "year"}
                    </div>
                  </>
                )}

                <button
                  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-200 ${
                    plan.popular 
                      ? "bg-black text-white border-black hover:bg-black/90 hover:shadow-md" 
                      : "bg-background hover:bg-muted hover:border-foreground/20"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>

              {/* Features */}
              <ul className="px-6 py-6 space-y-3 text-sm">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.footnote ? (
                <div className="px-6 pb-6 text-[11px] text-muted-foreground">
                  {plan.footnote}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
