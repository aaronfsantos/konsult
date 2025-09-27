'use client';

import { FAQList } from "@/components/faq-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Find answers to common questions about our company policies and procedures.
        </p>
      </header>
      
      <Card>
        <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>Browse through the categories or use the search to find what you're looking for.</CardDescription>
        </CardHeader>
        <CardContent>
             <FAQList />
        </CardContent>
      </Card>

    </div>
  );
}
