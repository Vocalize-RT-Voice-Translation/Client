import React, { useEffect, useState } from "react";
import styles from "../Styles/Home.module.scss";
import Navbar from "../Components/Navbar.jsx";
import hero from "../Assets/hero-img.svg";
import FeatureOne from "../Components/FeatureOne.jsx";
import LocomotiveScroll from "locomotive-scroll";
import Meet from "../Components/Meet.jsx";
import Animation from "../Components/Animation.jsx";
import { useNavigate } from "react-router-dom";
import ModalVideo from "react-modal-video";
import "../../node_modules/react-modal-video/scss/modal-video.scss";

const Home = () => {
  const navigate = useNavigate();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const locomotiveScroll = new LocomotiveScroll({
      smooth: true,
      smoothMobile: true,
      getDirection: true,
      getSpeed: true,
      easing: [0.25, 0.0, 0.35, 1.0],
    });

    return () => {
      if (locomotiveScroll) locomotiveScroll.destroy();
    };
  }, []);

  const disableImageDrag = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const images = document.querySelectorAll("img");
    images.forEach((image) => {
      image.addEventListener("dragstart", disableImageDrag);
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener("dragstart", disableImageDrag);
      });
    };
  }, []);

  return (
    <>
      <div className={styles.main}>
        <ModalVideo
          channel="youtube"
          youtube={{ mute: 0, autoplay: 1 }}
          isOpen={isOpen}
          videoId="99bwj5wbi4c"
          onClose={() => setOpen(false)}
        />
        <Navbar />
        <div className={styles.hero}>
          <div className={styles.left}>
            <h2>Meet without worrying about language</h2>
            <p>
              Use Vocalize to get a new experience in doing 1-1 video calls,
              meetings, and conferences. We'll take care of the language.
            </p>
            <div className={styles.buttonWrapper}>
              <div
                className={styles.button}
                onClick={() => {
                  navigate("/meeting");
                }}
              >
                Try Vocalize
              </div>
              <p
                onClick={() => {
                  setOpen(true);
                }}
              >
                Watch the Demo
              </p>
            </div>
          </div>
          <div className={styles.right}>
            <img src={hero} alt="" />
          </div>
        </div>
      </div>
      <FeatureOne />
      <Meet />
      <Animation />
    </>
  );
};

export default Home;
