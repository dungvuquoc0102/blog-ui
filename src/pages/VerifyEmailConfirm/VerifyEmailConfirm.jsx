import { post } from "@/utils/httpRequest";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./VerifyEmailConfirm.module.scss";
import { Loading } from "@/components";

const VerifyEmailConfirm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const tokenData = await post("/auth/verify-email", { token });

        if (tokenData) {
          setIsSuccess(true);

          localStorage.setItem("accessToken", tokenData.accessToken);
          localStorage.setItem("refreshToken", tokenData.refreshToken);
        } else {
          setIsSuccess(false);
        }
      } catch (error) {
        lo;
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setIsSuccess(false);
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="md" text="Đang xác thực email..." />
      </div>
    );
  }

  console.log(isSuccess);
  return (
    <div className={styles.container}>
      {isSuccess && (
        <div>
          <p className={styles.success}>
            Xác thực email thành công! Bạn có thể quay lại trang chủ.
          </p>
          <button onClick={() => navigate("/")}>Về trang chủ</button>
        </div>
      )}
      {!isSuccess && (
        <div>
          <p className={styles.error}>
            Xác thực thất bại. Token không hợp lệ hoặc đã hết hạn.
          </p>
          <button onClick={() => navigate("/")}>Về trang chủ</button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailConfirm;
