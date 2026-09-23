"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { useT } from "@/lib/i18n"

/**
 * Isian nama unit: pilih salah satu unit resmi dari `GET /api/units`.
 *
 * Tidak ada lagi pilihan membuat unit baru dari sini. Unit menentukan dokumen
 * mana yang dicari saat mahasiswa memilih unit di menu chatbot, dan juga dasar
 * pembatasan akses staf/dosen -- ejaan di luar daftar resmi ditolak server.
 * Ketikan tetap diterima sebagai penyaring daftar; huruf besar-kecil tidak
 * berpengaruh karena server memetakannya ke ejaan resmi.
 */
export function UnitField({
  id,
  value,
  onChange,
  units,
  disabled,
  readOnly,
  required,
  placeholder,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  /** Nama unit resmi. */
  units: string[]
  disabled?: boolean
  /** Unit terkunci (staf/dosen): tidak ada yang dapat dipilih. */
  readOnly?: boolean
  required?: boolean
  placeholder?: string
}) {
  const t = useT()

  if (readOnly) {
    return (
      <Input
        id={id}
        value={value}
        readOnly
        required={required}
        disabled={disabled}
        onChange={() => {}}
      />
    )
  }

  return (
    <Combobox
      items={units}
      value={value === "" ? null : value}
      onValueChange={(unit) => onChange(unit ?? "")}
      inputValue={value}
      onInputValueChange={onChange}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        required={required}
        placeholder={placeholder ?? t.unitField.placeholder}
        autoComplete="off"
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>{t.unitField.empty}</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
