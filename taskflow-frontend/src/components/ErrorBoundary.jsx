import { Component } from 'react';

class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('[UI] Render error:', error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="error-fallback">
                    <div className="error-fallback-panel">
                        <p className="eyebrow">TaskFlow</p>
                        <h1>Something interrupted the workspace.</h1>
                        <p>{this.state.error.message || 'The page could not render.'}</p>
                        <button className="primary-button" type="button" onClick={() => window.location.reload()}>
                            Reload app
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
