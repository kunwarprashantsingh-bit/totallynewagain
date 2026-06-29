import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { NEWS_TOPICS } from '../constants';
import { subscribeToNewsletter } from '../services/api';

const NewsletterSubscription = () => {
  const [email, setEmail] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const topics = [...NEWS_TOPICS];

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setErrorMessage("Please enter your email.");
      return;
    }
    if (selectedTopics.length === 0) {
      setStatus('error');
      setErrorMessage("Please select at least one topic.");
      return;
    }

    setStatus('loading');
    try {
      await subscribeToNewsletter(email, selectedTopics);
      setStatus('success');
      setEmail("");
      setSelectedTopics([]);
    } catch (error) {
      setStatus('error');
      setErrorMessage("Subscription failed. Please try again.");
    }
  };

  return (
    <div className="bg-brand-light/30 border border-white/10 rounded-3xl p-8 mt-12 flex flex-col items-center text-center">
      <div className="max-w-2xl w-full">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
          <Mail className="w-3 h-3" />
          Stay Informed
        </div>
        <h3 className="text-3xl font-bold mb-4">Subscribe to Industrial Insights</h3>
        <p className="text-white/50 leading-relaxed mb-8">
          Get 5 re-written articles per day from global sources, delivered to your inbox. 
          Starting March 16, 2026. No duplicates, just pure foresight.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                selectedTopics.includes(topic)
                  ? "bg-accent border-accent text-brand"
                  : "bg-white/5 border-white/10 text-white/40 hover:border-accent/50"
              )}
            >
              {topic}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your professional email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-light/50 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-accent transition-all text-center"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-accent text-brand font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
          </button>
          {status === 'success' && (
            <p className="text-emerald-400 text-sm font-bold text-center">
              Successfully subscribed! Welcome to the Survvi Opulence Insights network.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm font-bold text-center">
              {errorMessage}
            </p>
          )}
        </form>
        <p className="text-[10px] text-white/20 text-center mt-4 uppercase tracking-widest">
          Free subscription. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default NewsletterSubscription;
