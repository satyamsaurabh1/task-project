import { useState } from 'react';

const useAsyncAction = (initialLoading = false) => {
    const [loading, setLoading] = useState(initialLoading);

    const run = async (action) => {
        setLoading(true);

        try {
            return await action();
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        run,
        setLoading,
    };
};

export default useAsyncAction;
