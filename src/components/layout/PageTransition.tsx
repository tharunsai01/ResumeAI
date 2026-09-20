import * as React from "react"
import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}
