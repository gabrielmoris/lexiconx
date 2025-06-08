import React from "react";

type GermanFlagProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const GermanFlag: React.FC<GermanFlagProps> = ({ className, ...props }) => (
  <svg width="111" height="81" viewBox="0 0 111 81" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <g clipPath="url(#clip0_12_18)">
      <path
        d="M98.6667 0.110897H12.3333C9.06233 0.110897 5.9253 1.35957 3.61235 3.58222C1.2994 5.80488 0 8.81944 0 11.9627L0 26.7776H111V11.9627C111 8.81944 109.701 5.80488 107.388 3.58222C105.075 1.35957 101.938 0.110897 98.6667 0.110897Z"
        fill="#141414"
      />
      <path d="M0 26.7776H111V53.4442H0V26.7776Z" fill="#ED1F24" />
      <path
        d="M0 66.7776C0 70.3138 1.2994 73.7052 3.61235 76.2057C5.9253 78.7061 9.06233 80.1109 12.3333 80.1109H98.6667C101.938 80.1109 105.075 78.7061 107.388 76.2057C109.701 73.7052 111 70.3138 111 66.7776V53.4442H0V66.7776Z"
        fill="#FFCD05"
      />
    </g>
    <defs>
      <clipPath id="clip0_12_18">
        <rect y="0.110897" width="111" height="80" rx="5" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default GermanFlag;
