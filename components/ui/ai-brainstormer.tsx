"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, CheckCircle2, Info } from "lucide-react";
//import { createSession } from "@/lib/api"; // Assuming Vinlaw's API is here. If not, we will just mock the button click.

type Message = {
  id: string;
  role: "user" | "ai";
  content: React.ReactNode;
};

export function AIBrainstormer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hi! I'm your SkillShare AI Assistant. Tell me what classes or clubs you're in, or what graduation requirements you need to fulfill, and I'll help you figure out what to teach!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // The "Brain" of the bot: tracks where we are in the conversation
  const [chatPhase, setChatPhase] = useState<"start" | "uger_explained" | "finished">("start");
  const [isPublished, setIsPublished] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInputString = input;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userInputString };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let aiResponse: React.ReactNode = "That's an interesting idea! Tell me more about what you'd like to teach.";
    const lowerInput = userInputString.toLowerCase();

    // PHASE 1: The student mentions the requirement. The bot acts like an advisor.
    if (chatPhase === "start" && (lowerInput.includes("algorithm") || lowerInput.includes("uger") || lowerInput.includes("requirement"))) {
      aiResponse = (
        <div className="flex flex-col gap-2">
          <p>I can definitely help with that! For <strong>CSDS 310 (Algorithms)</strong>, the UGER presentation requirement means you need to demonstrate technical communication to an audience of your peers.</p>
          
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 p-3 rounded-md my-1 text-sm flex gap-2">
             <Info className="h-5 w-5 shrink-0" />
             <p><strong>CWRU Guideline:</strong> The presentation must be at least 45 minutes, include an interactive Q&A, and be completed before Week 12 of the semester.</p>
          </div>

          <p>A great way to fulfill this is by hosting a <strong>Whiteboard Coding Interview Prep</strong> session on SkillShare! You'll stand at a whiteboard, walk through a classic LeetCode problem (like Dijkstra's Algorithm), explain the time/space complexity, and answer questions.</p>
          <p>Would you like to host this? If so, reply with a day, time, and campus building (like Olin or Nord) that works for you.</p>
        </div>
      );
      setChatPhase("uger_explained");

    // PHASE 2: The student provides logistics. The bot generates the UI.
    } else if (chatPhase === "uger_explained") {
      aiResponse = (
        <div className="flex flex-col gap-3 mt-1">
          <p>Perfect! I have generated a session draft based on those details that meets all the UGER criteria.</p>
          
          {/* Generative UI Component */}
          <div className="bg-background border border-primary/30 rounded-lg p-4 text-foreground shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h4 className="font-bold text-lg tracking-tight">Whiteboard Coding Interview Prep</h4>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">Technology</span>
              <span className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full font-medium">Capacity: 15</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full font-medium">UGER Approved Format</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              <strong>Location:</strong> CWRU Engineering Quad<br/>
              <strong>Duration:</strong> 60 minutes (meets 45 min minimum)
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join me for an interactive session where we tackle real-world SWE interview questions on the whiteboard. I will cover algorithmic complexity and field Q&A. 
            </p>
          </div>
          
          <button 
            onClick={async () => {
              // 1. Show loading state if you want, or just set published
              setIsPublished(true);
              
              // 2. Here is where it connects to Vinlaw's backend!
              try {
                // If Vinlaw's API is ready, this fires it off.
                // await createSession({ title: "Whiteboard Coding...", capacity: 15, location: "Olin" });
              } catch (e) {
                console.error(e);
              }
            }}
            className="mt-1 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-md hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            {isPublished ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {isPublished ? "Session Created & Synced!" : "Create Session on Dashboard"}
          </button>
        </div>
      );
      setChatPhase("finished");
    }

    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: "ai", content: aiResponse },
    ]);
    setIsTyping(false);
  };

  // ... (Keep the exact same return statement from the previous code block for the UI rendering)
  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-[550px] border rounded-xl overflow-hidden bg-background shadow-lg">
      <div className="flex items-center gap-2 bg-primary p-4 text-primary-foreground">
        <Sparkles className="h-5 w-5" />
        <div>
          <h3 className="font-semibold tracking-tight">AI Session Brainstormer</h3>
          <p className="text-xs text-primary-foreground/80">CWRU Academic Advisor Agent</p>
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
          placeholder="Ask about a requirement..."
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