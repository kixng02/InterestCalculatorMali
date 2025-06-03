import InterestCalculator from '@/components/interest-calculator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <InterestCalculator />
    </main>
  );
}
