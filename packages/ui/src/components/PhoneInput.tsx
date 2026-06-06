'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
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
  className?: string;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
}

const ALL_COUNTRIES = getCountries() as readonly CountryCode[];

function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

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
  flag: string;
  search: string;
}

function buildCountryList(countries: readonly CountryCode[]): CountryOption[] {
  return [...countries]
    .map((code) => ({
      code,
      callingCode: getCountryCallingCode(code),
      name: getCountryName(code),
      flag: getCountryFlag(code),
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
      placeholder = 'Enter 10-digit mobile number',
      className,
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

    return (
      <div
        ref={ref}
        className={cn('phone-field', error && 'phone-field--error', disabled && 'phone-field--disabled', className)}
      >
        <div className="phone-field__inner">
          <Popover open={popoverOpen && !disabled} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className="phone-field__country-trigger"
                aria-label="Select country code"
                id={id ? `${id}-country` : undefined}
              >
                <span className="phone-field__country-flag">{selectedOption.flag}</span>
                <span className="phone-field__country-code">+{selectedOption.callingCode}</span>
                <ChevronDown className="phone-field__country-chevron" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="phone-field__country-popover" align="start" sideOffset={4}>
              <Command shouldFilter={true} loop>
                <div className="phone-field__search-header">
                  <CommandInput placeholder="Search country or code..." />
                </div>
                <CommandList>
                  <CommandEmpty className="phone-field__search-empty">
                    No country found.
                  </CommandEmpty>
                  <CommandGroup className="phone-field__country-list">
                    {countryList.map((country) => (
                      <CommandItem
                        key={country.code}
                        value={country.search}
                        onSelect={() => selectCountry(country.code)}
                        className="phone-field__country-item"
                      >
                        <span className="phone-field__country-item-flag">{country.flag}</span>
                        <span className="phone-field__country-item-code">+{country.callingCode}</span>
                        <span className="phone-field__country-item-name">{country.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

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
            className="phone-field__number-input"
            aria-label="Mobile number"
          />
        </div>

        {error && (
          <p className="phone-field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
