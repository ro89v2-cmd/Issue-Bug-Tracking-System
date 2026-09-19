import IssueForm from '@/components/IssueForm';
import Link from 'next/link';

export default function NewIssuePage() {
  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/issues" className="hover:text-emerald-400">INCIDENTS</Link>
        <span>/</span>
        <span className="text-emerald-400 font-bold">LOG_NEW_ENTRY</span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
          ➕ RECORD NEW INCIDENT / BUG
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          บันทึกเหตุการณ์ความผิดพลาดหรือข้อกำหนดความปลอดภัยใหม่เข้าสู่ฐานข้อมูลส่วนกลาง
        </p>
      </div>

      <IssueForm />
    </div>
  );
}
