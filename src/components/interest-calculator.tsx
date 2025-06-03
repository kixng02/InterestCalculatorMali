"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

type CompoundInterval = 'annually' | 'monthly' | 'daily';

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState<string>('10000');
  const [annualRate, setAnnualRate] = useState<string>('5');
  const [years, setYears] = useState<number[]>([10]);
  const [compoundInterval, setCompoundInterval] = useState<CompoundInterval>('annually');

  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [interestEarned, setInterestEarned] = useState<number>(0);

  const calculateInterest = useCallback(() => {
    const P = parseFloat(principal);
    const rate = parseFloat(annualRate) / 100;
    const t = years[0];

    if (isNaN(P) || P <= 0 || isNaN(rate) || rate < 0 || isNaN(t) || t < 0) {
      setTotalBalance(P > 0 ? P : 0); // Show principal if valid, else 0
      setInterestEarned(0);
      return;
    }

    let n: number;
    switch (compoundInterval) {
      case 'daily':
        n = 365;
        break;
      case 'monthly':
        n = 12;
        break;
      case 'annually':
      default:
        n = 1;
        break;
    }

    if (rate === 0) {
        const calculatedTotal = P;
        setTotalBalance(calculatedTotal);
        setInterestEarned(0);
        return;
    }

    const amount = P * Math.pow(1 + rate / n, n * t);
    
    setTotalBalance(amount);
    setInterestEarned(amount - P);
  }, [principal, annualRate, years, compoundInterval]);

  useEffect(() => {
    calculateInterest();
  }, [calculateInterest]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">FutureSight</CardTitle>
        <CardDescription className="text-lg">Compound Interest Calculator</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="principal" className="font-semibold">Principal Amount ($)</Label>
          <Input
            id="principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g., 10000"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="annualRate" className="font-semibold">Annual Interest Rate (%)</Label>
          <Input
            id="annualRate"
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g., 5"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compoundInterval" className="font-semibold">Compound Interval</Label>
          <Select value={compoundInterval} onValueChange={(value: CompoundInterval) => setCompoundInterval(value)}>
            <SelectTrigger id="compoundInterval">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="annually">Annually</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="years" className="font-semibold">Investment Timeframe (Years)</Label>
            <span className="text-sm text-muted-foreground">{years[0]} Year{years[0] === 1 ? '' : 's'}</span>
          </div>
          <Slider
            id="years"
            value={years}
            onValueChange={setYears}
            min={1}
            max={75}
            step={1}
            aria-label={`Investment timeframe: ${years[0]} years`}
          />
        </div>
      </CardContent>
      <Separator className="my-6" />
      <CardFooter className="flex flex-col items-start space-y-4">
        <div className="w-full">
          <p className="text-sm text-muted-foreground">Projected Interest Earned:</p>
          <p className="text-2xl font-bold text-accent">{formatCurrency(interestEarned)}</p>
        </div>
        <div className="w-full">
          <p className="text-sm text-muted-foreground">Total Future Balance:</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
