const sanitizeKey = (key) => key.replace(/^\$|\./g, '');

const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        return value.trim();
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)])
        );
    }

    return value;
};

const sanitizeObject = (target) => {
    if (!target || typeof target !== 'object') {
        return;
    }

    Object.keys(target).forEach((key) => {
        const sanitizedKey = sanitizeKey(key);
        const sanitizedValue = sanitizeValue(target[key]);

        if (sanitizedKey !== key) {
            delete target[key];
        }

        target[sanitizedKey] = sanitizedValue;
    });
};

const sanitizeRequest = (req, res, next) => {
    sanitizeObject(req.body);
    sanitizeObject(req.params);
    sanitizeObject(req.query);

    next();
};

module.exports = {
    sanitizeRequest
};
