'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-lg">Something went wrong</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    An unexpected error occurred. This has been logged and our team will
                    investigate.
                  </p>
                  {this.state.error && (
                    <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-800">
                      <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                        {this.state.error.message}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={this.handleReset} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                    <Button onClick={() => window.location.reload()} className="gap-2">
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
