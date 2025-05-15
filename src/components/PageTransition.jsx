import { motion } from "framer-motion";
const MotionDiv = motion.div;

const PageTransition = ({ children, className }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
};

export default PageTransition;
