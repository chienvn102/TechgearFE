/**
 * PayOS Payment Dialog
 * Shows QR code, payment link, and polls payment status
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import QRCode from 'qrcode';
import { CreatePaymentResponse, VerifyPaymentResponse, PayOSStatus } from '@/types/payment.types';
import { paymentService } from '@/services/paymentService';
import { formatCurrency } from '@/utils/formatters';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface PayOSPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: CreatePaymentResponse['data'] | null;
  onSuccess: (orderCode: number) => void;
  onCancel?: () => void;
  orderId?: string; // For retry payment from order detail
  onTimeout?: () => void; // Handle timeout - save order and redirect
}

export default function PayOSPaymentDialog({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
  onCancel,
  orderId,
  onTimeout
}: PayOSPaymentDialogProps) {
  const [isPolling, setIsPolling] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [paymentStatus, setPaymentStatus] = useState<PayOSStatus | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopPollingRef = useRef<(() => void) | null>(null);

  /**
   * Generate QR Code Image from QR data string
   */
  useEffect(() => {
    if (paymentData?.qr_code) {
      const qrData = paymentData.qr_code;
      
      console.log('🔄 Generating QR code image from data:', qrData.substring(0, 50) + '...');
      
      // Generate QR code as data URL
      QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
        .then((url) => {
          setQrCodeImageUrl(url);
        })
        .catch((err) => {
          setError('Không thể tạo mã QR. Vui lòng sử dụng link thanh toán.');
        });
    }
  }, [paymentData?.qr_code]);

  /**
   * Countdown timer - 15 minutes timeout
   * Start when dialog opens and payment is not completed/cancelled
   */
  useEffect(() => {
    // Only start timer when dialog is open and not in a final state
    if (!isOpen) {
      return;
    }
    
    if (paymentStatus === PayOSStatus.PAID || paymentStatus === PayOSStatus.CANCELLED) {
      return;
    }
    
    if (isTimeout) {
      return;
    }

    console.log('⏱️ Starting countdown timer (15 minutes)');
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newValue = prev - 1;
        
        // Log every minute
        if (newValue % 60 === 0 && newValue > 0) {
          console.log(`⏱️ Countdown: ${Math.floor(newValue / 60)} minutes remaining`);
        }
        
        // Timeout reached
        if (newValue <= 0) {
          clearInterval(timer);
          setIsTimeout(true);
          setIsPolling(false);
          
          // Stop polling
          if (stopPollingRef.current) {
            stopPollingRef.current();
            stopPollingRef.current = null;
          }
          
          // Notify parent about timeout (defer to avoid setState in render)
          if (onTimeout) {
            setTimeout(() => {
              onTimeout();
            }, 0);
          }
          
          return 0;
        }
        
        return newValue;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, paymentStatus, isTimeout, onTimeout]);

  /**
   * Handle payment status update from polling
   */
  const handlePaymentUpdate = useCallback((response: VerifyPaymentResponse) => {
    const { payos_status, status } = response.data;
    
    setPaymentStatus(payos_status);

    // Payment completed
    if (payos_status === PayOSStatus.PAID && status === 'COMPLETED') {
      setIsPolling(false);
      
      // Stop polling
      if (stopPollingRef.current) {
        stopPollingRef.current();
        stopPollingRef.current = null;
      }
      
      setTimeout(() => {
        if (paymentData?.payos_order_code) {
          onSuccess(paymentData.payos_order_code);
        }
      }, 1500); // Small delay to show success message
    }

    // Payment cancelled
    if (payos_status === PayOSStatus.CANCELLED || status === 'CANCELLED') {
      setError('Thanh toán đã bị hủy');
      setIsPolling(false);
      
      if (stopPollingRef.current) {
        stopPollingRef.current();
        stopPollingRef.current = null;
      }
    }

    // Payment failed
    if (status === 'FAILED') {
      setError('Thanh toán thất bại');
      setIsPolling(false);
      
      if (stopPollingRef.current) {
        stopPollingRef.current();
        stopPollingRef.current = null;
      }
    }
  }, [onSuccess, paymentData?.payos_order_code]);

  /**
   * Start polling payment status
   */
  useEffect(() => {
    if (!isOpen || !paymentData || isPolling) return;
    
    console.log('📱 Payment Data:', {
      qr_code: paymentData.qr_code?.substring(0, 50) + '...',
      payment_link: paymentData.payment_link,
      order_code: paymentData.payos_order_code
    });
    
    setIsPolling(true);
    setPaymentStatus(null);
    setError(null);
    setIsTimeout(false);
    setCountdown(900); // Reset countdown

    // Start polling (returns stop function synchronously)
    const stopFn = paymentService.pollPaymentStatus(
      paymentData.payos_order_code,
      handlePaymentUpdate,
      3000 // Poll every 3 seconds
    );

    // Store stop function
    stopFn.then((stop) => {
      stopPollingRef.current = stop;
    });

    // Cleanup on unmount or when dialog closes
    return () => {
      if (stopPollingRef.current) {
        console.log('🛑 Stopping payment polling (cleanup)');
        stopPollingRef.current();
        stopPollingRef.current = null;
      }
    };
  }, [isOpen, paymentData, handlePaymentUpdate]);

  /**
   * Open payment link in new tab
   */
  const handleOpenPaymentLink = () => {
    if (paymentData?.payment_link) {
      window.open(paymentData.payment_link, '_blank', 'noopener,noreferrer');
    }
  };

  /**
   * Handle close dialog
   */
  const handleClose = () => {
    if (stopPollingRef.current) {
      stopPollingRef.current();
      stopPollingRef.current = null;
    }
    setIsPolling(false);
    setCountdown(900);
    setPaymentStatus(null);
    setError(null);
    setIsTimeout(false);
    onClose();
  };

  /**
   * Handle cancel payment
   */
  const handleCancelPayment = async () => {
    if (!paymentData) return;

    try {
      await paymentService.cancelPayment(paymentData.payos_order_code, {
        cancellationReason: 'Customer cancelled payment',
      });
      
      if (onCancel) {
        onCancel();
      }
      handleClose();
    } catch (error) {
      }
  };

  /**
   * Format countdown time
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!paymentData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thanh toán PayOS"
      size="lg"
      closeOnBackdrop={false}
      showCloseButton={!isPolling}
    >
      <div className="space-y-6">
        <p className="text-center text-gray-600">
          Quét mã QR hoặc mở link thanh toán để hoàn tất đơn hàng
        </p>

        {/* Payment Status */}
        <AnimatePresence mode="wait">
          {isTimeout ? (
            <motion.div
              key="timeout"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <ClockIcon className="w-20 h-20 text-orange-500" />
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 w-full">
                <p className="text-orange-700 font-semibold text-center mb-2">
                  ⏰ Hết thời gian thanh toán
                </p>
                <p className="text-orange-600 text-sm text-center">
                  Đơn hàng đã được lưu. Bạn có thể thanh toán sau bằng cách vào "Đơn hàng của tôi" và chọn "Thanh toán ngay".
                </p>
              </div>
              <Button
                onClick={handleClose}
                variant="customer"
                className="w-full"
              >
                Đóng và xem đơn hàng
              </Button>
            </motion.div>
          ) : paymentStatus === PayOSStatus.PAID ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <CheckCircleIcon className="w-20 h-20 text-green-500" />
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
                <p className="text-green-700 font-semibold text-center">
                  ✅ Thanh toán thành công! Đang chuyển hướng...
                </p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <XCircleIcon className="w-20 h-20 text-red-500" />
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
                <p className="text-red-700 font-semibold text-center">
                  {error}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Countdown Timer */}
              <div className={`flex items-center justify-center gap-2 ${
                countdown < 300 ? 'text-red-600' : 'text-blue-600'
              }`}>
                <ClockIcon className="w-5 h-5" />
                <span className="font-semibold text-lg">{formatTime(countdown)}</span>
              </div>

              {/* Low time warning */}
              {countdown < 300 && countdown > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                >
                  <p className="text-orange-700 text-sm text-center">
                    ⚠️ Còn dưới 5 phút! Vui lòng hoàn tất thanh toán ngay.
                  </p>
                </motion.div>
              )}

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-64 h-64 border-4 border-blue-500 rounded-lg p-2 bg-white flex items-center justify-center">
                  {qrCodeImageUrl ? (
                    <img
                      src={qrCodeImageUrl}
                      alt="Payment QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                </p>
              </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-semibold">{paymentData.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(paymentData.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã thanh toán:</span>
                    <span className="font-mono text-sm">{paymentData.payos_order_code}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={handleOpenPaymentLink}
                    variant="customer"
                    size="lg"
                    className="flex-1"
                  >
                    <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
                    Mở link thanh toán
                  </Button>
                  <Button
                    onClick={handleCancelPayment}
                    variant="outline"
                    size="lg"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Hủy thanh toán
                  </Button>
                </div>

                {/* Polling Indicator */}
                {isPolling && (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                    />
                    <span className="text-sm">Đang chờ xác nhận thanh toán...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Close button when error */}
          {error && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Đóng
              </Button>
            </div>
          )}
        </div>
      </Modal>
  );
}
