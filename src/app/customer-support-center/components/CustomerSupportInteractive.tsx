'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getFAQsByCategory,
  submitFAQFeedback,
  getUserTickets,
  createSupportTicket,
  FAQ,
  SupportTicket,
} from '@/services/supportService';
import { useAuth } from '@/contexts/AuthContext';

type SupportTab = 'faqs' | 'contact' | 'tickets';
type FAQCategory = 'ordering' | 'shipping' | 'returns' | 'payments' | 'technical' | 'account';

interface FAQWithFeedback extends FAQ {
  userFeedback?: boolean | null;
}

export default function CustomerSupportInteractive() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SupportTab>('faqs');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQWithFeedback[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQWithFeedback[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Ticket state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: 'general' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority'],
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  // Load FAQs
  useEffect(() => {
    const loadFAQs = async () => {
      setLoading(true);
      const { data } = await getFAQsByCategory(selectedCategory || undefined);
      if (data) {
        setFaqs(data);
        setFilteredFaqs(data);
      }
      setLoading(false);
    };

    loadFAQs();
  }, [selectedCategory]);

  // Load user tickets
  useEffect(() => {
    if (user && activeTab === 'tickets') {
      const loadTickets = async () => {
        const { data } = await getUserTickets();
        if (data) setTickets(data);
      };
      loadTickets();
    }
  }, [user, activeTab]);

  // Search FAQs
  useEffect(() => {
    if (searchQuery) {
      const searchResults = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFaqs(searchResults);
    } else {
      setFilteredFaqs(faqs);
    }
  }, [searchQuery, faqs]);

  const handleFAQFeedback = async (faqId: string, isHelpful: boolean) => {
    if (!user) return;

    await submitFAQFeedback(faqId, isHelpful);

    // Update local state
    setFaqs(
      faqs.map((faq) =>
        faq.id === faqId
          ? {
              ...faq,
              userFeedback: isHelpful,
              helpful_count: isHelpful ? faq.helpful_count + 1 : faq.helpful_count,
              not_helpful_count: !isHelpful ? faq.not_helpful_count + 1 : faq.not_helpful_count,
            }
          : faq
      )
    );
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await createSupportTicket(ticketForm);

    if (data && !error) {
      setTickets([data, ...tickets]);
      setShowTicketForm(false);
      setTicketForm({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium',
      });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send an email or create a ticket
    alert('Thank you for contacting us! We will get back to you within 24 hours.');
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const categoryLabels: Record<FAQCategory, string> = {
    ordering: 'Ordering',
    shipping: 'Shipping & Delivery',
    returns: 'Returns & Refunds',
    payments: 'Payments',
    technical: 'Technical Support',
    account: 'Account Management',
  };

  const ticketCategoryLabels = {
    order: 'Order Issue',
    product: 'Product Question',
    technical: 'Technical Problem',
    account: 'Account Issue',
    general: 'General Inquiry',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold">Customer Support Center</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
          <p className="text-xl text-indigo-100 mb-8">
            How can we help you today? Find answers, submit tickets, or contact our support team.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-200">Average Response Time</p>
                  <p className="text-2xl font-bold">2-4 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-200">Support Email</p>
                  <p className="text-lg font-semibold">Kamarofisto@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-200">WhatsApp Support</p>
                  <a
                    href="https://wa.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold hover:text-indigo-200 transition-colors"
                  >
                    Chat with us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'faqs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              FAQs & Help Center
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'contact'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Contact Support
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'tickets'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                My Tickets
                {tickets.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                    {tickets.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div>
            {/* Search and Filter */}
            <div className="mb-8">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedCategory === ''
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Topics
                </button>
                {(Object.keys(categoryLabels) as FAQCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQs List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No FAQs found</h3>
                <p className="mt-2 text-gray-600">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1 text-left">
                        <span className="flex-shrink-0 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                          {categoryLabels[faq.category]}
                        </span>
                        <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-6">
                        <div className="pl-24 pt-2">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </p>

                          {/* Feedback */}
                          <div className="mt-6 pt-4 border-t">
                            <p className="text-sm text-gray-600 mb-3">Was this helpful?</p>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleFAQFeedback(faq.id, true)}
                                disabled={!user}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                  />
                                </svg>
                                <span>Yes ({faq.helpful_count})</span>
                              </button>
                              <button
                                onClick={() => handleFAQFeedback(faq.id, false)}
                                disabled={!user}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                                  />
                                </svg>
                                <span>No ({faq.not_helpful_count})</span>
                              </button>
                            </div>
                            {!user && (
                              <p className="mt-2 text-sm text-gray-500">
                                Sign in to provide feedback
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Our Support Team</h2>

              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>

              {/* Alternative Contact Methods */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Email:{' '}
                      <a
                        href="mailto:Kamarofisto@gmail.com"
                        className="text-indigo-600 hover:underline"
                      >
                        Kamarofisto@gmail.com
                      </a>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      WhatsApp:{' '}
                      <a
                        href="https://wa.me/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Chat with us
                      </a>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Business Hours: Monday - Saturday, 8:00 AM - 8:00 PM EAT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && user && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Support Tickets</h2>
              <button
                onClick={() => setShowTicketForm(!showTicketForm)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showTicketForm ? 'Cancel' : 'Create New Ticket'}
              </button>
            </div>

            {/* Ticket Form */}
            {showTicketForm && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Support Ticket</h3>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={ticketForm.category}
                        onChange={(e) =>
                          setTicketForm({ ...ticketForm, category: e.target.value as any })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        {Object.entries(ticketCategoryLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority *
                      </label>
                      <select
                        required
                        value={ticketForm.priority}
                        onChange={(e) =>
                          setTicketForm({ ...ticketForm, priority: e.target.value as any })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={ticketForm.description}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, description: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Please provide detailed information about your issue..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Submit Ticket
                  </button>
                </form>
              </div>
            )}

            {/* Tickets List */}
            {tickets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No tickets yet</h3>
                <p className="mt-2 text-gray-600">Create your first support ticket to get help</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/customer-support-center?ticket=${ticket.id}`}
                    className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-gray-500">
                            {ticket.ticket_number}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              ticket.status === 'open'
                                ? 'bg-blue-100 text-blue-700'
                                : ticket.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : ticket.status === 'resolved'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              ticket.priority === 'urgent'
                                ? 'bg-red-100 text-red-700'
                                : ticket.priority === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : ticket.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {ticket.subject}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">{ticket.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span className="text-indigo-600 font-medium">View Details →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {!user && activeTab === 'tickets' && (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Sign in Required</h3>
            <p className="mt-2 text-gray-600 mb-4">
              Please sign in to view and manage your support tickets
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
