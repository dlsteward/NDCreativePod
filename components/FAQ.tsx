'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQProps {
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQ({ onClose }: FAQProps) {
  const faqItems: FAQItem[] = [
    {
      category: "General Questions",
      question: "What is a penpal exchange?",
      answer: "A penpal exchange involves corresponding with someone from a different location through letters, emails, or other formats to build a friendship and share experiences."
    },
    {
      category: "General Questions",
      question: "How do I find a penpal?",
      answer: "You can find a penpal through online platforms, social media groups, or penpal organizations. Many websites allow you to specify interests and preferences for better matches."
    },
    {
      category: "Friend Books (FBs)",
      question: "What is a Friend Book?",
      answer: "A Friend Book is a small booklet where multiple penpals contribute entries about themselves, often decorated with art and personal touches."
    },
    {
      category: "Friend Books (FBs)",
      question: "How do I complete a Friend Book?",
      answer: "Write your entry, decorate it, and follow any specific instructions included. Then send it to the next person on the list."
    },
    {
      category: "Art Journals",
      question: "What is an art journal?",
      answer: "An art journal is a personal book where you can express your creativity through art, writing, and mixed media."
    },
    {
      category: "Art Journals",
      question: "Can I use any materials in my art journal?",
      answer: "Yes! You can use various materials like paints, markers, and collage items, as long as they don't damage the journal."
    },
    {
      category: "Zines",
      question: "What is a zine?",
      answer: "A zine is a self-published booklet that can include articles, artwork, poetry, and personal stories, often focused on a specific theme."
    },
    {
      category: "Zines",
      question: "How long should my zine be?",
      answer: "There's no strict rule, but a zine typically ranges from a few pages to around 20 pages, depending on your content."
    },
    {
      category: "Regular Letters",
      question: "What should I write in my letters?",
      answer: "Share your daily life, interests, thoughts, and ask questions to engage your penpal in conversation."
    },
    {
      category: "Regular Letters",
      question: "How often should we exchange letters?",
      answer: "It's up to you and your penpal! Discuss and agree on a frequency that works for both of you."
    },
    {
      category: "Gift Exchanges",
      question: "What kind of gifts can I send?",
      answer: "Consider sending small, thoughtful items that reflect your penpal's interests, like handmade crafts, local treats, or stationery."
    },
    {
      category: "Gift Exchanges",
      question: "Do I need to include a note with my gift?",
      answer: "Yes! Including a note adds a personal touch and explains why you chose that particular gift."
    }
  ];

  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter(i => i !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };

  // Get unique categories
  const categories = Array.from(new Set(faqItems.map(item => item.category)));

  return (
    <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="modal-content rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-20 hover:bg-black"
          aria-label="Close"
        >
          <X size={24} style={{ color: 'var(--muted)' }} />
        </button>
        
        <div className="p-6 pb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className={categoryIndex > 0 ? "section-border" : ""}>
                <h3 className="text-xl font-medium mb-3" style={{ color: 'var(--primary)' }}>{category}</h3>
                {faqItems
                  .filter(item => item.category === category)
                  .map((item, index) => {
                    const globalIndex = faqItems.findIndex(faq => faq.question === item.question);
                    const isExpanded = expandedItems.includes(globalIndex);
                    
                    return (
                      <div 
                        key={index} 
                        className="themed-border mb-2 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full flex justify-between items-center p-4 text-left font-medium hover:bg-opacity-10 hover:bg-black focus:outline-none"
                          style={{ color: 'var(--foreground)' }}
                        >
                          <span>{item.question}</span>
                          {isExpanded ? 
                            <ChevronUp size={18} style={{ color: 'var(--primary)' }} /> : 
                            <ChevronDown size={18} style={{ color: 'var(--primary)' }} />
                          }
                        </button>
                        {isExpanded && (
                          <div className="p-4 pt-0 border-t" style={{ borderColor: 'var(--card-border)' }}>
                            <p className="high-contrast-text">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
            
            <div className="text-center mt-4" style={{ color: 'var(--muted)' }}>
              If you have more questions, feel free to reach out to your penpal or the community for assistance!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}