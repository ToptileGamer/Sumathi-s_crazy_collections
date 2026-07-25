import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

const TiltCard = ({ children, className = "", tiltDegree = 5, glare = true, scale = 1.02 }) => {
  return (
    <Tilt
      className={className}
      tiltMaxAngleX={tiltDegree}
      tiltMaxAngleY={tiltDegree}
      perspective={1000}
      transitionSpeed={400}
      scale={scale}
      glareEnable={glare}
      glareMaxOpacity={0.08}
      glareColor="#e91e8c"
      glarePosition="all"
      gyroscope={false}
    >
      {children}
    </Tilt>
  );
};

export { TiltCard };
export default TiltCard;
