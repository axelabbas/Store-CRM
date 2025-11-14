import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        window.location.href = '/';
    };

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                                <div>
                                    <CardTitle className="text-2xl">Something went wrong</CardTitle>
                                    <CardDescription className="mt-1">
                                        An unexpected error occurred. We apologize for the inconvenience.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {this.state.error && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-semibold mb-2">Error Details:</p>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        {this.state.error.toString()}
                                    </p>
                                </div>
                            )}

                            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                                <details className="p-4 bg-muted rounded-lg">
                                    <summary className="text-sm font-semibold cursor-pointer mb-2">
                                        Stack Trace (Development Only)
                                    </summary>
                                    <pre className="text-xs text-muted-foreground overflow-auto max-h-64 mt-2">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button onClick={this.handleReset} className="flex-1">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Return to Home
                                </Button>
                                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                                    Reload Page
                                </Button>
                            </div>

                            <div className="text-xs text-muted-foreground text-center pt-2">
                                If this problem persists, please contact support or check the browser console for more details.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
