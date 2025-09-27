'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { Faq } from '@/models/faq';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function FAQList() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const faqsCollectionRef = collection(db, 'faqs');

    const unsubscribe = onSnapshot(
      faqsCollectionRef,
      (querySnapshot) => {
        const fetchedFaqs: Faq[] = [];
        querySnapshot.forEach((doc) => {
          fetchedFaqs.push({ id: doc.id, ...doc.data() } as Faq);
        });
        setFaqs(fetchedFaqs);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching FAQs:', err);
        setError('Failed to fetch FAQs. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const allCategories = new Set(faqs.map((faq) => faq.category));
    return ['all', ...Array.from(allCategories)];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs
      .filter((faq) =>
        categoryFilter === 'all' ? true : faq.category === categoryFilter
      )
      .filter((faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [faqs, searchTerm, categoryFilter]);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading FAQs...</p>
      </div>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search questions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredFaqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.map((faq) => (
            <AccordionItem value={faq.id} key={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none text-muted-foreground break-words whitespace-pre-line">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center text-muted-foreground py-12">
            <p>No FAQs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
