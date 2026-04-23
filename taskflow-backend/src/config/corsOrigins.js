const DEFAULT_DEV_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

const getAllowedOrigins = () => {
    const configuredOrigins = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map((value) => value.trim()).filter(Boolean)
        : [];

    return [...new Set([...configuredOrigins, ...DEFAULT_DEV_ORIGINS])];
};

module.exports = {
    getAllowedOrigins
};
