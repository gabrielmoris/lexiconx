import React from "react";
import LexiconxLogo from "../Icons/LexiconxLogo";

const LoadingComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center h-80">
      <LexiconxLogo className="w-15 h-15 animate-spin" />
    </div>
  );
};

export default LoadingComponent;
