
"use client";
import { usePDF } from 'react-to-pdf';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
type CompoundInterval = 'annually' | 'monthly' | 'daily' | 'quarterly';

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

  useEffect(() => {
    // Initialize with empty strings or default values that trigger calculation
    // For example, setting to '0' or valid initial values if preferred
    setPrincipal(''); 
    setAnnualRate('');
    setYears([1]); // Default to 1 year or a sensible minimum
    // No need to explicitly call calculateInterest here if useEffect for it depends on these states
  }, []); // Empty dependency array ensures this runs only on mount

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
    const P_val = parseFloat(principal);
    const rate_val = parseFloat(annualRate);

    if (principalError || annualRateError || principal === "" || annualRate === "") {
      setTotalBalance( (principalError || isNaN(P_val) || P_val < 0 || principal === "") ? 0 : P_val);
      setInterestEarned(0);
      return;
    }

    const P = P_val;
    const ratePercent = rate_val;
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
      case 'quarterly':
        n = 4;
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
    if (isNaN(value)) return '$0.00'; // Handle NaN case gracefully
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const { targetRef, toPDF } = usePDF({filename: 'ai-interest-math-report.pdf'});
  
  const handleDownload = () => {
    toPDF();
  };
  
  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">A.I interest-math</CardTitle>
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
              <SelectItem value="quarterly">Quarterly</SelectItem>
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
         <div className="w-full space-y-3 pt-6">
          <div>
            <p className="text-muted-foreground">Projected Interest Earned:</p>
            <p className="text-3xl font-bold text-accent">{formatCurrency(interestEarned)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Future Balance:</p>
            <p className="text-3xl font-bold text-accent">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </CardContent>
      <Separator className="my-6" />
      <CardFooter className="flex flex-col items-start space-y-4 px-6 pb-6">
       
        
        <Separator className="my-6" />

        <div ref={targetRef} className="w-full space-y-4">
          <h2 className="text-2xl font-bold text-primary mb-4">A.I interest-math Compound Interest Report</h2>

          <div className="space-y-2 mb-4">
            <p><strong className="text-foreground">Principal Amount:</strong> {formatCurrency(parseFloat(principal))}</p>
            <p><strong className="text-foreground">Annual Interest Rate:</strong> {annualRate || '0'}%</p>
            <p><strong className="text-foreground">Investment Timeframe:</strong> {years[0]} years</p>
            <p><strong className="text-foreground">Compound Interval:</strong> {compoundInterval.charAt(0).toUpperCase() + compoundInterval.slice(1)}</p>
          </div>

          <Separator className="my-4" />

          <h3 className="text-xl font-semibold text-primary mb-2">Calculation Formula</h3>

          <div className="space-y-2 text-sm">
            <p className="text-foreground">The compound interest formula used is:</p>
            <p className="font-mono p-2 bg-muted rounded-md text-center">A = P (1 + r/n)^(nt)</p>
            <p className="text-foreground">Where:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>A = the future value of the investment/loan, including interest</li>
              <li>P = principal investment amount ({formatCurrency(parseFloat(principal))})</li>
              <li>r = annual interest rate as a decimal ({(parseFloat(annualRate) / 100) || 0})</li>
              <li>n = number of times interest is compounded per year ({
                  compoundInterval === 'annually' ? 1 : 
                  compoundInterval === 'quarterly' ? 4 :
                  compoundInterval === 'monthly' ? 12 : 
                  (compoundInterval === 'daily' ? 365 : 'N/A')
              })</li>
              <li>t = number of years the money is invested or borrowed for ({years[0]})</li>
            </ul>
          </div>
        </div>

        <Button onClick={handleDownload} className="w-full mt-6 py-3 text-base">
          Download Report as PDF
        </Button>
      </CardFooter>
    </Card>
  );
}

