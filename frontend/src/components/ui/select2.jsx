import Select from 'react-select'

export function Select2({ options, value, onChange, placeholder = 'Chọn...', isMulti = false }) {
  return (
    <Select
      isMulti={isMulti}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      classNamePrefix="ba-select2"
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: '44px',
          borderRadius: '0.75rem',
          borderColor: state.isFocused ? '#a5b4fc' : '#e2e8f0',
          boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.18)' : 'none',
          '&:hover': { borderColor: '#cbd5e1' },
          backgroundColor: '#fff',
          padding: '2px',
        }),
        multiValue: (base) => ({
          ...base,
          borderRadius: '999px',
          backgroundColor: '#eef2ff',
          border: '1px solid #e0e7ff',
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: '#4338ca',
          fontWeight: 600,
          fontSize: '12px',
          paddingLeft: '10px',
          paddingRight: '6px',
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: '#4338ca',
          borderRadius: '999px',
          ':hover': {
            backgroundColor: '#c7d2fe',
            color: '#312e81',
          },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? '#eef2ff' : '#fff',
          color: '#334155',
          cursor: 'pointer',
        }),
        menu: (base) => ({
          ...base,
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
        }),
      }}
      noOptionsMessage={() => 'Không có dữ liệu'}
    />
  )
}

