import React from 'react';
import InputMask from 'react-input-mask';
import { Input } from '@/components/ui/input';

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, ...props }, ref) => (
    <InputMask mask={mask} {...props}>
      {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
        <Input {...inputProps} ref={ref} />
      )}
    </InputMask>
  )
);

MaskedInput.displayName = 'MaskedInput';
