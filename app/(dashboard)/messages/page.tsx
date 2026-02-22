"use client"

import { useState } from "react"
import Image from "next/image"
import { Send, Search, Phone, MoreVertical, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const conversations = [
  {
    id: "1",
    name: "Radha Sharma",
    sampraday: "ISKCON",
    lastMessage: "Hare Krishna! I would love to know more about your temple seva...",
    time: "2 min ago",
    unread: 2,
    image: "/images/couple-2.jpg",
    online: true,
  },
  {
    id: "2",
    name: "Rukmini Ji",
    sampraday: "ISKCON",
    lastMessage: "Yes, our family also follows strict Ekadashi fasting. Would be great to connect.",
    time: "1 hour ago",
    unread: 0,
    image: "/images/couple-3.jpg",
    online: false,
  },
  {
    id: "3",
    name: "Lakshmi Devi",
    sampraday: "Pushtimarg",
    lastMessage: "Thank you for accepting my interest. Looking forward to speaking with you.",
    time: "Yesterday",
    unread: 0,
    image: "/images/couple-1.jpg",
    online: false,
  },
]

const messages = [
  { id: 1, sender: "them", text: "Hare Krishna! Thank you for connecting.", time: "10:30 AM" },
  { id: 2, sender: "me", text: "Hare Krishna! It's wonderful to connect with you. I noticed we share the same Sampraday.", time: "10:32 AM" },
  { id: 3, sender: "them", text: "Yes! I have been following ISKCON teachings for 5 years now. I chant 16 rounds daily.", time: "10:35 AM" },
  { id: 4, sender: "me", text: "That's beautiful! I also chant 16 rounds. Do you attend the Sunday feast program at your local temple?", time: "10:37 AM" },
  { id: 5, sender: "them", text: "Yes, every Sunday! I'm also involved in the book distribution seva. It's very fulfilling.", time: "10:40 AM" },
  { id: 6, sender: "them", text: "I would love to know more about your temple seva and family background.", time: "10:41 AM" },
]

export default function MessagesPage() {
  const [selectedConvo, setSelectedConvo] = useState(conversations[0])
  const [messageText, setMessageText] = useState("")

  return (
    <div className="mx-auto max-w-6xl h-[calc(100vh-8rem)]">
      <div className="flex h-full rounded-xl border border-border bg-card overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 flex-shrink-0 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-10 h-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo)}
                className={`flex w-full items-center gap-3 px-4 py-3 transition-colors text-left ${
                  selectedConvo.id === convo.id
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : "hover:bg-secondary"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full">
                    <Image src={convo.image} alt={convo.name} fill className="object-cover" />
                  </div>
                  {convo.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{convo.name}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{convo.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.lastMessage}</p>
                </div>
                {convo.unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex-shrink-0">
                    {convo.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image src={selectedConvo.image} alt={selectedConvo.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-serif font-semibold text-foreground text-sm">{selectedConvo.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {selectedConvo.sampraday}
                  {selectedConvo.online && <span className="ml-1 text-green-600"> &middot; Online</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-4">
              {/* Date Separator */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">Today</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === "me"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        msg.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-border p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setMessageText("")
              }}
              className="flex items-center gap-3"
            >
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
