"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

import EnglishFlag from "@/components/Icons/EnglishFlag";
import SpanishFlag from "@/components/Icons/SpanishFlag";
import GermanFlag from "@/components/Icons/GermanFlag";
import ChineseFlag from "@/components/Icons/ChinaFlag";

const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeInUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 60,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.8,
      bounce: 0.3,
    },
  },
};

const flagVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.3,
    rotate: -180,
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      duration: 1.2,
      bounce: 0.4,
      delay: 0.6,
    },
  },
};

interface OnboardingTextProps {
  text: string;
  title: string;
  setNextStep: () => void;
}

const OnboardingText = ({ text, title, setNextStep }: OnboardingTextProps) => {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center text-center px-6 w-screen h-[85vh] mx-auto cursor-pointer"
      onClick={setNextStep}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <motion.h1 variants={fadeInUpVariants} className="mb-6 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
        {title}
      </motion.h1>

      <motion.p variants={fadeInUpVariants} className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
        {text}
      </motion.p>

      <motion.div
        className="absolute top-20 left-1/4 -translate-x-1/2 hidden sm:block"
        variants={flagVariants}
        whileHover={{
          scale: 1.2,
          rotate: 10,
          transition: { duration: 0.3 },
        }}
      >
        <motion.div
          animate={{
            y: [-5, 5, -5],
            rotate: [-2, 2, -2],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" as const,
              delay: 0.2,
            },
          }}
        >
          <EnglishFlag className="h-12 w-12 drop-shadow-xl" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-20 right-1/6  hidden sm:block"
        variants={flagVariants}
        whileHover={{
          scale: 1.2,
          rotate: -10,
          transition: { duration: 0.3 },
        }}
      >
        <motion.div
          animate={{
            y: [-5, 5, -5],
            rotate: [-2, 2, -2],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" as const,
              delay: 0.8,
            },
          }}
        >
          <ChineseFlag className="h-12 w-12 drop-shadow-xl" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-1/4 translate-x-1/2 hidden sm:block"
        variants={flagVariants}
        whileHover={{
          scale: 1.2,
          rotate: -10,
          transition: { duration: 0.3 },
        }}
      >
        <motion.div
          animate={{
            y: [-5, 5, -5],
            rotate: [-2, 2, -2],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" as const,
              delay: 0.8,
            },
          }}
        >
          <SpanishFlag className="h-12 w-12 drop-shadow-xl" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-16 -translate-y-1/2 hidden md:block"
        variants={flagVariants}
        whileHover={{
          scale: 1.2,
          rotate: 5,
          transition: { duration: 0.3 },
        }}
      >
        <motion.div
          animate={{
            y: [-5, 5, -5],
            rotate: [-2, 2, -2],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" as const,
              delay: 1.2,
            },
          }}
        >
          <GermanFlag className="h-12 w-12 drop-shadow-xl" />
        </motion.div>
      </motion.div>

      {/* Subtle click indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-400 dark:text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        Click anywhere to continue
      </motion.div>
    </motion.div>
  );
};

export default OnboardingText;
