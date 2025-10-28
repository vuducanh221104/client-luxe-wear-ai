"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAgent } from "@/services/agentService";
import { ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, "At least 3 characters")
    .max(100, "Max 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Only letters, numbers, spaces, -, and _"),
  description: z.string().max(500, "Max 500 characters").optional(),
  config: z
    .object({
      model: z.enum(["gemini-1.5-pro", "gemini-2.5-flash"]).default("gemini-1.5-pro"),
      temperature: z
        .number({ invalid_type_error: "Must be a number" })
        .min(0, "Min 0")
        .max(2, "Max 2")
        .optional(),
      maxTokens: z
        .number({ invalid_type_error: "Must be a number" })
        .int("Must be integer")
        .min(1, "Min 1")
        .max(4096, "Max 4096")
        .optional(),
      systemPrompt: z.string().max(2000, "Max 2000 characters").optional(),
      instructions: z.string().max(1000, "Max 1000 characters").optional(),
      tools: z.array(z.string()).optional(),
    })
    .optional(),
  allowed_origins: z.array(z.string().url("Invalid URL")).max(10, "Max 10 origins").optional(),
});

type AgentForm = z.infer<typeof schema>;

export default function CreateAgentPage() {
  const router = useRouter();
  const [configOpen, setConfigOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AgentForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      config: { model: "gemini-1.5-pro", temperature: 0.7, maxTokens: 2048 },
      allowed_origins: [],
    },
    mode: "onChange",
  });

  const config = watch("config");

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const res = await createAgent(data);
      if (res.success) {
        toast.success("Agent created successfully");
        router.push(`/dashboard/agents/${res.data?.id}`);
      } else {
        toast.error(res.message || "Failed to create agent");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create AI Agent</h1>
        <p className="text-muted-foreground">Configure a new AI agent for your workspace</p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register("name", {
              required: "Name is required",
              minLength: { value: 3, message: "At least 3 characters" },
              maxLength: { value: 100, message: "Max 100 characters" },
              pattern: { value: /^[a-zA-Z0-9\s\-_]+$/, message: "Only letters, numbers, spaces, -, and _" },
            })}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description", {
              maxLength: { value: 500, message: "Max 500 characters" },
            })}
            rows={3}
          />
          {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" className="flex items-center justify-between w-full">
              Advanced Configuration
              <ChevronDown className={`h-4 w-4 transition-transform ${configOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={config?.model}
                onValueChange={(v) => setValue("config.model", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-pro">gemini-1.5-pro</SelectItem>
                  <SelectItem value="gemini-2.5-flash">gemini-2.5-flash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (0-2)</Label>
              <Input
                id="temperature"
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={config?.temperature || 0.7}
                onChange={(e) => setValue("config.temperature", parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens (1-4096)</Label>
              <Input
                id="maxTokens"
                type="number"
                min={1}
                max={4096}
                value={config?.maxTokens || 2048}
                onChange={(e) => setValue("config.maxTokens", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
          <Textarea id="systemPrompt" {...register("config.systemPrompt")} rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
          <Textarea id="instructions" {...register("config.instructions")} rows={3} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating..." : "Create Agent"}
        </Button>
      </form>
    </div>
  );
}



