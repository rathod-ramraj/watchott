import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-[#0f1014] text-white font-sans overflow-x-hidden">
      <Navbar />

      <AnimatePresence mode='wait'>
        <motion.main
          key={router.route}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-grow flex flex-col w-full relative"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

