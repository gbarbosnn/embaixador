import * as React from 'react';

declare module 'react-input-mask' {
  export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    children?: (inputProps: React.InputHTMLAttributes<HTMLInputElement>) => React.ReactNode;
  }
}
