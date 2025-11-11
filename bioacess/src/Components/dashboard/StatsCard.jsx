import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const colorVariants = {
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600"
  },
  green: {
    bg: "bg-green-500",
    light: "bg-green-50",
    text: "text-green-600"
  },
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-50",
    text: "text-purple-600"
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-600"
  },
  cyan: {
    bg: "bg-cyan-500",
    light: "bg-cyan-50",
    text: "text-cyan-600"
  }
};

export default function StatsCard({ title, value, icon: Icon, color = "blue", loading }) {
  const colors = colorVariants[color];

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none shadow-md">
        <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} opacity-5 rounded-full transform translate-x-8 -translate-y-8`} />
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <CardTitle className="text-3xl font-bold mt-2 text-slate-900">
                {value}
              </CardTitle>
            </div>
            <div className={`p-3 rounded-xl ${colors.light}`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}