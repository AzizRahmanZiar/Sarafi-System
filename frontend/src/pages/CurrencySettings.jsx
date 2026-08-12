import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CurrencySettings = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to the main currencies page
        navigate('/dashboard/currencies', { replace: true });
    }, [navigate]);

    return null;
};

export default CurrencySettings;