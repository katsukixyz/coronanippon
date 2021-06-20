import React from "react";
import Logo from "../../japanapp.svg";

interface HeaderProps {
  style?: React.CSSProperties;
}

const LogoHeader: React.FC<HeaderProps> = ({ style }) => {
  return (
    <div className="logo" style={style}>
      <img src={Logo} width={100} height={100} alt="logo" />
    </div>
  );
};

export default LogoHeader;
