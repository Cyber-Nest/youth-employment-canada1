import { useState, type FormEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Mail, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

function OrganicShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="1" opacity="0.12" />
      <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
      <circle cx="200" cy="200" r="30" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !inquiryType.trim() || !message.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, inquiryType, message }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to send your message.');
      }
      setFormSuccess(data?.message || 'Message sent successfully.');
      setFirstName('');
      setLastName('');
      setEmail('');
      setInquiryType('');
      setMessage('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to send your message.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Youth Employment Canada — Canada's Youth Employment Network</title>
        <meta name="description" content="Get in touch with the Youth Employment Canada team. We're here to help job seekers and employers connect across Canada." />
      </Helmet>

      {/* Hero */}
      <section className="bg-[#F8FAFC] py-16 lg:py-24 relative overflow-hidden">
        <OrganicShape className="absolute -right-24 top-1/2 -translate-y-1/2 w-[400px] h-[400px] text-[#2563EB] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="text-[#2563EB] font-semibold text-sm uppercase tracking-widest mb-3">Get in Touch</motion.p>
            <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-bold text-[#0F172A] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              We're Here to Help
            </motion.h1>
            <motion.p variants={fadeUp} className="text-[#475569]/70 text-lg max-w-xl mx-auto leading-relaxed">
              Have a question about posting a job, creating a profile, or our packages? Our team is ready to assist you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="bg-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#1C1C1C] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Information</h2>
              <div className="flex flex-col gap-6 mb-10">
                {[
                  { icon: Mail, label: 'Email', value: 'info.youthemployment@cyber-nest.ca', href: 'mailto:info.youthemployment@cyber-nest.ca' },
                  { icon: MapPin, label: 'Service Area', value: 'Canada-Wide', href: null },
                  { icon: Clock, label: 'Support Hours', value: 'Monday – Friday, 9am – 5pm MT', href: null },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#475569]/50 uppercase tracking-wider mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-[#0F172A] font-medium hover:text-[#2563EB] transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-[#0F172A] font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#0F172A] rounded-2xl p-7 text-white relative overflow-hidden">
                <OrganicShape className="absolute -right-10 -bottom-10 w-48 h-48 text-[#2563EB] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Employer Inquiries</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    Interested in posting jobs or learning about our packages? We'd love to connect and help you find the right solution.
                  </p>
                  <a href="mailto:employer.youth@cyber-nest.ca" className="text-[#2563EB] font-semibold text-sm hover:underline">
                    employer.youth@cyber-nest.ca
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-3">
              <div className="bg-[#F8FAFC] rounded-3xl p-8 lg:p-10 border border-[#2563EB]/10">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-7" style={{ fontFamily: "'Playfair Display', serif" }}>Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="firstName" className="text-[#0F172A] font-medium text-sm">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Your first name"
                        className="bg-white border-[#2563EB]/20 focus-visible:ring-[#2563EB]/30"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="lastName" className="text-[#0F172A] font-medium text-sm">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Your last name"
                        className="bg-white border-[#2563EB]/20 focus-visible:ring-[#2563EB]/30"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-[#0F172A] font-medium text-sm">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-white border-[#2563EB]/20 focus-visible:ring-[#2563EB]/30"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="subject" className="text-[#0F172A] font-medium text-sm">I am a...</Label>
                    <select
                      id="subject"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full rounded-md border border-[#2563EB]/20 bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                    >
                      <option value="">Select one</option>
                      <option value="jobseeker">Job Seeker</option>
                      <option value="employer">Employer</option>
                      <option value="organization">Youth Organization</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="message" className="text-[#0F172A] font-medium text-sm">Message</Label>
                    <textarea
                      id="message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      className="w-full rounded-md border border-[#2563EB]/20 bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#0F172A]/40 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 resize-none"
                    />
                  </div>
                  {formError && (
                    <p className="text-sm text-red-600">{formError}</p>
                  )}
                  {formSuccess && (
                    <p className="text-sm text-[#2F855A]">{formSuccess}</p>
                  )}
                  <Button type="submit" size="lg" disabled={submitting} className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white font-semibold w-full">
                    {submitting ? 'Sending…' : 'Send Message'} <Send size={16} className="ml-2" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
