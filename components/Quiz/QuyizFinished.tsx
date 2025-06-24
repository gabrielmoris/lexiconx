const QuyizFinished = ({ isSuccess }: { isSuccess: boolean }) => {
  if (isSuccess) {
    return <div>Success</div>;
  }

  if (!isSuccess) {
    return <div>Failure</div>;
  }
};

export default QuyizFinished;
