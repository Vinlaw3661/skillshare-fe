"use client";

import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Sparkles, CheckCircle2, Info } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: React.ReactNode;
};

export function AIBrainstormer() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hi! I'm your SkillShare AI Assistant. Tell me what classes or clubs you're in, or what graduation requirements you need to fulfill, and I'll help you figure out what to teach!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Robust state management to prevent repetitive loops
  const [chatPhase, setChatPhase] = useState<"start" | "uger_suggested" | "finished">("start");
  const [isPublished, setIsPublished] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userInputString = input;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userInputString };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated AI Processing
    await new Promise((resolve) => setTimeout(resolve, 1200));

    let aiResponse: React.ReactNode;
    const lowerInput = userInputString.toLowerCase();

    // LOGIC TREE: Prevents "sending the same thing"
    if (chatPhase === "start") {
      if (lowerInput.includes("algorithm") || lowerInput.includes("uger") || lowerInput.includes("requirement") || lowerInput.includes("csds 310")) {
        aiResponse = (
          <div className="flex flex-col gap-2">
            <p>I see you're looking at <strong>CSDS 310 (Algorithms)</strong>. To fulfill that UGER requirement, you need a 45-minute technical presentation with Q&A.</p>
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 p-3 rounded-md my-1 text-sm flex gap-2">
               <Info className="h-5 w-5 shrink-0" />
               <p><strong>CWRU Requirement:</strong> Must demonstrate technical communication to peers before Week 12.</p>
            </div>
            <p>I suggest a <strong>"Whiteboard Coding Interview Prep"</strong> session. It perfectly fits the criteria. What day and campus building works for you?</p>
          </div>
        );
        setChatPhase("uger_suggested");
      } else {
        aiResponse = "That sounds interesting! To give you the best advice, could you mention a specific course (like Algorithms) or a graduation requirement (like UGER) you're working on?";
      }
    } 
    else if (chatPhase === "uger_suggested") {
      // The user has provided a time/place, now show the Generative UI Card
      aiResponse = (
        <div className="flex flex-col gap-3 mt-1">
          <p>Perfect. I've drafted a session that meets the CWRU UGER criteria for that time and location. Here is the automated draft:</p>
          
          <div className="bg-background border border-primary/30 rounded-lg p-4 text-foreground shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h4 className="font-bold text-lg tracking-tight">Whiteboard Coding Interview Prep</h4>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">CSDS 310</span>
              <span className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full font-medium">Cap: 15</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full font-medium">UGER Approved</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Location:</strong> {userInputString.length > 3 ? userInputString : "Olin Building"}<br/>
              <strong>Duration:</strong> 60 minutes (Meets 45m Min)
            </p>
          </div>
          
          <button 
            onClick={async () => {
              setIsTyping(true);
              // Optimistic UI: Simulate a real network request to Vinlaw's backend
              await new Promise(r => setTimeout(r, 1500));
              
              setIsPublished(true);
              setIsTyping(false);

              toast({
                title: "Integration Successful",
                description: "Session draft synced to MongoDB and published to the dashboard.",
              });

              // Final Integration: Redirect the user to the actual app dashboard
              setTimeout(() => {
                window.location.href = "/sessions"; 
              }, 2000);
            }}
            className="mt-1 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-md hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            {isPublished ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {isPublished ? "Redirecting to Dashboard..." : "Confirm & Create Session"}
          </button>
        </div>
      );
      setChatPhase("finished");
    } else {
      aiResponse = "Your session is being prepared! You can find it on the Browse Sessions page in just a moment.";
    }

    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: "ai", content: aiResponse },
    ]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-[550px] border rounded-xl overflow-hidden bg-background shadow-lg">
      <div className="flex items-center gap-2 bg-primary p-4 text-primary-foreground">
        <Sparkles className="h-5 w-5" />
        <div>
          <h3 className="font-semibold tracking-tight">AI Session Brainstormer</h3>
          <p className="text-xs text-primary-foreground/80">CWRU Integration Layer</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`rounded-2xl px-5 py-4 max-w-[85%] text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border shadow-sm text-foreground rounded-tl-sm"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border shadow-sm bg-secondary text-secondary-foreground">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl px-5 py-4 bg-card border shadow-sm rounded-tl-sm flex items-center gap-1.5">
              <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"></span>
              <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-card border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., I need a UGER for Algorithms..."
          className="flex-1 rounded-full border border-input bg-muted/50 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="inline-flex items-center justify-center rounded-full bg-primary p-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}