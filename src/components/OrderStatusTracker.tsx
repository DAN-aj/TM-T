/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Box, Truck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { OrderStatus } from '../types';

interface OrderStatusTrackerProps {
  status: OrderStatus;
  orderId: number;
}

export default function OrderStatusTracker({ status, orderId }: OrderStatusTrackerProps) {
  // Định nghĩa 4 bước tiến trình chính
  const steps = [
    { key: 'pending', label: 'Chờ xác nhận', icon: Clock },
    { key: 'processing', label: 'Đã đóng gói', icon: Box },
    { key: 'shipped', label: 'Đang giao', icon: Truck },
    { key: 'delivered', label: 'Hoàn thành', icon: CheckCircle2 },
  ];

  // Trả về số thứ tự của trạng thái hiện tại (1-indexed)
  const getStatusIndex = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 0; // Cancelled hoặc không xác định
    }
  };

  const currentIndex = getStatusIndex(status);

  // Nếu đơn hàng đã huỷ bỏ, hiển thị giao diện báo lỗi đặc thù tuyệt mật
  if (status === 'cancelled') {
    return (
      <div 
        className="bg-red-50/70 border border-red-150 rounded-2xl p-4 flex items-center space-x-3.5"
        id={`order_status_cancelled_${orderId}`}
      >
        <div className="bg-red-100 p-2.5 rounded-full shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="text-left">
          <h4 className="text-xs font-bold text-red-700">Đơn hàng này đã bị hủy bỏ!</h4>
          <p className="text-[10px] text-red-600/80 mt-0.5">Số kho sản phẩm cũ đã được hoàn trả, hợp đồng bảo hành đính kèm đã kết thúc hiệu năng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-1" id={`order_status_tracker_${orderId}`}>
      {/* Container của thanh tiến trình */}
      <div className="relative flex items-center justify-between">
        
        {/* Đường nối ngang toàn diện */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-slate-100 z-0">
          {/* Đường dẫn tiến độ bừng sáng */}
          <div 
            className="h-full bg-cyan-600 transition-all duration-700 ease-in-out" 
            style={{ width: `${currentIndex > 1 ? ((currentIndex - 1) / (steps.length - 1)) * 100 : 0}%` }}
          />
        </div>

        {/* Các nốt tròn đại diện cho 4 bước */}
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentIndex;
          const isActive = stepNumber === currentIndex;
          const isUpcoming = stepNumber > currentIndex;
          
          const IconComponent = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
              {/* Vòng tròn nốt */}
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-100' 
                    : isActive 
                    ? 'bg-slate-900 border-2 border-cyan-500 scale-110 text-cyan-400 ring-4 ring-cyan-50 shadow-md' 
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
                title={step.label}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              </div>

              {/* Tên bước nhỏ gọn bên dưới */}
              <span 
                className={`text-[9.5px] mt-2 font-bold whitespace-nowrap text-center transition-colors duration-300 ${
                  isActive 
                    ? 'text-cyan-650 text-cyan-600 font-extrabold' 
                    : isCompleted 
                    ? 'text-slate-800' 
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
