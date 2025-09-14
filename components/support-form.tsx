'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Send, Star } from 'lucide-react';

export function SupportForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message, rating }),
      });

      if (response.ok) {
        toast({
          title: 'Feedback sent!',
          description:
            'Thank you for your feedback. We appreciate your input.',
        });
        setName('');
        setEmail('');
        setMessage('');
        setRating(0);
      } else {
        throw new Error('Something went wrong');
      }
    } catch (error) {
      toast({
        title: 'An error occurred.',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label>Rate Your Experience</Label>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-colors ${
                  rating >= star ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <Star className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help you? Or what feedback do you have?"
            required
            className="mt-1"
            rows={6}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Message'}
          <Send className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  );
}
