/**
 * @fileoverview The OTP input component.
 */
import React, { useState, useRef, useEffect } from "react";
import { Input } from "antd";
import styles from "./OTPInput.module.css";

interface OTPInputProps {
  length?: number;
  onChange?: (otp: string) => void;
  onComplete?: (otp: string) => void;
  isInvalid?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onChange,
  onComplete,
  isInvalid,
}) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>(
    Array(length).fill(null)
  );
  // use ref to track if onComplete has been called
  const hasCompletedRef = useRef(false);
  // use ref to track if the input is locked (during verification)
  const isLockingRef = useRef(false);

  useEffect(() => {
    const otpValue = otp.join("");
    onChange && onChange(otpValue);

    // check if all digits have been input and onComplete has not been triggered
    if (
      otpValue.length === length &&
      otp.every((digit) => digit !== "") &&
      !hasCompletedRef.current &&
      !isLockingRef.current
    ) {
      hasCompletedRef.current = true;
      isLockingRef.current = true;

      // use setTimeout to ensure the state is updated before calling onComplete
      setTimeout(() => {
        onComplete && onComplete(otpValue);
      }, 0);
    }
  }, [otp, onChange, onComplete, length]);

  // when the input is invalid, reset the state
  useEffect(() => {
    if (isInvalid) {
      setOtp(Array(length).fill(""));
      hasCompletedRef.current = false;
      isLockingRef.current = false;
      inputsRef.current[0]?.focus();
    }
  }, [isInvalid, length]);

  const handleChange = (index: number, value: string) => {
    // if the input is locked, do not allow modification
    if (isLockingRef.current) return;

    // only allow input digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // after input, automatically jump to the next input box
    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // if the input is locked, do not allow modification
    if (isLockingRef.current) return;

    // if the backspace key is pressed and the current input is empty, focus on the previous input box
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className={styles.otpContainer}>
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          maxLength={1}
          className={`${styles.otpInput} ${isInvalid ? styles.invalid : ""}`}
          disabled={isLockingRef.current}
        />
      ))}
    </div>
  );
};

export default OTPInput;
