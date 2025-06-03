"use client";

import { useState } from 'react'; // Make sure useState is imported
import InterestCalculator from '@/components/interest-calculator';

export default function Home() {
  const [suggestion, setSuggestion] = useState(''); // Add state for the suggestion input

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!suggestion.trim()) {
      return; // Don't submit empty suggestions
    }

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suggestion }),
      });

      if (response.ok) {
        setSuggestion(''); // Clear the input on success
        alert('Suggestion submitted successfully!'); // Optional: provide feedback
      } else {
        alert('Failed to submit suggestion.'); // Optional: provide feedback on error
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('An error occurred while submitting your suggestion.'); // Optional: provide feedback
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <InterestCalculator />

      {/* New section for suggestions */}
      <section className="mt-12 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-primary mb-4">Want more calculators?</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4"> {/* Add onSubmit handler */}
          <div>
            <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700">Suggest a calculator:</label>
            <input
              type="text"
              id="suggestion"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., Mortgage Calculator"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Submit Suggestion
          </button>
        </form>
      </section>
    </main>
  );
}

