// 📁 components/GridButton.jsx
import { motion } from "framer-motion";
import styles from "./OneToFiftyGame.module.css";

export default function GridButton({ cell, idx, onClick, started }) {
  return (
    <button
      className={`${styles.gridBtn} ${styles.glass}`}
      onClick={() => onClick(idx)}
      disabled={cell.top === null || !started}
    >
      {cell.top && (
        <motion.span
          key={cell.top}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {cell.top}
        </motion.span>
      )}
    </button>
  );
}
