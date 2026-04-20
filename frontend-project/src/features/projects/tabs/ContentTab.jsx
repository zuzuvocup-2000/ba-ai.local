import { Textarea } from '../../../components/ui/textarea'

const FIELDS = [
  { key: 'what', label: 'What — Dự án này là gì?', placeholder: 'Mô tả sản phẩm / hệ thống được xây dựng...' },
  { key: 'why', label: 'Why — Vì sao làm dự án này?', placeholder: 'Vấn đề cần giải quyết, mục tiêu kinh doanh, giá trị mang lại...' },
  { key: 'who', label: 'Who — Ai tham gia / ai sử dụng?', placeholder: 'Đối tượng người dùng, các bên liên quan, team thực hiện...' },
  { key: 'when', label: 'When — Khi nào?', placeholder: 'Mốc thời gian, deadline, giai đoạn triển khai...' },
  { key: 'where', label: 'Where — Triển khai ở đâu?', placeholder: 'Môi trường, khu vực, nền tảng phân phối...' },
  { key: 'how', label: 'How — Làm như thế nào?', placeholder: 'Phương pháp tiếp cận, quy trình, công nghệ chính...' },
]

export function ContentTab({ value = {}, onChange }) {
  const set = (key, v) => onChange({ ...value, [key]: v })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Nội dung dự án (5W – 1H)</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Mô tả dự án theo công thức 5W – 1H để có bức tranh tổng quan đầy đủ.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <Textarea
            key={f.key}
            label={f.label}
            placeholder={f.placeholder}
            value={value[f.key] ?? ''}
            onChange={(e) => set(f.key, e.target.value)}
            rows={3}
          />
        ))}
      </div>
    </div>
  )
}
