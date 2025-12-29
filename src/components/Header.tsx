import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Menu,
  X,
  Phone,
  Calendar,
  LayoutDashboard,
  Scan
} from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '#dashboard' },
  { label: 'Vein Analysis', icon: Scan, href: '#analysis' },
  { label: 'AI Assistant', icon: Phone, href: '#assistant' },
  { label: 'Appointments', icon: Calendar, href: '#appointments' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-panel-strong mx-4 mt-4 rounded-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <motion.a
              href="/"
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-xl medical-gradient flex items-center justify-center shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gradient-medical">
                  VeinSight AI
                </h1>
                <p className="text-xs text-muted-foreground">
                  Medical Intelligence
                </p>
              </div>
            </motion.a>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.a>
              ))}
            </nav>

            {/* DESKTOP CTA */}
            <motion.div
              className="hidden lg:flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Button variant="medical" size="lg">
                <Phone className="h-4 w-4 mr-2" />
                Start Consultation
              </Button>

              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  Sign Up
                </Button>
              </Link>
            </motion.div>

            {/* MOBILE MENU BUTTON */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-primary/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="lg:hidden glass-panel-strong mx-4 mt-2 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              ))}

              <Button variant="medical" size="lg" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Start Consultation
              </Button>

              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button
                  size="lg"
                  className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  Sign Up
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

