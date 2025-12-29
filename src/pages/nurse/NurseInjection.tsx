import { useState } from 'react';
import { motion } from 'framer-motion';
import { Syringe, Search, User, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { DashboardLayout, nurseNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface InjectionGuide {
  id: string;
  name: string;
  description: string;
  steps: string[];
  precautions: string[];
  veinSelection: string[];
}

const injectionGuides: InjectionGuide[] = [
  {
    id: '1',
    name: 'Intravenous (IV) Injection',
    description: 'Direct injection into a vein for rapid medication delivery',
    steps: [
      'Verify patient identity and medication',
      'Gather supplies and perform hand hygiene',
      'Apply tourniquet 3-4 inches above injection site',
      'Select appropriate vein using vein scanner',
      'Clean site with antiseptic in circular motion',
      'Insert needle at 15-30 degree angle, bevel up',
      'Confirm blood return and release tourniquet',
      'Slowly inject medication',
      'Remove needle and apply pressure'
    ],
    precautions: [
      'Check for allergies before administration',
      'Verify correct medication, dose, route, and time',
      'Watch for signs of infiltration or phlebitis',
      'Never inject into an infected or inflamed site'
    ],
    veinSelection: [
      'Primary: Median cubital vein (antecubital fossa)',
      'Secondary: Cephalic vein (lateral forearm)',
      'Avoid: Areas near joints, veins with valves visible'
    ]
  },
  {
    id: '2',
    name: 'Intramuscular (IM) Injection',
    description: 'Injection into muscle tissue for slower absorption',
    steps: [
      'Verify patient and medication orders',
      'Select appropriate site (deltoid, vastus lateralis, ventrogluteal)',
      'Position patient comfortably',
      'Clean site with antiseptic',
      'Spread skin taut or use Z-track technique',
      'Insert needle at 90 degree angle',
      'Aspirate to check for blood (if required)',
      'Inject medication slowly',
      'Withdraw needle and apply pressure'
    ],
    precautions: [
      'Use appropriate needle length for patient size',
      'Rotate injection sites for multiple doses',
      'Avoid areas with active infection or skin conditions',
      'Watch for adverse reactions after injection'
    ],
    veinSelection: [
      'Deltoid: Small volume injections (up to 1ml)',
      'Vastus lateralis: Infants and children preferred',
      'Ventrogluteal: Large volume injections (up to 4ml)'
    ]
  },
  {
    id: '3',
    name: 'Subcutaneous (SC) Injection',
    description: 'Injection into fatty tissue layer beneath the skin',
    steps: [
      'Verify patient identity and medication',
      'Select appropriate site (abdomen, upper arm, thigh)',
      'Clean area with antiseptic swab',
      'Pinch skin to create a fold',
      'Insert needle at 45-90 degree angle',
      'Inject medication slowly',
      'Wait 10 seconds before withdrawing',
      'Release pinch and remove needle'
    ],
    precautions: [
      'Rotate injection sites to prevent lipohypertrophy',
      'Avoid injecting into bruised or scarred areas',
      'Do not aspirate for SC injections',
      'For insulin, keep at room temperature before injection'
    ],
    veinSelection: [
      'Abdomen: 2 inches from navel (preferred for insulin)',
      'Upper arm: Back of arm, fatty tissue',
      'Thigh: Outer area, middle third'
    ]
  }
];

const NurseInjection = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = injectionGuides.filter(guide =>
    guide.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Injection Assistance" navItems={nurseNavItems}>
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground">Injection Assistance</h2>
        <p className="text-muted-foreground">Step-by-step guides for proper injection techniques</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search injection types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Vein Scanner Integration</h4>
              <p className="text-sm text-muted-foreground">
                Use the VeinSight scanner to identify optimal injection sites. Green highlighted veins are recommended, 
                yellow veins are secondary options, and red areas should be avoided.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Injection Guides */}
      <div className="space-y-6">
        {filteredGuides.map((guide, index) => (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                    <Syringe className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>{guide.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="steps">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Procedure Steps
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        {guide.steps.map((step, i) => (
                          <li key={i} className="py-1">{step}</li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="precautions">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Precautions
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {guide.precautions.map((precaution, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-warning mt-1 flex-shrink-0" />
                            {precaution}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="vein">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Site Selection Guide
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {guide.veinSelection.map((selection, i) => (
                          <li key={i} className="py-1">{selection}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-12">
          <Syringe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default NurseInjection;
