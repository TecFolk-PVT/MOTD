"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useRef, useEffect } from "react";

interface AnimatedDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  trigger: ReactNode;
  className?: string;
  dropdownClassName?: string;
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  closeOnClick?: boolean;
  closeOnEsc?: boolean;
}

export default function AnimatedDropdown({
  isOpen,
  onClose,
  children,
  trigger,
  className = "",
  dropdownClassName = "",
  position = "bottom-right",
  closeOnClick = true,
  closeOnEsc = true,
}: AnimatedDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEsc]);

  const positionClasses = {
    "bottom-left": "left-0 top-full mt-2",
    "bottom-right": "right-0 top-full mt-2",
    "top-left": "left-0 bottom-full mb-2",
    "top-right": "right-0 bottom-full mb-2",
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute z-50 ${positionClasses[position]} ${dropdownClassName}`}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => {
              if (closeOnClick) {
                e.stopPropagation();
              }
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
