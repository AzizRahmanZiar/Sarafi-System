// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import api from '../api/axios';

/**
 * useApi hook - Handles API requests with loading and error states
 * 
 * @returns {object} { loading, error, get, post, put, delete, patch }
 */
export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Generic request handler
    const handleRequest = useCallback(async (requestFn) => {
        try {
            setLoading(true);
            setError(null);
            const response = await requestFn();
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // GET request
    const get = useCallback(async (url, params = {}) => {
        return handleRequest(() => api.get(url, { params }));
    }, [handleRequest]);

    // POST request
    const post = useCallback(async (url, data) => {
        return handleRequest(() => api.post(url, data));
    }, [handleRequest]);

    // PUT request
    const put = useCallback(async (url, data) => {
        return handleRequest(() => api.put(url, data));
    }, [handleRequest]);

    // DELETE request
    const del = useCallback(async (url) => {
        return handleRequest(() => api.delete(url));
    }, [handleRequest]);

    // PATCH request
    const patch = useCallback(async (url, data) => {
        return handleRequest(() => api.patch(url, data));
    }, [handleRequest]);

    return {
        loading,
        error,
        get,
        post,
        put,
        delete: del,
        patch,
        setError,
    };
};