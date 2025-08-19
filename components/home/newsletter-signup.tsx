"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface NewsletterSignupProps {
  dict: {
    newsletter: {
      title: string;
      subtitle: string;
      placeholder: string;
      subscribe: string;
      success: string;
      error: string;
    };
  };
}

export function NewsletterSignup({ dict }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage(dict.newsletter.error);
      return;
    }

    setStatus("loading");
    
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setMessage(dict.newsletter.success);
      setEmail("");
    }, 1000);
  };

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              {dict.newsletter.title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {dict.newsletter.subtitle}
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={dict.newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={status === "loading"}
              />
              <Button 
                type="submit" 
                disabled={status === "loading"}
                className="sm:w-auto w-full"
              >
                {status === "loading" ? "..." : dict.newsletter.subscribe}
              </Button>
            </form>
            
            {message && (
              <p className={`mt-4 text-sm ${
                status === "success" ? "text-green-600" : "text-red-600"
              }`}>
                {message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}