// src/utils/validation.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate password (min 6 characters)
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
export const validatePassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Validate required field
 * @param {any} value - Value to check
 * @returns {boolean} True if not empty
 */
export const validateRequired = (value) => {
    return value && value.toString().trim().length > 0;
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const validatePhone = (phone) => {
    if (!phone) return true;
    const regex = /^[\d\s\-+()]{7,15}$/;
    return regex.test(phone);
};

/**
 * Validate currency code (3 uppercase letters)
 * @param {string} code - Currency code to validate
 * @returns {boolean} True if valid
 */
export const validateCurrencyCode = (code) => {
    return /^[A-Z]{3}$/.test(code);
};

/**
 * Validate password match
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} True if they match
 */
export const validatePasswordMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};