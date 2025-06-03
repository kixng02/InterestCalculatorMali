
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type CompoundInterval = 'annually' | 'monthly' | 'daily';

const yearIntervals = [1, 15, 30, 45, 60, 75];

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState<string>('10000');
  const [annualRate, setAnnualRate] = useState<string>('5');
  const [years, setYears] = useState<number[]>([10]);
  const [compoundInterval, setCompoundInterval] = useState<CompoundInterval>('annually');

  const [principalError, setPrincipalError] = useState<string | null>(null);
  const [annualRateError, setAnnualRateError] = useState<string | null>(null);

  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [interestEarned, setInterestEarned] = useState<number>(0);

  const createInputHandler = (
    setValue: React.Dispatch<React.SetStateAction<string>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    fieldName: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    setValue(currentValue);

    if (currentValue === "") {
      setError(null);
      return;
    }

    if (/[a-zA-Z]/.test(currentValue)) {
      setError(`Letters are not allowed in ${fieldName}. Please enter a valid number.`);
      return;
    }
    
    const isValidNumericStructure = /^\d*\.?\d*$/.test(currentValue);
    if (!isValidNumericStructure) {
        setError(`Invalid format for ${fieldName}. Please use numbers and at most one decimal point.`);
        return;
    }

    const numValue = parseFloat(currentValue);

    if (currentValue !== "." && !/^\d+\.$/.test(currentValue) && isNaN(numValue) ) {
      setError(`Invalid number format for ${fieldName}.`);
      return;
    }

    if (numValue < 0) {
      setError(`${fieldName} cannot be negative.`);
      return;
    }

    setError(null);
  };

  const handlePrincipalChange = createInputHandler(setPrincipal, setPrincipalError, 'Principal Amount');
  const handleAnnualRateChange = createInputHandler(setAnnualRate, setAnnualRateError, 'Annual Interest Rate');

  const calculateInterest = useCallback(() => {
    if (principalError || annualRateError) {
      const P_val = parseFloat(principal);
      setTotalBalance( (principalError || isNaN(P_val) || P_val < 0) ? 0 : P_val);
      setInterestEarned(0);
      return;
    }

    const P = parseFloat(principal);
    const ratePercent = parseFloat(annualRate);
    const t = years[0];

    if (isNaN(P) || P <= 0 || isNaN(ratePercent) || ratePercent < 0 || isNaN(t) || t < 0) {
      setTotalBalance(P > 0 && !isNaN(P) ? P : 0);
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
    
    const actualRate = ratePercent / 100;

    if (actualRate === 0) {
        const calculatedTotal = P;
        setTotalBalance(calculatedTotal);
        setInterestEarned(0);
        return;
    }

    const amount = P * Math.pow(1 + actualRate / n, n * t);
    
    setTotalBalance(amount);
    setInterestEarned(amount - P);
  }, [principal, annualRate, years, compoundInterval, principalError, annualRateError]);

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
          <div className="flex items-center space-x-2">
            <Input
              id="principal"
              type="text"
              value={principal}
              onChange={handlePrincipalChange}
              placeholder="e.g., 10000"
              className={cn(principalError && "border-destructive focus-visible:ring-destructive")}
              aria-describedby={principalError ? "principal-error-message" : undefined}
            />
            {principalError && <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />}
          </div>
          {principalError && <p id="principal-error-message" className="text-sm text-destructive">{principalError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="annualRate" className="font-semibold">Annual Interest Rate (%)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="annualRate"
              type="text"
              value={annualRate}
              onChange={handleAnnualRateChange}
              placeholder="e.g., 5"
              className={cn(annualRateError && "border-destructive focus-visible:ring-destructive")}
              aria-describedby={annualRateError ? "annualRate-error-message" : undefined}
            />
            {annualRateError && <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />}
          </div>
          {annualRateError && <p id="annualRate-error-message" className="text-sm text-destructive">{annualRateError}</p>}
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
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            {yearIntervals.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
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
