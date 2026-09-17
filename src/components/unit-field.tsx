"use client"

import { PlusIcon } from "lucide-react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"

/**
 * Isian nama unit: daftar unit yang sudah ada, tetapi tetap boleh diketik bebas.
 *
 * Keduanya dibutuhkan sekaligus. Memilih dari daftar mencegah "Biro Akademik"
 * dan "Biro Administrasi Akademik" menjadi dua unit berbeda -- dan unit adalah
 * dasar pembatasan akses staf/dosen, jadi salah ketik berarti dokumen tidak
 * terlihat oleh pemiliknya. Sementara itu unit yang benar-benar baru harus
 * tetap bisa dibuat, karena dokumen pertamanya belum ada di mana pun.
 */
export function UnitField({
  id,
  value,
  onChange,
  units,
  disabled,
  readOnly,
  required,
  placeholder = "Biro Administrasi Akademik",
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  /** Nama unit yang sudah dipakai, sebagai saran. */
  units: string[]
  disabled?: boolean
  /** Unit terkunci (staf/dosen): tidak ada yang dapat dipilih. */
  readOnly?: boolean
  required?: boolean
  placeholder?: string
}) {
  const ketikan = value.trim()
  const sudahAda = units.some((u) => u.toLocaleLowerCase() === ketikan.toLocaleLowerCase())
  const baru = ketikan && !sudahAda ? ketikan : null
  const items = baru ? [...units, baru] : units

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
      items={items}
      value={value === "" ? null : value}
      onValueChange={(unit) => onChange(unit ?? "")}
      inputValue={value}
      onInputValueChange={onChange}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>Belum ada unit lain.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item === baru ? (
                <>
                  <PlusIcon />
                  Pakai “{item}”
                </>
              ) : (
                item
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
