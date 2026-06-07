'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
} from 'libphonenumber-js/min';
import type { CountryCode } from 'libphonenumber-js/min';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { cn } from '../lib/utils';

export type PhoneInputValue = string | undefined;
export type PhoneInputCountry = CountryCode;

export interface PhoneInputFieldProps {
  value?: PhoneInputValue;
  onChange?: (value?: PhoneInputValue) => void;
  error?: string;
  id?: string;
  disabled?: boolean;
  defaultCountry?: PhoneInputCountry;
  countries?: PhoneInputCountry[];
  placeholder?: string;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
}

const ALL_COUNTRIES = getCountries() as readonly CountryCode[];

function getCountryName(countryCode: CountryCode): string {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

interface CountryOption {
  code: CountryCode;
  callingCode: string;
  name: string;
  search: string;
}

function buildCountryList(countries: readonly CountryCode[]): CountryOption[] {
  return [...countries]
    .map((code) => ({
      code,
      callingCode: getCountryCallingCode(code),
      name: getCountryName(code),
      search: `${getCountryCallingCode(code)} ${getCountryName(code)} ${code}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const COUNTRY_LIST = buildCountryList(ALL_COUNTRIES);

function parseE164(value: string | undefined): { country: CountryCode; nationalNumber: string } {
  const defaultCountry: CountryCode = 'US';

  if (!value) {
    return { country: defaultCountry, nationalNumber: '' };
  }

  try {
    const phoneNumber = parsePhoneNumber(value);
    if (phoneNumber) {
      return {
        country: phoneNumber.country || defaultCountry,
        nationalNumber: phoneNumber.nationalNumber,
      };
    }
  } catch {
    // not a valid E.164, try to extract digits
  }

  const digits = value.replace(/\D/g, '');

  if (value.startsWith('+')) {
    for (const country of ALL_COUNTRIES) {
      const callingCode = getCountryCallingCode(country);
      if (digits.startsWith(callingCode)) {
        return {
          country,
          nationalNumber: digits.slice(callingCode.length),
        };
      }
    }
    return { country: defaultCountry, nationalNumber: digits.slice(1) };
  }

  return { country: defaultCountry, nationalNumber: digits };
}

function findCountryOption(code: CountryCode, list: CountryOption[]): CountryOption {
  return list.find((c) => c.code === code) || list.find((c) => c.code === 'US') || list[0];
}

const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputFieldProps>(
  (
    {
      value,
      onChange,
      error,
      id,
      disabled = false,
      defaultCountry = 'US',
      countries,
      placeholder = 'Enter phone number',
      name,
      onBlur,
      onFocus,
    },
    ref,
  ) => {
    const [internalCountry, setInternalCountry] = React.useState<CountryCode>(defaultCountry);
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    const countryList = React.useMemo(
      () => (countries ? buildCountryList(countries) : COUNTRY_LIST),
      [countries],
    );

    const parsed = React.useMemo(() => parseE164(value), [value]);
    const selectedOption = React.useMemo(
      () => findCountryOption(internalCountry, countryList),
      [internalCountry, countryList],
    );

    const nationalNumberRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (parsed.country) {
        setInternalCountry(parsed.country);
      }
    }, [parsed.country]);

    const selectCountry = (code: CountryCode) => {
      setInternalCountry(code);
      setPopoverOpen(false);

      const currentDigits = nationalNumberRef.current?.value.replace(/\D/g, '') || '';
      const callingCode = getCountryCallingCode(code);

      if (currentDigits) {
        onChange?.(`+${callingCode}${currentDigits}`);
      } else {
        onChange?.(`+${callingCode}`);
      }

      nationalNumberRef.current?.focus();
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '');
      const clamped = digits.slice(0, 15);
      const callingCode = getCountryCallingCode(internalCountry);

      if (clamped) {
        onChange?.(`+${callingCode}${clamped}`);
      } else {
        onChange?.(`+${callingCode}`);
      }
    };

    // Input component base styles (matching the Grade input field)
    const inputBaseStyles = cn(
      'h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-4 py-3 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
      'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
      'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    );

    return (
      <div ref={ref} className="w-full">
        <div className="flex gap-2">
          {/* Country Code Selector Box */}
          <Popover open={popoverOpen && !disabled} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Country code: +${selectedOption.callingCode}. Click to change.`}
                id={id ? `${id}-country` : undefined}
                className={cn(
                  inputBaseStyles,
                  'inline-flex items-center justify-center shrink-0 w-[50px] cursor-pointer hover:bg-accent/50',
                  disabled && 'pointer-events-none opacity-50',
                )}
              >
                <span className="font-medium">+{selectedOption.callingCode}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={4} className="w-[280px] p-0">
              <Command shouldFilter={true} loop>
                <div className="border-b">
                  <CommandInput placeholder="Search country or code..." />
                </div>
                <CommandList>
                  <CommandEmpty>
                    No country found.
                  </CommandEmpty>
                  <CommandGroup>
                    {countryList.map((country) => (
                      <CommandItem
                        key={country.code}
                        value={country.search}
                        onSelect={() => selectCountry(country.code)}
                        className="flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground w-10">+{country.callingCode}</span>
                          <span>{country.name}</span>
                        </span>
                        {country.code === internalCountry && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Phone Number Input Field */}
          <input
            ref={nationalNumberRef}
            id={id}
            name={name}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={parsed.nationalNumber}
            onChange={handleNumberChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            placeholder={placeholder}
            aria-label="Mobile number"
            aria-invalid={!!error}
            className={cn(
              inputBaseStyles,
              'flex-1',
              error && 'border-destructive ring-destructive/20 dark:ring-destructive/40',
            )}
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
