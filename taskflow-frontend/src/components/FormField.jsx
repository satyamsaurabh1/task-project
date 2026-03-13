const FormField = ({
    children,
    error,
    label,
}) => (
    <label className="field">
        <span className="field-label">{label}</span>
        {children}
        {error ? <span className="field-error">{error}</span> : null}
    </label>
);

export default FormField;
