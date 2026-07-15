import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, User, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import { Treatment } from '../types';
import { TREATMENTS } from '../data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTreatmentId?: string;
  onBookingSuccess: (booking: any) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedTreatmentId = '',
  onBookingSuccess,
}: BookingModalProps) {
  const [treatmentId, setTreatmentId] = useState(selectedTreatmentId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync state if selectedTreatmentId changes
  React.useEffect(() => {
    if (selectedTreatmentId) {
      setTreatmentId(selectedTreatmentId);
    }
  }, [selectedTreatmentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !date || !time || !treatmentId) return;

    const newBooking = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      treatmentId,
      date,
      time,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('central_estetica_bookings') || '[]');
    localStorage.setItem('central_estetica_bookings', JSON.stringify([newBooking, ...existingBookings]));

    setIsSubmitted(true);
    onBookingSuccess(newBooking);
  };

  const selectedTreatment = TREATMENTS.find((t) => t.id === treatmentId);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDate('');
    setTime('');
    setNotes('');
    setIsSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const openWhatsApp = () => {
    const text = `Olá! Gostaria de confirmar meu agendamento na Central da Estética:\n\n*Procedimento:* ${selectedTreatment?.name}\n*Nome:* ${name}\n*Data:* ${date.split('-').reverse().join('/')}\n*Horário:* ${time}\n\nObrigado!`;
    const url = `https://wa.me/551130521400?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl md:p-8 z-10"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {!isSubmitted ? (
              <div>
                <div className="mb-6">
                  <h3 className="font-serif text-2xl font-semibold text-primary">Agendar Consulta</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Preencha os dados abaixo e escolha o melhor horário. Entraremos em contato para confirmar.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Treatment */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Procedimento / Tratamento
                    </label>
                    <select
                      value={treatmentId}
                      onChange={(e) => setTreatmentId(e.target.value)}
                      required
                      className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    >
                      <option value="" disabled>Selecione um tratamento...</option>
                      <optgroup label="Estética Facial">
                        {TREATMENTS.filter((t) => t.category === 'facial').map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Estética Corporal">
                        {TREATMENTS.filter((t) => t.category === 'corporal').map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Bem-estar & Relaxamento">
                        {TREATMENTS.filter((t) => t.category === 'bem-estar').map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Marina Silva Santos"
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Contact Row (Email & Phone) */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        E-mail
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="marina@email.com"
                          required
                          className="w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        WhatsApp / Celular
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                          <Phone className="h-4 w-4" />
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          required
                          className="w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Data Preferida
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Horário Preferido
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                          <Clock className="h-4 w-4" />
                        </span>
                        <select
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                          className="w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        >
                          <option value="" disabled>Escolha...</option>
                          <option value="09:00">09:00</option>
                          <option value="10:00">10:00</option>
                          <option value="11:00">11:00</option>
                          <option value="13:00">13:00</option>
                          <option value="14:00">14:00</option>
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                          <option value="17:00">17:00</option>
                          <option value="18:00">18:00</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes input */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Observações ou dúvidas (Opcional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-on-surface-variant">
                        <FileText className="h-4 w-4" />
                      </span>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex: Gostaria de focar na região da testa. Tenho pele sensível."
                        rows={2}
                        className="w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="primary-gradient w-full cursor-pointer rounded-full py-3 font-semibold text-white shadow-premium transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Agendar Horário
                  </button>
                </form>
              </div>
            ) : (
              /* Success Screen */
              <div className="flex flex-col items-center text-center py-6">
                <div className="mb-4 rounded-full bg-green-50 p-3 text-green-500">
                  <CheckCircle className="h-16 w-16" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-primary mb-2">Solicitação Enviada!</h3>
                <p className="text-sm text-on-surface-variant max-w-md mb-6">
                  Olá, <span className="font-bold">{name}</span>! Sua pré-reserva de consulta para{' '}
                  <span className="font-bold text-primary">{selectedTreatment?.name}</span> foi registrada para{' '}
                  <span className="font-bold">{date.split('-').reverse().join('/')}</span> às{' '}
                  <span className="font-bold">{time}</span>.
                </p>

                <div className="w-full space-y-3">
                  <button
                    onClick={openWhatsApp}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                  >
                    <svg
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.456h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Confirmar no WhatsApp
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full text-center text-sm font-semibold text-primary hover:underline py-2"
                  >
                    Voltar para o site
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
