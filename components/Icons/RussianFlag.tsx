type RussianFlagProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const RussianFlag: React.FC<RussianFlagProps> = ({ className, ...props }) => (
  <svg width="111" height="81" viewBox="0 0 111 81" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <g clipPath="url(#clip0_25_2)">
      <path
        d="M98.6667 0.5H12.3333C9.06233 0.5 5.9253 1.79062 3.61235 4.08794C1.2994 6.38526 0 9.5011 0 12.75L0 25H111V12.75C111 9.5011 109.701 6.38526 107.388 4.08794C105.075 1.79062 101.938 0.5 98.6667 0.5Z"
        fill="#EEEEEE"
      />
      <path d="M0 25H111V56H0V25Z" fill="#22408C" />
      <path
        d="M111 68.25C111 71.4989 109.701 74.6147 107.388 76.9121C105.075 79.2094 101.938 80.5 98.6667 80.5H12.3333C9.06233 80.5 5.9253 79.2094 3.61235 76.9121C1.2994 74.6147 0 71.4989 0 68.25V56H111V68.25Z"
        fill="#CE2028"
      />
    </g>
    <defs>
      <clipPath id="clip0_25_2">
        <rect width="111" height="80" fill="white" transform="translate(0 0.5)" />
      </clipPath>
    </defs>
  </svg>
);

export default RussianFlag;
