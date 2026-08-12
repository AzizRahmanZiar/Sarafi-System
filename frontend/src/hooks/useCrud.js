// src/hooks/useCrud.js
import { useState, useCallback } from 'react';
import { useApi } from './useApi';

/**
 * useCrud hook - Provides CRUD operations for a resource
 * 
 * @param {string} baseUrl - Base URL for the resource
 * @returns {object} { items, loading, error, fetchItems, createItem, updateItem, deleteItem }
 */
export const useCrud = (baseUrl) => {
    const { loading, error, get, post, put, delete: del } = useApi();
    const [items, setItems] = useState([]);

    // Fetch all items
    const fetchItems = useCallback(async (params = {}) => {
        try {
            const response = await get(baseUrl, params);
            if (response?.success) {
                const data = response.data || [];
                setItems(Array.isArray(data) ? data : []);
                return data;
            }
            setItems([]);
            return [];
        } catch (error) {
            console.error('Error fetching items:', error);
            setItems([]);
            return [];
        }
    }, [baseUrl, get]);

    // Create a new item
    const createItem = useCallback(async (data, endpoint = '') => {
        const url = endpoint || baseUrl;
        const response = await post(url, data);
        
        if (response?.success) {
            const newItem = response.data;
            setItems(prev => [newItem, ...prev]);
            return newItem;
        }
        
        throw new Error(response?.message || 'Failed to create item');
    }, [baseUrl, post]);

    // Update an item
    const updateItem = useCallback(async (id, data) => {
        const response = await put(`${baseUrl}/${id}`, data);
        
        if (response?.success) {
            const updatedItem = response.data;
            setItems(prev => prev.map(item => 
                item.id === id ? updatedItem : item
            ));
            return updatedItem;
        }
        throw new Error(response?.message || 'Failed to update item');
    }, [baseUrl, put]);

    // Delete an item
    const deleteItem = useCallback(async (id) => {
        const response = await del(`${baseUrl}/${id}`);
        
        if (response?.success) {
            setItems(prev => prev.filter(item => item.id !== id));
            return true;
        }
        throw new Error(response?.message || 'Failed to delete item');
    }, [baseUrl, del]);

    return {
        items,
        loading,
        error,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
        setItems,
    };
};