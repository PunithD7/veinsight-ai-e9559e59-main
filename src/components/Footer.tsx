import { motion } from 'framer-motion';
import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative pt-20 pb-10 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-primary/10" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <a href="#" className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-medical flex items-center justify-center shadow-glow">
                <Activity className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-gradient-medical">
                  VeinSight AI
                </h2>
                <p className="text-xs text-muted-foreground">Medical Intelligence</p>
              </div>
            </a>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Revolutionary AI-powered venous access technology for healthcare professionals. 
              Improving patient outcomes through precision medicine.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors group"
                >
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Dashboard', 'Vein Analysis', 'AI Assistant', 'Appointments', 'Documentation'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-6">Our Services</h3>
            <ul className="space-y-3">
              {['Vein Detection', 'IV Guidance', 'Patient Monitoring', 'Voice Consultation', 'Training Programs'].map((service) => (
                <li key={service}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-muted-foreground">
                  123 Medical Center Drive<br />
                  San Francisco, CA 94102
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+1-800-VEIN-AI" className="text-muted-foreground hover:text-primary transition-colors">
                  1-800-VEIN-AI
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:contact@veinsight.ai" className="text-muted-foreground hover:text-primary transition-colors">
                  contact@veinsight.ai
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} VeinSight AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FDA Compliance
              </a>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="glass-panel rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">FDA</p>
            <p className="text-sm font-semibold text-foreground">510(k) Cleared</p>
          </div>
          <div className="glass-panel rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">CE</p>
            <p className="text-sm font-semibold text-foreground">Mark Certified</p>
          </div>
          <div className="glass-panel rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">HIPAA</p>
            <p className="text-sm font-semibold text-foreground">Compliant</p>
          </div>
          <div className="glass-panel rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">ISO</p>
            <p className="text-sm font-semibold text-foreground">13485:2016</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
