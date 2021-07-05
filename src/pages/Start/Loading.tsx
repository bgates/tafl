export const Loading = ({ loading }: { loading: boolean }) => {
  return (
    <div className="loader" style={{ display: loading ? "flex" : "none" }}>
      <i className="fa fa-spinner fa-pulse fa-4x fa-fw"></i>
      <span style={{ userSelect: "none" }}>Loading...</span>
    </div>
  );
};
