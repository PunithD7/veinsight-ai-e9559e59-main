import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Star, ChevronLeft, ChevronRight, Check, Stethoscope } from 'lucide-react';

const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    specialty: 'Vascular Surgery',
    rating: 4.9,
    reviews: 284,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    available: true,
  },
  {
    id: 2,
    name: 'Dr. Michael Torres',
    specialty: 'Interventional Radiology',
    rating: 4.8,
    reviews: 196,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    available: true,
  },
  {
    id: 3,
    name: 'Dr. Emily Watson',
    specialty: 'Internal Medicine',
    rating: 4.9,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    available: false,
  },
  {
    id: 4,
    name: 'Dr. James Park',
    specialty: 'Emergency Medicine',
    rating: 4.7,
    reviews: 158,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
    available: true,
  },
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  // Add empty slots for days before the first day of month
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  
  // Add all days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(i);
  }
  
  return days;
}

export function AppointmentBooking() {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [bookingComplete, setBookingComplete] = useState(false);

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  const today = new Date().getDate();
  const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

  const handleBook = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      setBookingComplete(true);
      setTimeout(() => {
        setBookingComplete(false);
        setSelectedDoctor(null);
        setSelectedDate(null);
        setSelectedTime(null);
      }, 3000);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  return (
    <section id="appointments" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Appointment Booking
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Book Your Consultation
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Schedule appointments with our expert medical professionals. 
            Choose your preferred doctor, date, and time slot.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Doctor Selection */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-panel-strong rounded-3xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Select Doctor
              </h3>
              
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <motion.button
                    key={doctor.id}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      selectedDoctor === doctor.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    } ${!doctor.available ? 'opacity-50' : ''}`}
                    onClick={() => doctor.available && setSelectedDoctor(doctor.id)}
                    disabled={!doctor.available}
                    whileHover={doctor.available ? { scale: 1.02 } : {}}
                    whileTap={doctor.available ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{doctor.specialty}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span className="text-xs text-foreground">{doctor.rating}</span>
                          <span className="text-xs text-muted-foreground">({doctor.reviews})</span>
                        </div>
                      </div>
                      {!doctor.available && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          Unavailable
                        </span>
                      )}
                      {selectedDoctor === doctor.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Calendar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="glass-panel-strong rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {monthName} {currentYear}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isPast = isCurrentMonth && day !== null && day < today;
                  const isSelected = day === selectedDate;
                  const isToday = isCurrentMonth && day === today;

                  return (
                    <button
                      key={index}
                      className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                        day === null
                          ? ''
                          : isPast
                          ? 'text-muted-foreground/50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-primary text-primary-foreground'
                          : isToday
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-foreground'
                      }`}
                      onClick={() => !isPast && day && setSelectedDate(day)}
                      disabled={isPast || !day}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Time Slots */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-panel-strong rounded-3xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Select Time
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted text-foreground'
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>

              {/* Booking Summary */}
              {(selectedDoctor || selectedDate || selectedTime) && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Booking Summary</h4>
                  {selectedDoctor && (
                    <p className="text-sm text-muted-foreground">
                      <User className="w-3 h-3 inline mr-1" />
                      {doctors.find((d) => d.id === selectedDoctor)?.name}
                    </p>
                  )}
                  {selectedDate && (
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {monthName} {selectedDate}, {currentYear}
                    </p>
                  )}
                  {selectedTime && (
                    <p className="text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {selectedTime}
                    </p>
                  )}
                </div>
              )}

              <Button
                variant="medical"
                size="lg"
                className="w-full"
                disabled={!selectedDoctor || !selectedDate || !selectedTime || bookingComplete}
                onClick={handleBook}
              >
                {bookingComplete ? (
                  <>
                    <Check className="w-5 h-5" />
                    Appointment Booked!
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
