import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarCheck, Trash2, MessageCircle, Clock, Calendar } from 'lucide-react';
import { TREATMENTS } from '../data';

interface ActiveBookingsListProps {
  bookings: any[];
  onCancelBooking: (id: string) => void;
}

export default function ActiveBookingsList({ bookings, onCancelBooking }: ActiveBookingsListProps) {
  if (bookings.length === 0) {
    return null;
  }

  const getTreatmentName = (id: string) => {
    const treatment = TREATMENTS.find((t) => t.id === id);
    return treatment ? treatment.name : 'Procedimento Geral';
  };

  const getTreatmentImage = (id: string) => {
    const treatment = TREATMENTS.find((t) => t.id === id);
    return treatment ? treatment.image : '';
  };

  const openWhatsAppConfirm = (booking: any) => {
    const treatmentName = getTreatmentName(booking.treatmentId);
    const text = `Olá! Gostaria de confirmar meu agendamento na Central da Estética:\n\n*Procedimento:* ${treatmentName}\n*Nome:* ${booking.name}\n*Data:* ${booking.date.split('-').reverse().join('/')}\n*Horário:* ${booking.time}\n\nObrigado!`;
    const url = `https://wa.me/551130521400?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-premium border border-outline-variant/10 max-w-4xl mx-auto my-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <CalendarCheck className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold text-primary">Seus Agendamentos</h3>
          <p className="text-xs text-on-surface-variant">Acompanhe e confirme suas consultas solicitadas</p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {bookings.map((booking) => {
            const trImage = getTreatmentImage(booking.treatmentId);
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-surface border border-outline-variant/20 gap-4"
              >
                <div className="flex items-center gap-4">
                  {trImage && (
                    <img
                      src={trImage}
                      alt="Tratamento"
                      className="w-16 h-16 object-cover rounded-lg shrink-0 border border-outline-variant/10"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-primary">
                      {getTreatmentName(booking.treatmentId)}
                    </h4>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                      Paciente: <span className="text-on-surface">{booking.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-secondary" />
                        {booking.date.split('-').reverse().join('/')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-secondary" />
                        {booking.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-outline-variant/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2.5 py-1 mr-2">
                    Aguardando Confirmação
                  </span>
                  
                  <button
                    onClick={() => openWhatsAppConfirm(booking)}
                    title="Confirmar via WhatsApp"
                    className="p-2 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onCancelBooking(booking.id)}
                    title="Excluir Solicitação"
                    className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
