import React, { useState } from "react";
import styles from "../Styles/Developer.module.scss";
import { RiHomeSmileLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Developers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([
    {
      name: "Aditya Singh",
      role: "Lead Full Stack Developer",
      img: "https://via.placeholder.com/150",
    },
    {
      name: "Ankit Pal",
      role: "Model Integration + Refinement",
      img: "https://via.placeholder.com/150",
    },
    {
      name: "Sonam Yadav",
      role: "Database Flow + UI/UX + Documentation",
      img: "https://via.placeholder.com/150",
    },
    {
      name: "Greeshma Shetty",
      role: "Backend Model Implementation + UI/UX + Documentation",
      img: "https://via.placeholder.com/150",
    },
  ]);
  return (
    <div className={styles.main}>
      <div
        className={styles.backtoHome}
        onClick={() => {
          navigate("/");
        }}
      >
        <p>Back to Home</p>
        <RiHomeSmileLine />
      </div>
      <h1>OUR</h1>
      <h2>
        <span>CREATIVE</span> TEAM
      </h2>
      <p>
        This is the team that worked on the project. We had different roles and
        responsibilities but we worked together to make this project a success.
      </p>
      <div className={styles.memberWrapper}>
        {members.map((member, index) => (
          <div className={styles.member} key={index}>
            <h3>{member.name}</h3>
            <p>{member.role}</p>
            <div className={styles.image}>
              <img src={member.img} alt={member.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Developers;
