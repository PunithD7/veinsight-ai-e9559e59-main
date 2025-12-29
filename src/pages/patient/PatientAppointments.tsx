import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, ArrowLeft, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout, patientNavItems } from '@/components/layouts/DashboardLayout';

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM'
];

interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string | null;
}

export default function PatientAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchDoctors();
    if (user) {
      fetchMyAppointments();
    }
  }, [user]);

  const fetchDoctors = async () => {
    try {
      // Fetch profiles that have a doctor role
      const { data: doctorRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'doctor');

      if (doctorRoles && doctorRoles.length > 0) {
        const doctorUserIds = doctorRoles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', doctorUserIds);

        if (profiles) {
          setDoctors(profiles.map(p => ({
            id: p.id,
            user_id: p.user_id,
            full_name: p.full_name,
            specialty: p.specialty
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user?.id)
        .order('appointment_date', { ascending: true });

      setMyAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !user) {
      toast({
        title: 'Missing Information',
        description: 'Please select a doctor, date, and time',
        variant: 'destructive'
      });
      return;
    }

    setIsBooking(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: selectedDoctor,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          notes: notes,
          status: 'scheduled'
        });

      if (error) throw error;

      setBookingSuccess(true);
      toast({
        title: 'Appointment Booked!',
        description: `Your appointment is scheduled for ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTime}`
      });

      // Reset form
      setTimeout(() => {
        setSelectedDate(null);
        setSelectedTime(null);
        setNotes('');
        setBookingSuccess(false);
        fetchMyAppointments();
      }, 3000);

    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsBooking(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startDay = startOfMonth(currentMonth).getDay();
  const emptyDays = Array(startDay).fill(null);

  return (
    <DashboardLayout title="Appointments" navItems={patientNavItems}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-display font-bold text-foreground">Book an Appointment</h2>
          <p className="text-muted-foreground">Select a doctor, date, and time for your visit</p>
        </motion.div>

        {bookingSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              Appointment Confirmed!
            </h3>
            <p className="text-muted-foreground">
              We'll send you a reminder before your appointment.
            </p>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Doctor Selection & Calendar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Doctor Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Select Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.length > 0 ? (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.user_id} value={doctor.user_id}>
                            {doctor.full_name} {doctor.specialty && `- ${doctor.specialty}`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No doctors available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Calendar */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Select Date
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-medium min-w-[140px] text-center">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {emptyDays.map((_, i) => (
                      <div key={`empty-${i}`} className="h-12" />
                    ))}
                    {days.map((day) => {
                      const isPast = isBefore(day, new Date()) && !isToday(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isTodayDate = isToday(day);

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => !isPast && setSelectedDate(day)}
                          disabled={isPast}
                          className={`h-12 rounded-lg text-sm font-medium transition-all ${
                            isPast
                              ? 'text-muted-foreground/50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-primary text-primary-foreground shadow-medical'
                              : isTodayDate
                              ? 'bg-primary/10 text-primary hover:bg-primary/20'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Select Time - {format(selectedDate, 'EEEE, MMMM d')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              selectedTime === time
                                ? 'bg-primary text-primary-foreground shadow-medical'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Doctor</p>
                    <p className="font-medium">
                      {selectedDoctor 
                        ? doctors.find(d => d.user_id === selectedDoctor)?.full_name || 'Selected'
                        : 'Not selected'}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">
                      {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Not selected'}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Time</p>
                    <p className="font-medium">{selectedTime || 'Not selected'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes (optional)</p>
                    <Textarea
                      placeholder="Any specific concerns or symptoms..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-medical hover:opacity-90"
                    onClick={handleBookAppointment}
                    disabled={!selectedDoctor || !selectedDate || !selectedTime || isBooking}
                  >
                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              {myAppointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Your Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {myAppointments.slice(0, 3).map((apt) => (
                        <div key={apt.id} className="p-3 rounded-lg bg-muted/50">
                          <p className="font-medium text-sm">{apt.appointment_date}</p>
                          <p className="text-xs text-muted-foreground">{apt.appointment_time}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                            apt.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                            apt.status === 'completed' ? 'bg-success/10 text-success' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
