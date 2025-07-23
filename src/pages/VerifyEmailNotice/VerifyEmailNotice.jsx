import { useLocation } from "react-router-dom";
import styles from "./VerifyEmailNotice.module.scss";

const VerifyEmailNotice = () => {
  const location = useLocation();
  const { email, message } = location.state;

  if (!email) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Xác thực email</h2>
      {message && <p className={styles.message}>{message}</p>}
      {email && (
        <p className={styles.message}>
          Chúng tôi đã gửi email xác thực đến:{" "}
          <span className={styles.email}>{email}</span>
        </p>
      )}
    </div>
  );
};

export default VerifyEmailNotice;
