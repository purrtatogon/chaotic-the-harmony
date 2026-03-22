import Button from './Button';

const Error = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <p className="error-message">{message || 'An error occurred'}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};

export default Error;


