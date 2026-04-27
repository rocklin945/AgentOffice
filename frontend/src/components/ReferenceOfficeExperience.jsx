import React, { useState } from 'react';

export default function ReferenceOfficeExperience() {
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  return (
    <>
      <div className="relative mx-auto w-full max-w-[1536px] overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <img
          src="/reference/office-reference.png"
          alt="虚拟办公室界面"
          className="block h-auto w-full"
          draggable="false"
        />

        <button
          type="button"
          aria-label="打开创建员工"
          onClick={() => setShowCreatePanel(true)}
          className="absolute left-[74.8%] top-[57.8%] h-[11.2%] w-[8.6%] rounded-[18px] bg-transparent"
        />
      </div>

      {showCreatePanel && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-[rgba(15,23,42,0.18)] backdrop-blur-[1px]">
          <button
            type="button"
            aria-label="关闭创建员工"
            className="absolute inset-0 cursor-default"
            onClick={() => setShowCreatePanel(false)}
          />
          <div className="relative h-full w-full max-w-[420px] bg-transparent">
            <img
              src="/reference/create-employee-reference.png"
              alt="创建新员工"
              className="h-full w-full object-contain object-right-top"
              draggable="false"
            />
            <button
              type="button"
              aria-label="关闭"
              onClick={() => setShowCreatePanel(false)}
              className="absolute right-[3%] top-[2%] h-10 w-10 rounded-full bg-transparent"
            />
          </div>
        </div>
      )}
    </>
  );
}
