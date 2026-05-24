'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Label } from './Label';
import { Separator } from './Separator';
import { cn } from '../lib/utils';

const fieldVariants = cva('cn-field group/field flex w-full', {
  variants: {
    orientation: {
      vertical:
        'cn-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto',
      horizontal:
        'cn-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      responsive:
        'cn-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export interface FieldProps extends React.ComponentProps<'div'>, VariantProps<typeof fieldVariants> {}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      ref={ref}
      {...props}
    />
  ),
);
Field.displayName = 'Field';

export interface FieldGroupProps extends React.ComponentProps<'div'> {}

export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="field-group"
      className={cn('cn-field-group group/field-group @container/field-group flex w-full flex-col gap-2 sm:gap-3', className)}
      ref={ref}
      {...props}
    />
  ),
);
FieldGroup.displayName = 'FieldGroup';

export interface FieldLabelProps extends React.ComponentProps<typeof Label> {}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, ...props }, ref) => (
    <Label
      data-slot="field-label"
      className={cn('cn-field-label group/field-label peer/field-label flex w-fit mb-1.5 sm:mb-2', 'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col', className)}
      ref={ref}
      {...props}
    />
  ),
);
FieldLabel.displayName = 'FieldLabel';

export interface FieldDescriptionProps extends React.ComponentProps<'p'> {}

export const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      data-slot="field-description"
      className={cn('cn-field-description leading-normal font-normal group-has-data-horizontal/field:text-balance', 'last:mt-0 nth-last-2:-mt-1', '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary', className)}
      ref={ref}
      {...props}
    />
  ),
);
FieldDescription.displayName = 'FieldDescription';

export interface FieldSeparatorProps extends React.ComponentProps<'div'> {
  children?: React.ReactNode;
}

export const FieldSeparator = React.forwardRef<HTMLDivElement, FieldSeparatorProps>(
  ({ children, className, ...props }, ref) => (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn('cn-field-separator relative', className)}
      ref={ref}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="cn-field-separator-content relative mx-auto block w-fit bg-background"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  ),
);
FieldSeparator.displayName = 'FieldSeparator';

export interface FieldErrorProps extends React.ComponentProps<'div'> {
  errors?: Array<{ message?: string } | undefined>;
  children?: React.ReactNode;
}

export const FieldError = React.forwardRef<HTMLDivElement, FieldErrorProps>(
  ({ className, children, errors, ...props }, ref) => {
    const content = React.useMemo(() => {
      if (children) {
        return children;
      }

      if (!errors?.length) {
        return null;
      }

      const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

      if (uniqueErrors?.length === 1) {
        return uniqueErrors[0]?.message;
      }

      return (
        <ul className="ml-4 flex list-disc flex-col gap-1">
          {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
        </ul>
      );
    }, [children, errors]);

    if (!content) {
      return null;
    }

    return (
      <div
        role="alert"
        data-slot="field-error"
        className={cn('cn-field-error font-normal', className)}
        ref={ref}
        {...props}
      >
        {content}
      </div>
    );
  },
);
FieldError.displayName = 'FieldError';