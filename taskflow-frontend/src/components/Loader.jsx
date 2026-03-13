const Loader = ({ fullScreen = false, label = 'Loading' }) => (
    <div className={fullScreen ? 'fullscreen-loader' : 'inline-loader'}>
        <div className="spinner" />
        <span>{label}</span>
    </div>
);

export default Loader;
