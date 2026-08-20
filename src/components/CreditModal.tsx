import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const linkClass = 'text-indigo-300 hover:text-indigo-200 underline underline-offset-2 font-semibold transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-modal-title"
        className="max-w-md w-full max-h-[85vh] overflow-y-auto rounded-2xl p-5 sm:p-6 bg-slate-900/95 border border-white/10 shadow-2xl relative text-slate-100 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card 1: Credit & Usage Terms */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white/5 border border-white/10 pr-10">
          <h2 id="credit-modal-title" className="font-bold text-white text-sm sm:text-base mb-2.5">
            ✨ 제작: 두리쌤
          </h2>
          <h3 className="font-semibold text-slate-200 text-xs sm:text-sm mb-1.5">
            📌 이용 조건
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <li>교육 목적으로 자유롭게 사용하실 수 있습니다.</li>
            <li>재배포 시 출처(제작자 표기)를 유지해주세요.</li>
            <li>코드를 임의로 수정한 버전을 다시 배포하지 말아주세요.</li>
            <li>수정이 필요하시면 아래 연락처로 요청해주세요.</li>
          </ul>
        </div>

        {/* Card 2: Contact */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="font-semibold text-slate-200 text-xs sm:text-sm mb-1.5">
            📷 문의
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <li>
              Instagram:{' '}
              <a href="https://www.instagram.com/trdoolee" target="_blank" rel="noopener noreferrer" className={linkClass}>
                trdoolee
              </a>
            </li>
            <li>
              Blog:{' '}
              <a href="https://blog.naver.com/trdoolee" target="_blank" rel="noopener noreferrer" className={linkClass}>
                blog.naver.com/trdoolee
              </a>
            </li>
          </ul>
          <p className="text-[10px] sm:text-xs text-slate-500 italic mt-2.5">
            간단한 질문 위주로 답변드리며, 답변이 늦어질 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
