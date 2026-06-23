"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/dashboard/StatCard";
import {
  Users,
  MessageSquare,
  Reply,
  ThumbsUp,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

interface Stats {
  totalLeads: number;
  messagedToday: number;
  replies: number;
  interested: number;
  meetings: number;
  replyRate: number;
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export default function StatsGrid({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      accent: "text-gray-500",
    },
    {
      title: "Messaged Today",
      value: stats.messagedToday,
      icon: MessageSquare,
      accent: "text-blue-500",
    },
    {
      title: "Replies",
      value: stats.replies,
      icon: Reply,
      accent: "text-violet-500",
    },
    {
      title: "Interested",
      value: stats.interested,
      icon: ThumbsUp,
      accent: "text-emerald-500",
    },
    {
      title: "Meetings",
      value: stats.meetings,
      icon: CalendarCheck,
      accent: "text-amber-500",
    },
    {
      title: "Reply Rate",
      value: `${stats.replyRate}%`,
      icon: TrendingUp,
      accent: "text-rose-500",
      highlight: true,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => (
        <motion.div key={card.title} variants={item}>
          <StatCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
            highlight={card.highlight}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}