// Input masking utilities

export const maskSSN = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as XXX-XX-XXXX
    if (digits.length <= 3) {
        return digits;
    } else if (digits.length <= 5) {
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
    }
};

export const maskAccountNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Limit to reasonable account number length (typically 8-17 digits)
    return digits.slice(0, 17);
};

export const maskRoutingNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Routing numbers are exactly 9 digits
    return digits.slice(0, 9);
};

export const maskPhone = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
        return digits;
    } else if (digits.length <= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
};

export const unmask = (value: string): string => {
    // Remove all non-digits
    return value.replace(/\D/g, '');
};
