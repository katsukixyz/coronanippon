import React from "react";
import { FaGithub } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <a target="_blank" href="https://github.com/katsukixyz/coronanippon">
        <FaGithub fontSize={22} />
      </a>
    </div>
  );
};

export default Footer;
