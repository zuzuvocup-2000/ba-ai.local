import { RichEditor } from '../../../components/ui/rich-editor'

export function MainFlowTab({ value = '', onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Flow chính của dự án</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Mô tả luồng nghiệp vụ chính — từ người dùng bắt đầu đến khi hoàn tất mục tiêu.
        </p>
      </div>

      <RichEditor
        value={value}
        onChange={onChange}
        placeholder="Ví dụ: 1) Khách truy cập trang chủ → 2) Chọn sản phẩm → 3) Thanh toán → 4) Xác nhận đơn..."
        minHeight={280}
      />
    </div>
  )
}
