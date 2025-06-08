import React from "react";

type EnglishFlagProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const EnglishFlag: React.FC<EnglishFlagProps> = ({ className, ...props }) => (
  <svg width="107" height="81" viewBox="0 0 107 81" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <g clipPath="url(#clip0_12_2)">
      <path fillRule="evenodd" clipRule="evenodd" d="M0 0.110897V80.1109H107V0.110897H0Z" fill="#2E42A5" />
      <mask id="mask0_12_2" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="0" y="0" width="107" height="81">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 0.110897V80.1109H107V0.110897H0Z" fill="white" />
      </mask>
      <g mask="url(#mask0_12_2)">
        <path
          d="M-11.9138 74.3942L11.6329 84.3242L107.532 10.9042L119.954 -3.8491L94.7752 -7.16577L55.66 24.4709L24.1753 45.7909L-11.9138 74.3942Z"
          fill="white"
        />
        <path d="M-8.69379 81.3509L3.30693 87.1109L115.493 -5.2191H98.6506L-8.69379 81.3509Z" fill="#F50100" />
        <path
          d="M118.914 74.3942L95.3671 84.3242L-0.531643 10.9042L-12.9537 -3.8491L12.2248 -7.16577L51.3399 24.4709L82.8247 45.7909L118.914 74.3942Z"
          fill="white"
        />
        <path
          d="M118.111 79.3876L106.114 85.1476L58.3451 45.6142L44.181 41.2009L-14.1508 -3.7991H2.69505L60.99 40.1342L76.4749 45.4276L118.111 79.3876Z"
          fill="#F50100"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M66.1327 -6.55577H40.8673V26.7776H-6.59387V53.4442H40.8673V86.7776H66.1327V53.4442H113.781V26.7776H66.1327V-6.55577Z"
          fill="#F50100"
        />
        <mask id="mask1_12_2" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="-7" y="-7" width="121" height="94">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M66.1327 -6.55577H40.8673V26.7776H-6.59387V53.4442H40.8673V86.7776H66.1327V53.4442H113.781V26.7776H66.1327V-6.55577Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask1_12_2)">
          <path
            d="M40.8673 -6.55577V-13.2224H34.1798V-6.55577H40.8673ZM66.1327 -6.55577H72.8202V-13.2224H66.1327V-6.55577ZM40.8673 26.7776V33.4442H47.5548V26.7776H40.8673ZM-6.59387 26.7776V20.1109H-13.2814V26.7776H-6.59387ZM-6.59387 53.4442H-13.2814V60.1109H-6.59387V53.4442ZM40.8673 53.4442H47.5548V46.7776H40.8673V53.4442ZM40.8673 86.7776H34.1798V93.4442H40.8673V86.7776ZM66.1327 86.7776V93.4442H72.8202V86.7776H66.1327ZM66.1327 53.4442V46.7776H59.4452V53.4442H66.1327ZM113.781 53.4442V60.1109H120.469V53.4442H113.781ZM113.781 26.7776H120.469V20.1109H113.781V26.7776ZM66.1327 26.7776H59.4452V33.4442H66.1327V26.7776ZM40.8673 0.110897H66.1327V-13.2224H40.8673V0.110897ZM47.5548 26.7776V-6.55577H34.1798V26.7776H47.5548ZM-6.59387 33.4442H40.8673V20.1109H-6.59387V33.4442ZM0.0936279 53.4442V26.7776H-13.2814V53.4442H0.0936279ZM40.8673 46.7776H-6.59387V60.1109H40.8673V46.7776ZM47.5548 86.7776V53.4442H34.1798V86.7776H47.5548ZM66.1327 80.1109H40.8673V93.4442H66.1327V80.1109ZM59.4452 53.4442V86.7776H72.8202V53.4442H59.4452ZM113.781 46.7776H66.1327V60.1109H113.781V46.7776ZM107.094 26.7776V53.4442H120.469V26.7776H107.094ZM66.1327 33.4442H113.781V20.1109H66.1327V33.4442ZM59.4452 -6.55577V26.7776H72.8202V-6.55577H59.4452Z"
            fill="white"
          />
        </g>
      </g>
    </g>
    <defs>
      <clipPath id="clip0_12_2">
        <rect y="0.110897" width="107" height="80" rx="5" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default EnglishFlag;
