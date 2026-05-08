import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

const contactDetails = [
  { Icon: HiOutlineMail, label: 'Email', value: 'hello@chaiheritage.co.ke' },
  { Icon: HiOutlinePhone, label: 'Phone', value: '+254 700 000 000' },
  { Icon: HiOutlineLocationMarker, label: 'Address', value: 'Westlands, Nairobi, Kenya' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: '', email: '', subject: '', message: '' });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <section className="bg-primary-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-cream-200 text-lg">We'd love to hear from you</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl font-bold text-espresso-500 mb-6">Contact Information</h2>
            <div className="space-y-4 mb-8">
              {contactDetails.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-espresso-500">{label}</p>
                    <p className="text-cream-500">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
              <p className="text-sm text-primary-500 font-medium">Business Hours</p>
              <p className="text-cream-500 text-sm mt-1">Monday – Friday: 8am – 6pm EAT</p>
              <p className="text-cream-500 text-sm">Saturday: 9am – 2pm EAT</p>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="font-serif text-2xl font-bold text-espresso-500 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="input-field" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Subject</label>
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required className="input-field" />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required rows={5} className="input-field" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
