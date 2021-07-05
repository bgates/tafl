type ErrorProps = {
  display: boolean;
  message: string;
};
export const Error = ({ display, message }: ErrorProps) => (
  <div className="error" style={{ opacity: display ? "100%" : "0" }}>
    <h1 className="error-message">{message}</h1>
  </div>
);
